import type { JobStatus, RecommendationType, WorkType } from "@/lib/types";

/** Columnas del tablero (Rechazado y Descartado comparten la última). */
export const BOARD_COLUMNS: {
	id: string;
	title: string;
	statuses: JobStatus[];
}[] = [
	{ id: "discovered", title: "Descubiertas", statuses: ["discovered"] },
	{ id: "evaluating", title: "En evaluación", statuses: ["evaluating"] },
	{ id: "applied", title: "Postulado", statuses: ["applied"] },
	{ id: "interviewing", title: "En entrevista", statuses: ["interviewing"] },
	{ id: "offer", title: "Oferta recibida", statuses: ["offer"] },
	{
		id: "closed",
		title: "Rechazado / Cerrado",
		statuses: ["rejected", "passed"],
	},
];

/** Orden de etapas para avanzar/retroceder con las flechas. */
export const STAGE_ORDER: JobStatus[] = [
	"discovered",
	"evaluating",
	"applied",
	"interviewing",
	"offer",
	"rejected",
];

export const STATUS_LABELS: Record<JobStatus, string> = {
	discovered: "Descubierta",
	evaluating: "En evaluación",
	applied: "Postulado",
	interviewing: "En entrevista",
	offer: "Oferta recibida",
	rejected: "Rechazado",
	passed: "Descartada",
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
	remote: "Remoto",
	hybrid: "Híbrido",
	onsite: "Presencial",
	unknown: "Sin especificar",
};

export const RECOMMENDATION_LABELS: Record<RecommendationType, string> = {
	APPLY_STRONG: "¡Postula ahora!",
	APPLY_MODERATE: "Postula con adaptaciones",
	PASS: "No recomendado / Bajo fit",
};

export function recommendationVariant(r?: RecommendationType) {
	if (r === "APPLY_STRONG") return "default" as const;
	if (r === "APPLY_MODERATE") return "secondary" as const;
	if (r === "PASS") return "destructive" as const;
	return "outline" as const;
}

/** Color del texto según el fit score. */
export function fitColor(score?: number) {
	if (score === undefined) return "text-muted-foreground";
	if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
	if (score >= 50) return "text-amber-600 dark:text-amber-400";
	return "text-destructive";
}
