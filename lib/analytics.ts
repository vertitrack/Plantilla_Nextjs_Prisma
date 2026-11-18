import type { JobApplication, JobStatus, WorkType } from "@/lib/types";

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
