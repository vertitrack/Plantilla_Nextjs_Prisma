"use client";

import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { computeAnalytics } from "@/lib/analytics";
import { useApp } from "@/lib/app-context";
import { fitColor, STATUS_LABELS, WORK_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

function Metric({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint?: string;
}) {
	return (
		<Card size="sm">
			<CardContent className="grid gap-1">
				<p className="text-muted-foreground text-xs">{label}</p>
				<p className="font-semibold text-3xl tabular-nums">{value}</p>
				{hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
			</CardContent>
		</Card>
	);
}

const pct = (n?: number) => (n === undefined ? "—" : `${n}%`);

export default function AnalyticsPage() {
	const { applications } = useApp();
	const a = useMemo(() => computeAnalytics(applications), [applications]);
	const log = useMemo(
		() =>
			applications.filter(
				(app) => app.notes || app.outcomeReason || app.status !== "discovered",
			),
		[applications],
	);

	const worksTips: string[] = [];
	if (a.fitThreshold !== undefined) {
		worksTips.push(
			`Has conseguido entrevistas con un fit desde ${a.fitThreshold}%. Prioriza vacantes por encima de ese umbral.`,
		);
	}
	if (
		a.avgFitInterview !== undefined &&
		a.avgFitRejected !== undefined &&
		a.avgFitInterview > a.avgFitRejected
	) {
		worksTips.push(
			`Tus entrevistas promedian ${a.avgFitInterview}% de fit vs. ${a.avgFitRejected}% en los rechazos: el fit score sí predice tus resultados.`,
		);
	}

	const failsTips: string[] = [];
	if (a.rejectedByWorkType.length) {
		const [wt, count] = a.rejectedByWorkType[0];
		failsTips.push(
			`La modalidad con más rechazos es ${WORK_TYPE_LABELS[wt].toLowerCase()} (${count} de ${a.rejectedCount}).`,
		);
	}
	if (a.lowFitRejected) {
		failsTips.push(
			`${a.lowFitRejected} rechazo(s) venían con bajo fit o recomendación PASS. Cuando la IA diga “No recomendado”, conviene descartar y ahorrar tiempo.`,
		);
	}
	if (a.passApplied) {
		failsTips.push(
			`Postulaste a ${a.passApplied} vacante(s) marcadas como PASS: revisa si valió la pena.`,
		);
	}

	return (
		<div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
			<PageHeader
				title="Analítica"
				description="Qué te funciona y qué no, según tus postulaciones reales."
			/>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Metric
					label="Postulaciones enviadas"
					value={String(a.sent)}
					hint={`${a.total} vacantes en total`}
				/>
				<Metric
					label="Tasa de entrevista"
					value={a.sent ? `${a.interviewRate}%` : "—"}
					hint={`${a.interviews} entrevistas · ${a.offers} ofertas`}
				/>
				<Metric
					label="Fit promedio con entrevista"
					value={pct(a.avgFitInterview)}
				/>
				<Metric
					label="Fit promedio en rechazos"
					value={pct(a.avgFitRejected)}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ThumbsUpIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
							Lo que SÍ te funciona
						</CardTitle>
						<CardDescription>
							Basado en tus entrevistas y ofertas.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						{worksTips.length ? (
							<ul className="grid gap-2 pl-5 text-sm">
								{worksTips.map((t) => (
									<li key={t} className="list-disc">
										{t}
									</li>
								))}
							</ul>
						) : (
							<p className="text-muted-foreground text-sm">
								Aún no hay entrevistas registradas. Mueve tus vacantes a “En
								entrevista” cuando avances.
							</p>
						)}
						{a.topSuccessSkills.length ? (
							<div className="grid gap-2">
								<p className="text-muted-foreground text-xs uppercase tracking-wide">
									Habilidades más repetidas en procesos exitosos
								</p>
								<div className="flex flex-wrap gap-1.5">
									{a.topSuccessSkills.map((s) => (
										<Badge key={s.label} variant="secondary">
											{s.label} · {s.count}
										</Badge>
									))}
								</div>
							</div>
						) : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ThumbsDownIcon className="size-4 text-destructive" />
							Lo que NO te funciona
						</CardTitle>
						<CardDescription>Patrones en tus rechazos.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						{failsTips.length ? (
							<ul className="grid gap-2 pl-5 text-sm">
								{failsTips.map((t) => (
									<li key={t} className="list-disc">
										{t}
									</li>
								))}
							</ul>
						) : (
							<p className="text-muted-foreground text-sm">
								Sin rechazos registrados todavía.
							</p>
						)}
						{a.topRejectedGaps.length ? (
							<div className="grid gap-2">
								<p className="text-muted-foreground text-xs uppercase tracking-wide">
									Brechas más frecuentes en rechazos (fuera de tu stack)
								</p>
								<div className="flex flex-wrap gap-1.5">
									{a.topRejectedGaps.map((s) => (
										<Badge key={s.label} variant="outline">
											{s.label} · {s.count}
										</Badge>
									))}
								</div>
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Bitácora global</CardTitle>
					<CardDescription>
						Notas, resultado y puntaje de cada vacante.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{log.length ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Vacante</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="text-right">Fit</TableHead>
									<TableHead className="hidden md:table-cell">Notas</TableHead>
									<TableHead className="hidden md:table-cell">
										Motivo del resultado
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{log.map((app) => (
									<TableRow key={app.id}>
										<TableCell className="max-w-56 whitespace-normal">
											<Link
												href={`/jobs/${app.id}?tab=log`}
												className="font-medium hover:underline"
											>
												{app.title}
											</Link>
											<p className="text-muted-foreground text-xs">
												{app.company}
											</p>
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{STATUS_LABELS[app.status]}
											</Badge>
										</TableCell>
										<TableCell
											className={cn(
												"text-right tabular-nums",
												fitColor(app.fitScore),
											)}
										>
											{pct(app.fitScore)}
										</TableCell>
										<TableCell className="hidden max-w-72 whitespace-normal text-muted-foreground text-xs md:table-cell">
											{app.notes || "—"}
										</TableCell>
										<TableCell className="hidden max-w-60 whitespace-normal text-muted-foreground text-xs md:table-cell">
											{app.outcomeReason || "—"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-sm">
							Todavía no hay movimientos que registrar.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
