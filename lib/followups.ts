import type {
	InterviewQuestion,
	InterviewStage,
	JobApplication,
} from "@/lib/types";

// Lógica pura de seguimientos, etapas y banco de preguntas (sin React).

/** Fecha local de hoy como YYYY-MM-DD (no UTC, para no saltar de día). */
export function localToday(base = new Date()) {
	const y = base.getFullYear();
	const m = String(base.getMonth() + 1).padStart(2, "0");
	const d = String(base.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Suma días a una fecha YYYY-MM-DD (o a hoy si no se indica). */
export function addDays(days: number, from?: string) {
	const base = from ? new Date(`${from}T12:00:00`) : new Date();
	base.setDate(base.getDate() + days);
	return localToday(base);
}

/** Días entre hoy y la fecha (negativo = en el pasado). */
export function daysUntil(date: string, today = localToday()) {
	const a = new Date(`${today}T12:00:00`).getTime();
	const b = new Date(`${date}T12:00:00`).getTime();
	return Math.round((b - a) / 86_400_000);
}

/** Formato corto en español: "28 nov". */
export function shortDate(date: string) {
	return new Date(`${date}T12:00:00`).toLocaleDateString("es", {
		day: "numeric",
		month: "short",
	});
}

/** "hoy", "mañana", "hace 3 días", "en 5 días". */
export function relativeDay(date: string, today = localToday()) {
	const d = daysUntil(date, today);
	if (d === 0) return "hoy";
	if (d === 1) return "mañana";
	if (d === -1) return "ayer";
	return d < 0 ? `hace ${-d} días` : `en ${d} días`;
}

export type DueState = "overdue" | "today" | "soon";

const CLOSED = new Set(["rejected", "passed", "offer"]);

/** Estado del seguimiento de una vacante. */
export function dueState(
	job: Pick<JobApplication, "nextActionAt" | "status">,
	today = localToday(),
): DueState | null {
	if (!job.nextActionAt || CLOSED.has(job.status)) return null;
	const d = daysUntil(job.nextActionAt, today);
	if (d < 0) return "overdue";
	if (d === 0) return "today";
	if (d <= 3) return "soon";
	return null;
}

export const DUE_LABELS: Record<DueState, string> = {
	overdue: "Seguimiento vencido",
	today: "Seguimiento hoy",
	soon: "Seguimiento pronto",
};

/** Seguimientos con fecha, ordenados (vencidos primero). */
export function followupQueue(apps: JobApplication[], today = localToday()) {
	return apps
		.filter((a) => a.nextActionAt && !CLOSED.has(a.status))
		.map((a) => ({
			job: a,
			state: dueState(a, today),
			days: daysUntil(a.nextActionAt as string, today),
		}))
		.sort((a, b) => a.days - b.days);
}

/** Cuántos seguimientos requieren atención hoy (vencidos + hoy). */
export function dueCount(apps: JobApplication[], today = localToday()) {
	return apps.filter((a) => {
		const s = dueState(a, today);
		return s === "overdue" || s === "today";
	}).length;
}

/** Postulaciones enviadas hace ≥ 7 días sin próxima acción definida. */
export function staleApplications(
	apps: JobApplication[],
	today = localToday(),
) {
	return apps.filter(
		(a) =>
			(a.status === "applied" || a.status === "interviewing") &&
			!a.nextActionAt &&
			daysUntil(a.dateApplied ?? a.dateAdded, today) <= -7,
	);
}

/** Entrevistas agendadas desde hoy en adelante. */
export function upcomingInterviews(
	apps: JobApplication[],
	today = localToday(),
) {
	return apps
		.flatMap((job) =>
			(job.interviewStages ?? [])
				.filter(
					(s) =>
						s.date &&
						(s.status === "scheduled" || s.status === "pending") &&
						daysUntil(s.date, today) >= 0,
				)
				.map((stage) => ({ job, stage })),
		)
		.sort((a, b) =>
			(a.stage.date as string).localeCompare(b.stage.date as string),
		);
}

/** Resumen del proceso: "Etapa 2 de 4" y la próxima etapa. */
export function processSummary(stages: InterviewStage[] = []) {
	const total = stages.length;
	const finished = stages.filter((s) =>
		["done", "passed", "failed", "cancelled"].includes(s.status),
	).length;
	const next = stages.find(
		(s) => s.status === "pending" || s.status === "scheduled",
	);
	const current = next ? stages.indexOf(next) + 1 : finished;
	return { total, finished, current, next };
}

export const newId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ---------- Banco de preguntas ----------

export interface BankEntry {
	question: InterviewQuestion;
	stage: InterviewStage;
	job: JobApplication;
}

/** Aplana vacantes → etapas → preguntas. */
export function questionBank(apps: JobApplication[]): BankEntry[] {
	return apps.flatMap((job) =>
		(job.interviewStages ?? []).flatMap((stage) =>
			(stage.questions ?? []).map((question) => ({ question, stage, job })),
		),
	);
}

/** Normaliza el texto para detectar preguntas repetidas. */
export function normalizeQuestion(q: string) {
	return q
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[¿?¡!.,;:"'()]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export interface BankGroup {
	key: string;
	question: string;
	entries: BankEntry[];
	askedCount: number;
}

/** Agrupa preguntas iguales (mismo texto normalizado) entre vacantes. */
export function groupQuestions(entries: BankEntry[]): BankGroup[] {
	const map = new Map<string, BankGroup>();
	for (const e of entries) {
		const key = normalizeQuestion(e.question.question);
		const group = map.get(key) ?? {
			key,
			question: e.question.question,
			entries: [],
			askedCount: 0,
		};
		group.entries.push(e);
		if (e.question.source === "asked") group.askedCount++;
		map.set(key, group);
	}
	return [...map.values()].sort(
		(a, b) =>
			b.askedCount - a.askedCount || b.entries.length - a.entries.length,
	);
}

/** Palabras del título para relacionar vacantes del mismo rol. */
function titleTokens(title: string) {
	return new Set(
		normalizeQuestion(title)
			.split(" ")
			.filter((w) => w.length > 3),
	);
}

/**
 * Preguntas reales que me hicieron en otras vacantes de un rol parecido
 * (comparten alguna palabra del título) o con el mismo tipo de etapa.
 */
export function pastQuestionsFor(
	apps: JobApplication[],
	job: JobApplication,
	stage: InterviewStage,
) {
	const tokens = titleTokens(job.title);
	const seen = new Set<string>();
	const out: string[] = [];
	for (const e of questionBank(apps)) {
		if (e.job.id === job.id || e.question.source !== "asked") continue;
		const related =
			e.stage.type === stage.type ||
			[...titleTokens(e.job.title)].some((t) => tokens.has(t));
		const key = normalizeQuestion(e.question.question);
		if (related && !seen.has(key)) {
			seen.add(key);
			out.push(e.question.question);
		}
	}
	return out;
}
