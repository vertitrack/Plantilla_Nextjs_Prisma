"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	PlusIcon,
	SearchIcon,
	SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";
import {
	BOARD_COLUMNS,
	fitColor,
	RECOMMENDATION_LABELS,
	STAGE_ORDER,
	WORK_TYPE_LABELS,
} from "@/lib/labels";
import type { JobApplication, JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkFilter = "all" | "remote" | "hybrid";
type FitFilter = 0 | 75 | 85;

function Segmented<T extends string | number>({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
}) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: grupo de botones tipo filtro
		<div
			role="group"
			aria-label={label}
			className="inline-flex rounded-lg border p-0.5"
		>
			{options.map((o) => (
				<button
					key={String(o.value)}
					type="button"
					aria-pressed={value === o.value}
					onClick={() => onChange(o.value)}
					className={cn(
						"rounded-md px-2.5 py-1 text-xs transition-colors",
						value === o.value
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}

function matches(job: JobApplication, query: string) {
	if (!query) return true;
	const haystack = [
		job.title,
		job.company,
		job.location,
		...(job.matchingSkills ?? []),
		...(job.missingSkills ?? []),
		...(job.atsKeywordsIncluded ?? []),
	]
		.join(" ")
		.toLowerCase();
	return query
		.toLowerCase()
		.split(/\s+/)
		.every((term) => haystack.includes(term));
}

function JobCard({ job }: { job: JobApplication }) {
	const { updateStatus } = useApp();
	// "Descartada" se mueve como si estuviera en la última etapa.
	const stage = STAGE_ORDER.indexOf(
		job.status === "passed" ? "rejected" : job.status,
	);
	const move = (delta: number) => {
		const next = STAGE_ORDER[stage + delta] as JobStatus | undefined;
		if (next) updateStatus(job.id, next);
	};

	return (
		<article className="grid gap-2 rounded-lg border bg-card p-3 shadow-xs">
			<Link
				href={`/jobs/${job.id}`}
				className="font-medium text-sm leading-snug hover:underline"
			>
				{job.title}
			</Link>
			<p className="text-muted-foreground text-xs">
				{[job.company, job.workType ? WORK_TYPE_LABELS[job.workType] : null]
					.filter(Boolean)
					.join(" · ")}
			</p>
			<div className="flex flex-wrap items-center gap-1.5">
				{job.fitScore !== undefined ? (
					<span
						className={cn(
							"font-semibold text-sm tabular-nums",
							fitColor(job.fitScore),
						)}
					>
						{job.fitScore}%
					</span>
				) : null}
				{job.recommendation ? (
					<Badge variant="outline" className="text-[10px]">
						{RECOMMENDATION_LABELS[job.recommendation]}
					</Badge>
				) : null}
				{job.status === "passed" ? (
					<Badge variant="outline">Descartada</Badge>
				) : null}
			</div>
			<div className="flex items-center justify-between gap-1 pt-1">
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label="Mover a la etapa anterior"
					disabled={stage <= 0}
					onClick={() => move(-1)}
				>
					<ChevronLeftIcon />
				</Button>
				<Link
					href={`/jobs/${job.id}`}
					className={buttonVariants({ variant: "ghost", size: "xs" })}
				>
					<SparklesIcon /> Ver copiloto
				</Link>
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label="Mover a la siguiente etapa"
					disabled={stage >= STAGE_ORDER.length - 1}
					onClick={() => move(1)}
				>
					<ChevronRightIcon />
				</Button>
			</div>
		</article>
	);
}

export default function BoardPage() {
	const { applications, isLoadingDb } = useApp();
	const [query, setQuery] = useState("");
	const [work, setWork] = useState<WorkFilter>("all");
	const [fit, setFit] = useState<FitFilter>(0);

	const filtered = useMemo(
		() =>
			applications.filter(
				(a) =>
					matches(a, query.trim()) &&
					(work === "all" || a.workType === work) &&
					(fit === 0 || (a.fitScore ?? 0) >= fit),
			),
		[applications, query, work, fit],
	);

	return (
		<div className="grid w-full gap-6 px-4 py-8 sm:px-6">
			<PageHeader
				title="Tablero"
				description={`${applications.length} vacantes en seguimiento`}
				actions={
					<Link href="/investigate" className={buttonVariants()}>
						<PlusIcon /> Investigar vacante
					</Link>
				}
			/>

			<div className="flex flex-wrap items-center gap-3">
				<div className="relative w-full sm:w-72">
					<SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
					<Input
						aria-label="Buscar"
						placeholder="Cargo, empresa o tecnología"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="pl-8"
					/>
				</div>
				<Segmented
					label="Modalidad"
					value={work}
					onChange={setWork}
					options={[
						{ value: "all", label: "Todos" },
						{ value: "remote", label: "Remoto" },
						{ value: "hybrid", label: "Híbrido" },
					]}
				/>
				<Segmented
					label="Afinidad"
					value={fit}
					onChange={setFit}
					options={[
						{ value: 0, label: "Cualquier fit" },
						{ value: 75, label: "≥ 75%" },
						{ value: 85, label: "≥ 85%" },
					]}
				/>
			</div>

			{!isLoadingDb && applications.length === 0 ? (
				<div className="grid justify-items-center gap-3 rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium">Tu tablero está vacío</p>
					<p className="max-w-md text-muted-foreground text-sm">
						Investiga tu primera vacante: pega el enlace o el texto y la IA te
						dirá si vale la pena postular.
					</p>
					<Link href="/investigate" className={buttonVariants()}>
						<SearchIcon /> Investigar vacante
					</Link>
				</div>
			) : (
				<div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
					<div className="grid min-w-max grid-flow-col auto-cols-[260px] gap-4">
						{BOARD_COLUMNS.map((col) => {
							const jobs = filtered.filter((a) =>
								col.statuses.includes(a.status),
							);
							return (
								<section
									key={col.id}
									aria-label={col.title}
									className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3"
								>
									<header className="flex items-center justify-between px-1">
										<h2 className="font-medium text-sm">{col.title}</h2>
										<span className="text-muted-foreground text-xs tabular-nums">
											{jobs.length}
										</span>
									</header>
									{jobs.map((job) => (
										<JobCard key={job.id} job={job} />
									))}
									{jobs.length === 0 ? (
										<p className="px-1 py-4 text-center text-muted-foreground text-xs">
											Sin vacantes
										</p>
									) : null}
								</section>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
