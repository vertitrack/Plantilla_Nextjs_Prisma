import {
	CheckCircle2Icon,
	LightbulbIcon,
	ScanSearchIcon,
	TargetIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CvAnalysis } from "@/lib/types";

function scoreLabel(score: number) {
	if (score >= 80) return "Excelente";
	if (score >= 65) return "Bueno";
	if (score >= 50) return "Mejorable";
	return "Necesita trabajo";
}

function Section({
	icon: Icon,
	title,
	items,
}: {
	icon: typeof CheckCircle2Icon;
	title: string;
	items: string[];
}) {
	if (!items?.length) return null;
	return (
		<section className="grid gap-2">
			<h3 className="flex items-center gap-2 font-medium text-sm">
				<Icon className="size-4 text-muted-foreground" />
				{title}
			</h3>
			<ul className="grid gap-1.5 pl-6 text-muted-foreground text-sm">
				{items.map((item) => (
					<li key={item} className="list-disc">
						{item}
					</li>
				))}
			</ul>
		</section>
	);
}

/** Muestra la evaluación del CV hecha con IA. */
export function CvAnalysisView({ analysis }: { analysis: CvAnalysis }) {
	const score = Math.max(0, Math.min(100, Math.round(analysis.overallScore)));

	return (
		<div className="grid gap-5">
			<div className="grid gap-3">
				<div className="flex items-end justify-between gap-4">
					<div>
						<p className="text-muted-foreground text-sm">Puntaje del CV</p>
						<p className="font-semibold text-4xl tabular-nums">
							{score}
							<span className="text-base text-muted-foreground">/100</span>
						</p>
					</div>
					<div className="flex flex-wrap justify-end gap-2">
						<Badge variant="secondary">{scoreLabel(score)}</Badge>
						{analysis.seniority ? (
							<Badge variant="outline">{analysis.seniority}</Badge>
						) : null}
					</div>
				</div>
				<Progress value={score} aria-label="Puntaje del CV" />
				<p className="text-sm">{analysis.verdict}</p>
			</div>

			<Section
				icon={CheckCircle2Icon}
				title="Fortalezas"
				items={analysis.strengths}
			/>
			<Section
				icon={LightbulbIcon}
				title="Qué mejorar"
				items={analysis.improvements}
			/>
			<Section
				icon={ScanSearchIcon}
				title="Consejos ATS"
				items={analysis.atsTips}
			/>

			{analysis.suggestedRoles?.length ? (
				<section className="grid gap-2">
					<h3 className="flex items-center gap-2 font-medium text-sm">
						<TargetIcon className="size-4 text-muted-foreground" />
						Roles sugeridos
					</h3>
					<div className="flex flex-wrap gap-2">
						{analysis.suggestedRoles.map((role) => (
							<Badge key={role} variant="outline">
								{role}
							</Badge>
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}
