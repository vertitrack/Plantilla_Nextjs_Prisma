import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	LightbulbIcon,
	MinusCircleIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	fitColor,
	RECOMMENDATION_LABELS,
	recommendationVariant,
} from "@/lib/labels";
import type { JobEvaluation } from "@/lib/types";
import { cn } from "@/lib/utils";

function List({
	icon: Icon,
	title,
	items,
	tone,
}: {
	icon: typeof CheckCircle2Icon;
	title: string;
	items?: string[];
	tone?: string;
}) {
	if (!items?.length) return null;
	return (
		<section className="grid content-start gap-2 rounded-lg border p-4">
			<h3 className="flex items-center gap-2 font-medium text-sm">
				<Icon className={cn("size-4", tone ?? "text-muted-foreground")} />
				{title}
			</h3>
			<ul className="grid gap-1.5 pl-5 text-muted-foreground text-sm">
				{items.map((item) => (
					<li key={item} className="list-disc">
						{item}
					</li>
				))}
			</ul>
		</section>
	);
}

/** Veredicto "¿Postulo o no?" con fit score y desglose. */
export function EvaluationView({ evaluation }: { evaluation: JobEvaluation }) {
	const score = Math.max(
		0,
		Math.min(100, Math.round(evaluation.fitScore ?? 0)),
	);

	return (
		<div className="grid gap-5">
			<div className="grid gap-4 rounded-lg border p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-6">
				<div className="grid gap-1">
					<p className="text-muted-foreground text-xs">Fit score</p>
					<p
						className={cn(
							"font-semibold text-5xl tabular-nums",
							fitColor(score),
						)}
					>
						{score}%
					</p>
				</div>
				<div className="grid gap-3">
					<div className="flex flex-wrap items-center gap-2">
						{evaluation.recommendation ? (
							<Badge variant={recommendationVariant(evaluation.recommendation)}>
								{RECOMMENDATION_LABELS[evaluation.recommendation]}
							</Badge>
						) : null}
						{evaluation.estimatedSeniority ? (
							<Badge variant="outline">{evaluation.estimatedSeniority}</Badge>
						) : null}
					</div>
					<Progress value={score} aria-label="Fit score" />
					{evaluation.recommendationHeadline ? (
						<p className="font-medium">{evaluation.recommendationHeadline}</p>
					) : null}
				</div>
			</div>

			{evaluation.reasoning ? (
				<p className="whitespace-pre-line text-sm leading-relaxed">
					{evaluation.reasoning}
				</p>
			) : null}

			<div className="grid gap-4 md:grid-cols-2">
				<List
					icon={CheckCircle2Icon}
					title="Lo que cumples"
					items={evaluation.matchingSkills}
					tone="text-emerald-600 dark:text-emerald-400"
				/>
				<List
					icon={MinusCircleIcon}
					title="Brechas / requisitos faltantes"
					items={evaluation.missingSkills}
					tone="text-amber-600 dark:text-amber-400"
				/>
				<List icon={ThumbsUpIcon} title="Ventajas" items={evaluation.pros} />
				<List icon={ThumbsDownIcon} title="Riesgos" items={evaluation.cons} />
			</div>
			<List
				icon={LightbulbIcon}
				title="Consejos tácticos para postular"
				items={evaluation.interviewTips}
			/>
		</div>
	);
}

export function NoProfileWarning() {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
			<AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
			<p>
				Primero completa{" "}
				<a href="/profile" className="font-medium underline">
					tu CV maestro
				</a>
				: la IA lo necesita para evaluar vacantes y adaptar tus documentos.
			</p>
		</div>
	);
}
