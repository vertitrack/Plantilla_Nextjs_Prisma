import "server-only";
import type { Char, JsonValue } from "@prisma/orm-postgres/target/codec-types";
import {
	type CvAnalysis,
	emptyProfile,
	type InterviewQuestion,
	type InterviewStage,
	JOB_STATUSES,
	type JobApplication,
	type JobStatus,
	type MasterProfile,
	QUESTION_CATEGORIES,
	QUESTION_SOURCES,
	RECOMMENDATIONS,
	type RecommendationType,
	STAGE_STATUSES,
	STAGE_TYPES,
	WORK_TYPES,
	type WorkType,
} from "@/lib/types";
import { db } from "@/src/prisma/db";

// Capa de acceso a datos de JustWork. Traduce entre las filas de Prisma
// (null, Char<36>, jsonb) y los tipos de dominio de lib/types.ts.

type Db = typeof db;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Orm = Db["orm"] | Tx["orm"];

export type StoredProfile = MasterProfile & {
	id: string;
	cvAnalysis?: CvAnalysis;
	cvAnalyzedAt?: string;
};

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida que el valor sea un UUID y lo tipa como el `Char<36>` del contrato. */
export function toId(value: unknown): Char<36> | null {
	return typeof value === "string" && UUID_RE.test(value)
		? (value as Char<36>)
		: null;
}

const json = (value: unknown) => value as JsonValue;
/** Lee una columna jsonb como arreglo del tipo de dominio (o [] si viene vacía). */
const fromJson = <T>(value: JsonValue | null | undefined) =>
	(Array.isArray(value) ? value : []) as unknown as T;
const undef = <T>(value: T | null | undefined) => value ?? undefined;
const today = () => new Date().toISOString().split("T")[0];

// ---------- helpers de saneamiento para cuerpos JSON ----------

type Body = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const strArray = (v: unknown) =>
	Array.isArray(v)
		? v.filter((x): x is string => typeof x === "string")
		: undefined;
const oneOf = <T extends string>(list: readonly T[], v: unknown) =>
	typeof v === "string" && (list as readonly string[]).includes(v)
		? (v as T)
		: undefined;
const int = (v: unknown) =>
	typeof v === "number" && Number.isFinite(v) ? Math.round(v) : undefined;

const isObj = (v: unknown): v is Body =>
	typeof v === "object" && v !== null && !Array.isArray(v);
const clip = (v: unknown, max: number) => str(v)?.slice(0, max) || undefined;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const date = (v: unknown) => {
	const s = str(v);
	return s && DATE_RE.test(s) ? s : undefined;
};
const newId = () => crypto.randomUUID();

function sanitizeQuestion(v: unknown): InterviewQuestion | null {
	if (!isObj(v)) return null;
	const question = clip(v.question, 2000);
	if (!question) return null;
	const rating = int(v.rating);
	return {
		id: clip(v.id, 64) ?? newId(),
		question,
		source: oneOf(QUESTION_SOURCES, v.source) ?? "asked",
		category: oneOf(QUESTION_CATEGORIES, v.category),
		myAnswer: clip(v.myAnswer, 10000),
		notes: clip(v.notes, 5000),
		rating: rating === 1 || rating === 2 || rating === 3 ? rating : undefined,
	};
}

/** Sanea las etapas de entrevista que llegan del cliente (no confiable). */
export function sanitizeStages(v: unknown): InterviewStage[] {
	if (!Array.isArray(v)) return [];
	return v.slice(0, 30).flatMap((s): InterviewStage[] => {
		if (!isObj(s)) return [];
		const questions = Array.isArray(s.questions)
			? s.questions
					.slice(0, 200)
					.map(sanitizeQuestion)
					.filter((q): q is InterviewQuestion => q !== null)
			: [];
		return [
			{
				id: clip(s.id, 64) ?? newId(),
				name: clip(s.name, 200) ?? "Etapa",
				type: oneOf(STAGE_TYPES, s.type) ?? "other",
				status: oneOf(STAGE_STATUSES, s.status) ?? "pending",
				date: date(s.date),
				interviewer: clip(s.interviewer, 200),
				notes: clip(s.notes, 10000),
				questions,
			},
		];
	});
}

