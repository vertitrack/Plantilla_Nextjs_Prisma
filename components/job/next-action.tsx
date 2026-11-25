"use client";

import { BellIcon, CheckIcon } from "lucide-react";
import { DebouncedField } from "@/components/job/debounced-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addDays, DUE_LABELS, dueState, relativeDay } from "@/lib/followups";
import type { JobApplication } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Próxima acción de seguimiento de una vacante, con atajos de fecha. */
export function NextAction({
	job,
	save,
}: {
	job: JobApplication;
	save: (patch: Partial<JobApplication>) => Promise<void>;
}) {
	const due = dueState(job);
	const setDate = (days: number) =>
		save({
			nextAction: job.nextAction || "Hacer seguimiento",
			nextActionAt: addDays(days),
		});

	return (
		<section
			aria-label="Próxima acción"
			className={cn(
				"grid gap-3 rounded-lg border p-3",
				due === "overdue" && "border-destructive/50 bg-destructive/5",
				due === "today" && "border-amber-500/50 bg-amber-500/5",
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<p className="flex items-center gap-1.5 font-medium text-sm">
					<BellIcon className="size-4 text-muted-foreground" />
					Próxima acción
				</p>
				{job.nextActionAt ? (
					<span
						className={cn(
							"text-xs",
							due === "overdue"
								? "text-destructive"
								: due === "today"
									? "text-amber-600 dark:text-amber-400"
									: "text-muted-foreground",
						)}
					>
						{due ? `${DUE_LABELS[due]} · ` : ""}
						{relativeDay(job.nextActionAt)}
					</span>
				) : null}
			</div>
			<div className="grid gap-2 sm:grid-cols-[1fr_11rem]">
				<div className="grid gap-1">
					<Label htmlFor="nextAction" className="sr-only">
						Qué hacer
					</Label>
					<DebouncedField
						id="nextAction"
						value={job.nextAction ?? ""}
						onSave={(v) => save({ nextAction: v || undefined })}
						placeholder="Escribir al reclutador, preparar técnica…"
					/>
				</div>
				<div className="grid gap-1">
					<Label htmlFor="nextActionAt" className="sr-only">
						Cuándo
					</Label>
					<DebouncedField
						id="nextActionAt"
						type="date"
						value={job.nextActionAt ?? ""}
						onSave={(v) => save({ nextActionAt: v || undefined })}
					/>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onClick={() => setDate(1)}>
					Mañana
				</Button>
				<Button variant="outline" size="sm" onClick={() => setDate(3)}>
					+3 días
				</Button>
				<Button variant="outline" size="sm" onClick={() => setDate(7)}>
					+1 semana
				</Button>
				{job.nextActionAt || job.nextAction ? (
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							save({ nextAction: undefined, nextActionAt: undefined })
						}
					>
						<CheckIcon /> Hecho
					</Button>
				) : null}
			</div>
		</section>
	);
}
