"use client";

import {
	BellIcon,
	CalendarIcon,
	CheckIcon,
	ClockIcon,
	PartyPopperIcon,
	SearchIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/lib/app-context";
import {
	addDays,
	followupQueue,
	relativeDay,
	shortDate,
	staleApplications,
	upcomingInterviews,
} from "@/lib/followups";
import { STAGE_TYPE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { JobApplication } from "@/lib/types";
import { cn } from "@/lib/utils";

function Section({
	title,
	icon,
	count,
	children,
}: {
	title: string;
	icon: ReactNode;
	count: number;
	children: ReactNode;
}) {
	if (!count) return null;
	return (
		<section className="grid gap-3">
			<h2 className="flex items-center gap-2 font-medium text-sm">
				{icon}
				{title}
				<span className="text-muted-foreground tabular-nums">{count}</span>
			</h2>
			<div className="grid gap-2">{children}</div>
		</section>
	);
}

function Row({
	job,
	title,
	meta,
	tone,
	href,
	actions,
}: {
	job: JobApplication;
	title: string;
	meta: string;
	tone?: "danger" | "warn";
	href: string;
	actions?: ReactNode;
}) {
	return (
		<Card size="sm">
			<CardContent className="flex flex-wrap items-center gap-3">
				<Link href={href} className="grid min-w-0 flex-1 gap-0.5">
					<span className="truncate font-medium text-sm">{title}</span>
					<span className="truncate text-muted-foreground text-xs">
						{job.title} · {job.company}
					</span>
					<span
						className={cn(
							"text-xs",
							tone === "danger"
								? "text-destructive"
								: tone === "warn"
									? "text-amber-600 dark:text-amber-400"
									: "text-muted-foreground",
						)}
					>
						{meta}
					</span>
				</Link>
				{actions ? (
					<div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
						{actions}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}

export default function TodayPage() {
	const { applications, updateApplication, isLoadingDb } = useApp();
	const queue = followupQueue(applications);
	const due = queue.filter((q) => q.days <= 0);
	const soon = queue.filter((q) => q.days > 0 && q.days <= 7);
	const interviews = upcomingInterviews(applications).slice(0, 10);
	const stale = staleApplications(applications);
	const empty =
		!due.length && !soon.length && !interviews.length && !stale.length;

	const snooze = (job: JobApplication, days: number) =>
		updateApplication(job.id, { nextActionAt: addDays(days) });
	const done = (job: JobApplication) =>
		updateApplication(job.id, {
			nextAction: undefined,
			nextActionAt: undefined,
		});

	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-5 sm:px-6 sm:py-8">
			<PageHeader
				title="Hoy"
				description="Seguimientos y entrevistas para no dejar ninguna postulación enfriarse."
			/>

			{!isLoadingDb && empty ? (
				<div className="grid justify-items-center gap-3 rounded-lg border border-dashed p-10 text-center">
					<PartyPopperIcon className="size-6 text-muted-foreground" />
					<p className="font-medium">Todo al día</p>
					<p className="max-w-md text-muted-foreground text-sm">
						No tienes seguimientos pendientes. Al marcar una vacante como
						“Postulado” se agenda un seguimiento a 7 días automáticamente.
					</p>
					<Link href="/investigate" className={buttonVariants()}>
						<SearchIcon /> Investigar otra vacante
					</Link>
				</div>
			) : null}

			<Section
				title="Para hoy o vencidos"
				icon={<BellIcon className="size-4 text-destructive" />}
				count={due.length}
			>
				{due.map(({ job, days }) => (
					<Row
						key={job.id}
						job={job}
						href={`/jobs/${job.id}`}
						title={job.nextAction || "Hacer seguimiento"}
						meta={
							days < 0
								? `Vencido ${relativeDay(job.nextActionAt as string)}`
								: "Hoy"
						}
						tone={days < 0 ? "danger" : "warn"}
						actions={
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => snooze(job, 3)}
								>
									<ClockIcon /> +3 días
								</Button>
								<Button size="sm" onClick={() => done(job)}>
									<CheckIcon /> Hecho
								</Button>
							</>
						}
					/>
				))}
			</Section>

			<Section
				title="Próximas entrevistas"
				icon={<CalendarIcon className="size-4" />}
				count={interviews.length}
			>
				{interviews.map(({ job, stage }) => (
					<Row
						key={stage.id}
						job={job}
						href={`/jobs/${job.id}?tab=process`}
						title={stage.name}
						meta={`${STAGE_TYPE_LABELS[stage.type]} · ${shortDate(stage.date as string)} (${relativeDay(stage.date as string)})${stage.questions.length ? ` · ${stage.questions.length} preguntas para repasar` : ""}`}
						actions={
							<Link
								href={`/jobs/${job.id}?tab=process`}
								className={buttonVariants({ variant: "outline", size: "sm" })}
							>
								Preparar
							</Link>
						}
					/>
				))}
			</Section>

			<Section
				title="Esta semana"
				icon={<ClockIcon className="size-4" />}
				count={soon.length}
			>
				{soon.map(({ job }) => (
					<Row
						key={job.id}
						job={job}
						href={`/jobs/${job.id}`}
						title={job.nextAction || "Hacer seguimiento"}
						meta={`${shortDate(job.nextActionAt as string)} · ${relativeDay(job.nextActionAt as string)}`}
					/>
				))}
			</Section>

			<Section
				title="Sin respuesta hace más de 7 días"
				icon={<BellIcon className="size-4 text-muted-foreground" />}
				count={stale.length}
			>
				{stale.map((job) => (
					<Row
						key={job.id}
						job={job}
						href={`/jobs/${job.id}`}
						title="¿Hacer seguimiento?"
						meta={`${STATUS_LABELS[job.status]} desde ${relativeDay(job.dateApplied ?? job.dateAdded)}`}
						actions={
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									updateApplication(job.id, {
										nextAction: "Hacer seguimiento",
										nextActionAt: addDays(0),
									})
								}
							>
								<BellIcon /> Agendar para hoy
							</Button>
						}
					/>
				))}
			</Section>

			{stale.length || due.length ? (
				<p className="text-muted-foreground text-xs">
					<Badge variant="outline" className="mr-1">
						Tip
					</Badge>
					Un correo breve al reclutador 5–7 días después de postular aumenta tus
					probabilidades de respuesta.
				</p>
			) : null}
		</div>
	);
}