// ---------- MasterProfile ----------

type ProfileRow = Awaited<
	ReturnType<Db["orm"]["public"]["MasterProfile"]["first"]>
>;

function rowToProfile(row: NonNullable<ProfileRow>): StoredProfile {
	return {
		id: row.id,
		fullName: row.fullName,
		headline: row.headline,
		email: row.email,
		phone: row.phone,
		location: row.location,
		portfolioUrl: undef(row.portfolioUrl),
		linkedinUrl: undef(row.linkedinUrl),
		githubUrl: undef(row.githubUrl),
		summary: row.summary,
		targetSalary: undef(row.targetSalary),
		targetRoles: fromJson<MasterProfile["targetRoles"]>(row.targetRoles),
		skills: fromJson<MasterProfile["skills"]>(row.skills),
		experiences: fromJson<MasterProfile["experiences"]>(row.experiences),
		projects: fromJson<MasterProfile["projects"]>(row.projects),
		education: fromJson<MasterProfile["education"]>(row.education),
		cvAnalysis: (row.cvAnalysis ?? undefined) as CvAnalysis | undefined,
		cvAnalyzedAt: undef(row.cvAnalyzedAt),
	};
}

function profileToRow(p: MasterProfile) {
	return {
		fullName: p.fullName,
		headline: p.headline,
		email: p.email,
		phone: p.phone,
		location: p.location,
		portfolioUrl: p.portfolioUrl ?? null,
		linkedinUrl: p.linkedinUrl ?? null,
		githubUrl: p.githubUrl ?? null,
		summary: p.summary,
		targetSalary: p.targetSalary ?? null,
		targetRoles: json(p.targetRoles ?? []),
		skills: json(p.skills ?? []),
		experiences: json(p.experiences ?? []),
		projects: json(p.projects ?? []),
		education: json(p.education ?? []),
	};
}

/** Mezcla un cuerpo parcial (no confiable) sobre un perfil base. */
export function mergeProfile(base: MasterProfile, body: Body): MasterProfile {
	const arr = <T>(v: unknown, fallback: T[]) =>
		Array.isArray(v) ? (v as T[]) : fallback;
	return {
		fullName: str(body.fullName) ?? base.fullName,
		headline: str(body.headline) ?? base.headline,
		email: str(body.email) ?? base.email,
		phone: str(body.phone) ?? base.phone,
		location: str(body.location) ?? base.location,
		portfolioUrl: str(body.portfolioUrl) ?? base.portfolioUrl,
		linkedinUrl: str(body.linkedinUrl) ?? base.linkedinUrl,
		githubUrl: str(body.githubUrl) ?? base.githubUrl,
		summary: str(body.summary) ?? base.summary,
		targetSalary: str(body.targetSalary) ?? base.targetSalary,
		targetRoles: strArray(body.targetRoles) ?? base.targetRoles,
		skills: arr(body.skills, base.skills),
		experiences: arr(body.experiences, base.experiences),
		projects: arr(body.projects, base.projects),
		education: arr(body.education, base.education),
	};
}

async function createProfile(orm: Orm, profile: MasterProfile) {
	return rowToProfile(
		await orm.public.MasterProfile.create(profileToRow(profile)),
	);
}

/** Devuelve tu perfil maestro, o null si todavía no subes tu CV. */
export async function getProfile(): Promise<StoredProfile | null> {
	const row = await db.orm.public.MasterProfile.first();
	return row ? rowToProfile(row) : null;
}

