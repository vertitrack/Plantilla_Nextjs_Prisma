import type {
	JobApplication,
	JobStatus,
	QuestionCategory,
	StageType,
	WorkType,
} from "@/lib/types";

// Métricas de "qué funciona y qué no", calculadas sobre tus postulaciones.

const SENT: JobStatus[] = ["applied", "interviewing", "offer", "rejected"];
const SUCCESS: JobStatus[] = ["interviewing", "offer"];

const avg = (values: number[]) =>
	values.length
		? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
		: undefined;

const fits = (apps: JobApplication[]) =>
	apps.map((a) => a.fitScore).filter((n): n is number => typeof n === "number");

/** Ranking de los elementos más repetidos (ignorando mayúsculas). */
function topItems(lists: (string[] | undefined)[], limit = 8) {
	const counts = new Map<string, { label: string; count: number }>();
	for (const list of lists) {
		for (const raw of new Set(list ?? [])) {
			const key = raw.trim().toLowerCase();
			if (!key) continue;
			const entry = counts.get(key) ?? { label: raw.trim(), count: 0 };
			entry.count += 1;
			counts.set(key, entry);
		}
	}
	return [...counts.values()]
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
		.slice(0, limit);
}

/** Postulaciones enviadas y conversión a entrevista (también para el sidebar). */
export function conversionStats(apps: JobApplication[]) {
	const sent = apps.filter(
		(a) => SENT.includes(a.status) || a.dateApplied,
	).length;
	const interviews = apps.filter((a) => SUCCESS.includes(a.status)).length;
	return {
		sent,
		interviews,
		interviewRate: sent ? Math.round((interviews / sent) * 100) : 0,
	};
}

export function computeAnalytics(apps: JobApplication[]) {
	const { sent, interviews, interviewRate } = conversionStats(apps);
	const successful = apps.filter((a) => SUCCESS.includes(a.status));
	const rejected = apps.filter((a) => a.status === "rejected");
	const offers = apps.filter((a) => a.status === "offer").length;

	const successFits = fits(successful);
	// Umbral: el fit más bajo con el que has conseguido entrevista.
	const fitThreshold = successFits.length
		? Math.min(...successFits)
		: undefined;

	const rejectedByWorkType = new Map<WorkType, number>();
	for (const a of rejected) {
		const wt = a.workType ?? "unknown";
		rejectedByWorkType.set(wt, (rejectedByWorkType.get(wt) ?? 0) + 1);
	}

	const lowFitRejected = rejected.filter(
		(a) => a.recommendation === "PASS" || (a.fitScore ?? 100) < 50,
	).length;

	return {
		total: apps.length,
		sent,
		interviews,
		offers,
		interviewRate,
		avgFitInterview: avg(successFits),
		avgFitRejected: avg(fits(rejected)),
		fitThreshold,
		topSuccessSkills: topItems(successful.map((a) => a.matchingSkills)),
		topRejectedGaps: topItems(
			rejected.map((a) => a.missingSkills),
			6,
		),
		rejectedByWorkType: [...rejectedByWorkType.entries()].sort(
			(a, b) => b[1] - a[1],
		),
		rejectedCount: rejected.length,
		lowFitRejected,
		passApplied: apps.filter(
			(a) => a.recommendation === "PASS" && SENT.includes(a.status),
		).length,
	};
}

export type Analytics = ReturnType<typeof computeAnalytics>;

/** Métricas de los procesos de entrevista registrados. */
export function interviewAnalytics(apps: JobApplication[]) {
	const withStages = apps.filter((a) => a.interviewStages?.length);
	const stages = withStages.flatMap((a) => a.interviewStages);
	const questions = stages.flatMap((s) => s.questions ?? []);
	const asked = questions.filter((q) => q.source === "asked");

	// Tipo de etapa en la que más veces "no avancé".
	const failedBy = new Map<StageType, number>();
	for (const s of stages) {
		if (s.status === "failed") {
			failedBy.set(s.type, (failedBy.get(s.type) ?? 0) + 1);
		}
	}
	const byCategory = new Map<QuestionCategory, number>();
	for (const q of asked) {
		if (q.category) {
			byCategory.set(q.category, (byCategory.get(q.category) ?? 0) + 1);
		}
	}

	return {
		processes: withStages.length,
		avgStages: withStages.length
			? Math.round((stages.length / withStages.length) * 10) / 10
			: undefined,
		askedCount: asked.length,
		badAnswers: asked.filter((q) => q.rating === 1).length,
		failedByStage: [...failedBy.entries()].sort((a, b) => b[1] - a[1]),
		topCategories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
	};
}
