export interface SkillCategory {
	category: string;
	items: string[];
}

export interface Experience {
	id: string;
	company: string;
	role: string;
	period: string;
	highlights: string[];
	skillsUsed: string[];
}

export interface Project {
	id: string;
	name: string;
	description: string;
	highlights: string[];
	technologies: string[];
	link?: string;
}

export interface Education {
	institution: string;
	degree: string;
	year: string;
}

export interface MasterProfile {
	fullName: string;
	headline: string;
	email: string;
	phone: string;
	location: string;
	portfolioUrl?: string;
	linkedinUrl?: string;
	githubUrl?: string;
	summary: string;
	skills: SkillCategory[];
	experiences: Experience[];
	projects: Project[];
	education: Education[];
	targetRoles: string[];
	targetSalary?: string;
}

/** Perfil vacío: estado inicial antes de subir tu CV. */
export const emptyProfile: MasterProfile = {
	fullName: "",
	headline: "",
	email: "",
	phone: "",
	location: "",
	summary: "",
	targetRoles: [],
	skills: [],
	experiences: [],
	projects: [],
	education: [],
};

/** Evaluación del CV hecha con IA. */
export interface CvAnalysis {
	/** Calidad general del CV de 0 a 100. */
	overallScore: number;
	/** Veredicto en una frase. */
	verdict: string;
	/** Nivel de seniority estimado (Junior, Mid, Senior, Lead...). */
	seniority: string;
	strengths: string[];
	improvements: string[];
	/** Roles a los que el perfil apunta mejor. */
	suggestedRoles: string[];
	/** Consejos para pasar filtros ATS. */
	atsTips: string[];
}

export const JOB_STATUSES = [
	"discovered",
	"evaluating",
	"applied",
	"interviewing",
	"offer",
	"rejected",
	"passed",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const WORK_TYPES = ["remote", "hybrid", "onsite", "unknown"] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const RECOMMENDATIONS = [
	"APPLY_STRONG",
	"APPLY_MODERATE",
	"PASS",
] as const;
export type RecommendationType = (typeof RECOMMENDATIONS)[number];

export const STAGE_TYPES = [
	"screening",
	"technical",
	"take_home",
	"behavioral",
	"culture",
	"final",
	"other",
] as const;
export type StageType = (typeof STAGE_TYPES)[number];

export const STAGE_STATUSES = [
	"pending",
	"scheduled",
	"done",
	"passed",
	"failed",
	"cancelled",
] as const;
export type StageStatus = (typeof STAGE_STATUSES)[number];

export const QUESTION_CATEGORIES = [
	"technical",
	"behavioral",
	"company",
	"salary",
	"other",
] as const;
export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export const QUESTION_SOURCES = ["asked", "predicted"] as const;
export type QuestionSource = (typeof QUESTION_SOURCES)[number];

/** Pregunta de una etapa: real (me la hicieron) o predicha por la IA. */
export interface InterviewQuestion {
	id: string;
	question: string;
	source: QuestionSource;
	category?: QuestionCategory;
	/** Lo que respondí (o quiero responder). */
	myAnswer?: string;
	notes?: string;
	/** Autoevaluación: 1 = mal, 2 = regular, 3 = bien. */
	rating?: 1 | 2 | 3;
}

/** Una etapa del proceso de selección (screening, técnica, final...). */
export interface InterviewStage {
	id: string;
	name: string;
	type: StageType;
	status: StageStatus;
	/** Fecha de la etapa (YYYY-MM-DD). */
	date?: string;
	interviewer?: string;
	notes?: string;
	questions: InterviewQuestion[];
}

export interface QAPair {
	question: string;
	answer: string;
	groundedIn?: string;
	tips?: string;
}

export interface JobApplication {
	id: string;
	title: string;
	company: string;
	location: string;
	url?: string;
	sourceText: string;
	salaryRange?: string;
	workType?: WorkType;
	status: JobStatus;
	dateAdded: string;
	dateApplied?: string;
	fitScore?: number;
	recommendation?: RecommendationType;
	recommendationHeadline?: string;
	reasoning?: string;
	matchingSkills: string[];
	missingSkills: string[];
	pros: string[];
	cons: string[];
	interviewTips?: string[];
	estimatedSeniority?: string;
	tailoredHeadline?: string;
	tailoredSummary?: string;
	tailoredResumeMarkdown?: string;
	tailoredCoverLetterMarkdown?: string;
	atsKeywordsIncluded?: string[];
	keyPitchAngle?: string;
	qaPairs: QAPair[];
	notes?: string;
	outcomeReason?: string;
	/** Próxima acción de seguimiento (p. ej. "Escribir al reclutador"). */
	nextAction?: string;
	/** Fecha de la próxima acción (YYYY-MM-DD). */
	nextActionAt?: string;
	/** Etapas del proceso de entrevista, en orden. */
	interviewStages: InterviewStage[];
}

/** Datos que devuelve la evaluación de una vacante con IA. */
export type JobEvaluation = Pick<
	JobApplication,
	| "fitScore"
	| "recommendation"
	| "recommendationHeadline"
	| "reasoning"
	| "matchingSkills"
	| "missingSkills"
	| "pros"
	| "cons"
	| "interviewTips"
	| "estimatedSeniority"
>;

/** Datos que devuelve la adaptación de CV y carta con IA. */
export type TailoredResume = Required<
	Pick<
		JobApplication,
		| "tailoredHeadline"
		| "tailoredSummary"
		| "tailoredResumeMarkdown"
		| "tailoredCoverLetterMarkdown"
		| "atsKeywordsIncluded"
		| "keyPitchAngle"
	>
>;

/** Vacante extraída desde una URL. */
export interface ScrapedJob {
	url: string;
	title: string;
	company: string;
	location: string;
	workType: WorkType;
	salaryRange: string;
	summary: string;
	fullText: string;
}

export type AppView =
	| "kanban"
	| "investigate"
	| "profile"
	| "detail"
	| "analytics";