/** Actualiza (o crea) el único perfil maestro con los campos recibidos. */
export async function upsertProfile(body: Body): Promise<StoredProfile> {
	const existing = await db.orm.public.MasterProfile.first();
	if (!existing) {
		return createProfile(db.orm, mergeProfile(emptyProfile, body));
	}
	const merged = mergeProfile(rowToProfile(existing), body);
	const updated = await db.orm.public.MasterProfile.where({
		id: existing.id,
	}).update(profileToRow(merged));
	return updated ? rowToProfile(updated) : { ...merged, id: existing.id };
}

/**
 * Reemplaza tu perfil maestro con el extraído del CV y guarda su análisis.
 * Si no hay perfil todavía, lo crea.
 */
export async function saveProfileFromCv(
	body: Body,
	analysis: CvAnalysis | null,
): Promise<StoredProfile> {
	const profile = mergeProfile(emptyProfile, body);
	const row = {
		...profileToRow(profile),
		cvAnalysis: analysis ? json(analysis) : null,
		cvAnalyzedAt: analysis ? new Date().toISOString() : null,
	};
	const existing = await db.orm.public.MasterProfile.first();
	if (!existing) {
		return rowToProfile(await db.orm.public.MasterProfile.create(row));
	}
	const updated = await db.orm.public.MasterProfile.where({
		id: existing.id,
	}).update(row);
	if (!updated) throw new Error("No se pudo guardar el perfil.");
	return rowToProfile(updated);
}

// ---------- JobApplication ----------

type AppRow = Awaited<
	ReturnType<Db["orm"]["public"]["JobApplication"]["first"]>
>;

function rowToApplication(row: NonNullable<AppRow>): JobApplication {
	return {
		id: row.id,
		title: row.title,
		company: row.company,
		location: row.location,
		url: undef(row.url),
		sourceText: row.sourceText,
		salaryRange: undef(row.salaryRange),
		workType: undef(row.workType) as WorkType | undefined,
		status: row.status as JobStatus,
		dateAdded: row.dateAdded,
		dateApplied: undef(row.dateApplied),
		fitScore: undef(row.fitScore),
		recommendation: undef(row.recommendation) as RecommendationType | undefined,
		recommendationHeadline: undef(row.recommendationHeadline),
		reasoning: undef(row.reasoning),
		matchingSkills: fromJson<string[]>(row.matchingSkills),
		missingSkills: fromJson<string[]>(row.missingSkills),
		pros: fromJson<string[]>(row.pros),
		cons: fromJson<string[]>(row.cons),
		interviewTips: fromJson<string[]>(row.interviewTips),
		estimatedSeniority: undef(row.estimatedSeniority),
		tailoredHeadline: undef(row.tailoredHeadline),
		tailoredSummary: undef(row.tailoredSummary),
		tailoredResumeMarkdown: undef(row.tailoredResumeMarkdown),
		tailoredCoverLetterMarkdown: undef(row.tailoredCoverLetterMarkdown),
		atsKeywordsIncluded: fromJson<string[]>(row.atsKeywordsIncluded),
		keyPitchAngle: undef(row.keyPitchAngle),
		qaPairs: fromJson<JobApplication["qaPairs"]>(row.qaPairs),
		notes: undef(row.notes),
		outcomeReason: undef(row.outcomeReason),
		nextAction: undef(row.nextAction),
		nextActionAt: undef(row.nextActionAt),
		interviewStages: fromJson<InterviewStage[]>(row.interviewStages),
	};
}

/**
 * Campos editables de una postulación, saneados desde un cuerpo no confiable.
 * Solo incluye las claves presentes en `body` (sirve para PATCH).
 */
function applicationPatch(body: Body) {
	const out: Record<string, unknown> = {};
	const set = (key: string, value: unknown) => {
		if (key in body) out[key] = value ?? null;
	};
	for (const key of [
		"title",
		"company",
		"location",
		"url",
		"sourceText",
		"salaryRange",
		"dateAdded",
		"dateApplied",
		"recommendationHeadline",
		"reasoning",
		"estimatedSeniority",
		"tailoredHeadline",
		"tailoredSummary",
		"tailoredResumeMarkdown",
		"tailoredCoverLetterMarkdown",
		"keyPitchAngle",
		"notes",
		"outcomeReason",
		"nextAction",
	]) {
		set(key, str(body[key]));
	}
	set("nextActionAt", date(body.nextActionAt));
	if ("interviewStages" in body) {
		out.interviewStages = json(sanitizeStages(body.interviewStages));
	}
	for (const key of [
		"matchingSkills",
		"missingSkills",
		"pros",
		"cons",
		"interviewTips",
		"atsKeywordsIncluded",
	]) {
		if (key in body) out[key] = json(strArray(body[key]) ?? []);
	}
	if ("qaPairs" in body) {
		out.qaPairs = json(Array.isArray(body.qaPairs) ? body.qaPairs : []);
	}
	set("status", oneOf(JOB_STATUSES, body.status));
	set("workType", oneOf(WORK_TYPES, body.workType));
	set("recommendation", oneOf(RECOMMENDATIONS, body.recommendation));
	set("fitScore", int(body.fitScore));
	return out;
}

function newApplicationRow(body: Body) {
	return {
		url: null,
		salaryRange: null,
		dateApplied: null,
		fitScore: null,
		recommendation: null,
		recommendationHeadline: null,
		reasoning: null,
		estimatedSeniority: null,
		tailoredHeadline: null,
		tailoredSummary: null,
		tailoredResumeMarkdown: null,
		tailoredCoverLetterMarkdown: null,
		keyPitchAngle: null,
		notes: "",
		outcomeReason: "",
		nextAction: null,
		nextActionAt: null,
		interviewStages: json([]),
		...applicationPatch(body),
		// Valores por defecto para los campos obligatorios.
		title: str(body.title) || "Nueva Vacante",
		company: str(body.company) || "Empresa",
		location: str(body.location) || "Remoto",
		sourceText: str(body.sourceText) ?? "",
		workType: oneOf(WORK_TYPES, body.workType) ?? "unknown",
		status: oneOf(JOB_STATUSES, body.status) ?? "discovered",
		dateAdded: str(body.dateAdded) || today(),
		matchingSkills: json(strArray(body.matchingSkills) ?? []),
		missingSkills: json(strArray(body.missingSkills) ?? []),
		pros: json(strArray(body.pros) ?? []),
		cons: json(strArray(body.cons) ?? []),
		interviewTips: json(strArray(body.interviewTips) ?? []),
		atsKeywordsIncluded: json(strArray(body.atsKeywordsIncluded) ?? []),
		qaPairs: json(Array.isArray(body.qaPairs) ? body.qaPairs : []),
	};
}

async function insertApplication(orm: Orm, body: Body) {
	// El cast es necesario porque applicationPatch construye el objeto dinámicamente.
	const row = await orm.public.JobApplication.create(
		newApplicationRow(body) as Parameters<
			Db["orm"]["public"]["JobApplication"]["create"]
		>[0],
	);
	return rowToApplication(row);
}

export async function listApplications(): Promise<JobApplication[]> {
	const rows = await db.orm.public.JobApplication.orderBy((a) =>
		a.createdAt.desc(),
	).all();
	return rows.map(rowToApplication);
}

export function createApplication(body: Body) {
	return insertApplication(db.orm, body);
}

export async function updateApplication(id: Char<36>, body: Body) {
	const patch = applicationPatch(body);
	const existing = await db.orm.public.JobApplication.where({ id }).first();
	if (!existing) return null;
	if (Object.keys(patch).length === 0) return rowToApplication(existing);
	const updated = await db.orm.public.JobApplication.where({ id }).update(
		patch as Parameters<
			ReturnType<Db["orm"]["public"]["JobApplication"]["where"]>["update"]
		>[0],
	);
	return updated ? rowToApplication(updated) : null;
}

export async function deleteApplication(id: Char<36>) {
	await db.orm.public.JobApplication.where({ id }).delete();
}
