"use client";

import {
	ArrowDownIcon,
	ArrowUpIcon,
	CalendarIcon,
	CheckIcon,
	ChevronDownIcon,
	Loader2Icon,
	PlusIcon,
	SparklesIcon,
	Trash2Icon,
	UserIcon,
	WandSparklesIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { DebouncedField } from "@/components/job/debounced-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	aiErrorMessage,
	answerQuestions,
	predictInterviewQuestions,
} from "@/lib/ai-client";
import { useApp } from "@/lib/app-context";
import {
	newId,
	pastQuestionsFor,
	processSummary,
	relativeDay,
	shortDate,
} from "@/lib/followups";
import {
	QUESTION_CATEGORY_LABELS,
	RATING_LABELS,
	STAGE_STATUS_LABELS,
	STAGE_TYPE_LABELS,
	stageStatusVariant,
} from "@/lib/labels";
import {
	type InterviewQuestion,
	type InterviewStage,
	type JobApplication,
	QUESTION_CATEGORIES,
	type QuestionCategory,
	STAGE_STATUSES,
	STAGE_TYPES,
	type StageStatus,
	type StageType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Save = (patch: Partial<JobApplication>) => Promise<void>;

const TYPE_ITEMS = STAGE_TYPES.map((t) => ({
	value: t,
	label: STAGE_TYPE_LABELS[t],
}));
const STATUS_ITEMS = STAGE_STATUSES.map((s) => ({
	value: s,
	label: STAGE_STATUS_LABELS[s],
}));
const CATEGORY_ITEMS = QUESTION_CATEGORIES.map((c) => ({
	value: c,
	label: QUESTION_CATEGORY_LABELS[c],
}));

/** Proceso típico para empezar rápido. */
const TEMPLATE: { name: string; type: StageType }[] = [
	{ name: "Screening con RR.HH.", type: "screening" },
	{ name: "Entrevista técnica", type: "technical" },
	{ name: "Entrevista final", type: "final" },
];

const makeStage = (name: string, type: StageType): InterviewStage => ({
	id: newId(),
	name,
	type,
	status: "pending",
	questions: [],
});

/**
 * Registro del proceso de selección de una vacante: etapas, fechas y las
 * preguntas que me hicieron (o que la IA predice) en cada una.
 */
export function InterviewProcess({
	job,
	save,
}: {
	job: JobApplication;
	save: Save;
}) {
	const stages = job.interviewStages ?? [];
	// Ref con la versión más reciente para que ediciones rápidas (autoguardado
	// con debounce en varias etapas) no se pisen entre sí.
	const stagesRef = useRef(stages);
	stagesRef.current = stages;

	const mutate = useCallback(
		(fn: (prev: InterviewStage[]) => InterviewStage[]) => {
			const next = fn(stagesRef.current);
			stagesRef.current = next;
			return save({ interviewStages: next });
		},
		[save],
	);

	const updateStage = useCallback(
		(id: string, patch: Partial<InterviewStage>) =>
			mutate((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
		[mutate],
	);

	const summary = processSummary(stages);

	return (
		<div className="grid gap-4">
			<Card>
				<CardContent className="grid gap-3">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<p className="font-medium">
							{summary.total
								? `Etapa ${Math.max(summary.current, 1)} de ${summary.total}`
								: "Aún no registras etapas"}
						</p>
						{summary.next ? (
							<p className="text-muted-foreground text-sm">
								Próxima: {summary.next.name}
								{summary.next.date
									? ` · ${shortDate(summary.next.date)} (${relativeDay(summary.next.date)})`
									: ""}
							</p>
						) : null}
					</div>
					{summary.total ? (
						<div className="flex gap-1" aria-hidden="true">
							{stages.map((s) => (
								<span
									key={s.id}
									className={cn(
										"h-1.5 flex-1 rounded-full",
										s.status === "passed" || s.status === "done"
											? "bg-primary"
											: s.status === "failed"
												? "bg-destructive"
												: s.status === "scheduled"
													? "bg-primary/40"
													: "bg-muted",
									)}
								/>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							Registra cuántas etapas tiene el proceso, cuáles son y qué te
							preguntaron en cada una. Así armas tu propio banco de preguntas
							por rol y empresa.
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						{stages.length === 0 ? (
							<Button
								onClick={() =>
									mutate(() => TEMPLATE.map((t) => makeStage(t.name, t.type)))
								}
							>
								<WandSparklesIcon /> Usar proceso típico (3 etapas)
							</Button>
						) : null}
						<Button
							variant="outline"
							onClick={() =>
								mutate((prev) => [
									...prev,
									makeStage(`Etapa ${prev.length + 1}`, "other"),
								])
							}
						>
							<PlusIcon /> Agregar etapa
						</Button>
					</div>
				</CardContent>
			</Card>

			{stages.map((stage, index) => (
				<StageCard
					key={stage.id}
					job={job}
					stage={stage}
					index={index}
					total={stages.length}
					defaultOpen={stage.id === summary.next?.id || stages.length === 1}
					onChange={(patch) => updateStage(stage.id, patch)}
					onMove={(delta) =>
						mutate((prev) => {
							const next = [...prev];
							const [item] = next.splice(index, 1);
							next.splice(index + delta, 0, item);
							return next;
						})
					}
					onDelete={() => {
						if (
							stage.questions.length &&
							!window.confirm(
								`¿Eliminar "${stage.name}" y sus ${stage.questions.length} preguntas?`,
							)
						)
							return;
						mutate((prev) => prev.filter((s) => s.id !== stage.id));
					}}
					mutateQuestions={(fn) =>
						mutate((prev) =>
							prev.map((s) =>
								s.id === stage.id ? { ...s, questions: fn(s.questions) } : s,
							),
						)
					}
				/>
			))}
		</div>
	);
}

function StageCard({
	job,
	stage,
	index,
	total,
	defaultOpen,
	onChange,
	onMove,
	onDelete,
	mutateQuestions,
}: {
	job: JobApplication;
	stage: InterviewStage;
	index: number;
	total: number;
	defaultOpen: boolean;
	onChange: (patch: Partial<InterviewStage>) => void;
	onMove: (delta: number) => void;
	onDelete: () => void;
	mutateQuestions: (
		fn: (prev: InterviewQuestion[]) => InterviewQuestion[],
	) => void;
}) {
	const { profile, hasProfile, applications } = useApp();
	const [draft, setDraft] = useState("");
	const [predicting, setPredicting] = useState(false);
	const asked = stage.questions.filter((q) => q.source === "asked").length;
	const predicted = stage.questions.length - asked;

	function addAsked() {
		const lines = draft
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		if (!lines.length) return;
		mutateQuestions((prev) => [
			...prev,
			...lines.map(
				(question): InterviewQuestion => ({
					id: newId(),
					question,
					source: "asked",
				}),
			),
		]);
		setDraft("");
		toast.success(`${lines.length} pregunta(s) registrada(s)`);
	}

	async function predict() {
		setPredicting(true);
		try {
			const { questions } = await predictInterviewQuestions(profile, job, {
				name: stage.name,
				type: stage.type,
				pastQuestions: pastQuestionsFor(applications, job, stage),
				existing: stage.questions.map((q) => q.question),
			});
			mutateQuestions((prev) => [
				...prev,
				...questions.map(
					(q): InterviewQuestion => ({
						id: newId(),
						question: q.question,
						source: "predicted",
						category: q.category,
						notes: q.hint ? `Pista: ${q.hint}` : undefined,
					}),
				),
			]);
			toast.success(`${questions.length} preguntas probables agregadas`);
		} catch (error) {
			toast.error(aiErrorMessage(error));
		} finally {
			setPredicting(false);
		}
	}

	return (
		<Collapsible defaultOpen={defaultOpen}>
			<Card className="gap-0 py-0">
				<div className="flex items-center gap-2 p-3 sm:p-4">
					<CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-3 text-left">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs tabular-nums">
							{index + 1}
						</span>
						<span className="grid min-w-0 gap-0.5">
							<span className="truncate font-medium text-sm">{stage.name}</span>
							<span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-muted-foreground text-xs">
								<span>{STAGE_TYPE_LABELS[stage.type]}</span>
								{stage.date ? (
									<span className="flex items-center gap-1">
										<CalendarIcon className="size-3" />
										{shortDate(stage.date)}
									</span>
								) : null}
								{stage.questions.length ? (
									<span>
										{asked} preguntadas
										{predicted ? ` · ${predicted} predichas` : ""}
									</span>
								) : null}
							</span>
						</span>
						<Badge
							variant={stageStatusVariant(stage.status)}
							className="ml-auto shrink-0"
						>
							{STAGE_STATUS_LABELS[stage.status]}
						</Badge>
						<ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
					</CollapsibleTrigger>
				</div>

				<CollapsibleContent className="grid gap-5 border-t p-3 sm:p-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="grid gap-1.5 sm:col-span-2">
							<Label htmlFor={`name-${stage.id}`}>Nombre de la etapa</Label>
							<DebouncedField
								id={`name-${stage.id}`}
								value={stage.name}
								onSave={(v) => onChange({ name: v || "Etapa" })}
							/>
						</div>
						<div className="grid gap-1.5">
							<Label>Tipo</Label>
							<Select
								items={TYPE_ITEMS}
								value={stage.type}
								onValueChange={(v) => onChange({ type: v as StageType })}
							>
								<SelectTrigger className="w-full" aria-label="Tipo de etapa">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TYPE_ITEMS.map((t) => (
										<SelectItem key={t.value} value={t.value}>
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label>Estado</Label>
							<Select
								items={STATUS_ITEMS}
								value={stage.status}
								onValueChange={(v) => onChange({ status: v as StageStatus })}
							>
								<SelectTrigger
									className="w-full"
									aria-label="Estado de la etapa"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_ITEMS.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor={`date-${stage.id}`}>Fecha</Label>
							<DebouncedField
								id={`date-${stage.id}`}
								type="date"
								value={stage.date ?? ""}
								onSave={(v) =>
									onChange({
										date: v || undefined,
										// Poner fecha a una etapa pendiente la deja "Agendada".
										status:
											v && stage.status === "pending"
												? "scheduled"
												: stage.status,
									})
								}
							/>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor={`who-${stage.id}`}>
								<UserIcon className="size-3.5" /> Entrevistador(es)
							</Label>
							<DebouncedField
								id={`who-${stage.id}`}
								value={stage.interviewer ?? ""}
								onSave={(v) => onChange({ interviewer: v || undefined })}
								placeholder="Ana (CTO), Pedro (Tech Lead)"
							/>
						</div>
						<div className="grid gap-1.5 sm:col-span-2">
							<Label htmlFor={`notes-${stage.id}`}>
								Notas y feedback de la etapa
							</Label>
							<DebouncedField
								id={`notes-${stage.id}`}
								multiline
								rows={3}
								value={stage.notes ?? ""}
								onSave={(v) => onChange({ notes: v || undefined })}
								placeholder="Duración, formato, qué evaluaron, cómo me sentí…"
							/>
						</div>
					</div>

					<div className="grid gap-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<p className="font-medium text-sm">Preguntas</p>
							<Button
								variant="outline"
								size="sm"
								onClick={predict}
								disabled={predicting || !hasProfile}
							>
								{predicting ? (
									<Loader2Icon className="animate-spin" />
								) : (
									<SparklesIcon />
								)}
								Predecir con IA
							</Button>
						</div>

						{stage.questions.map((q) => (
							<QuestionItem
								key={q.id}
								job={job}
								question={q}
								onChange={(patch) =>
									mutateQuestions((prev) =>
										prev.map((x) => (x.id === q.id ? { ...x, ...patch } : x)),
									)
								}
								onDelete={() =>
									mutateQuestions((prev) => prev.filter((x) => x.id !== q.id))
								}
							/>
						))}

						<div className="grid gap-2">
							<Label
								htmlFor={`draft-${stage.id}`}
								className="text-muted-foreground"
							>
								¿Qué te preguntaron? (una por línea)
							</Label>
							<Textarea
								id={`draft-${stage.id}`}
								rows={3}
								value={draft}
								onChange={(e) => setDraft(e.target.value)}
								placeholder={
									"Cuéntame de un conflicto con un compañero\n¿Cómo escalarías esta API?"
								}
							/>
							<Button
								variant="secondary"
								onClick={addAsked}
								disabled={!draft.trim()}
								className="w-full sm:w-fit"
							>
								<PlusIcon /> Registrar preguntas
							</Button>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
						<div className="flex gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Subir etapa"
								disabled={index === 0}
								onClick={() => onMove(-1)}
							>
								<ArrowUpIcon />
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Bajar etapa"
								disabled={index === total - 1}
								onClick={() => onMove(1)}
							>
								<ArrowDownIcon />
							</Button>
						</div>
						<Button variant="ghost" size="sm" onClick={onDelete}>
							<Trash2Icon /> Eliminar etapa
						</Button>
					</div>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}

function QuestionItem({
	job,
	question: q,
	onChange,
	onDelete,
}: {
	job: JobApplication;
	question: InterviewQuestion;
	onChange: (patch: Partial<InterviewQuestion>) => void;
	onDelete: () => void;
}) {
	const { profile, hasProfile } = useApp();
	const [loading, setLoading] = useState(false);

	async function draftAnswer() {
		setLoading(true);
		try {
			const { answers } = await answerQuestions(profile, job, [q.question]);
			const a = answers[0];
			if (a) onChange({ myAnswer: a.answer });
			toast.success("Respuesta sugerida lista");
		} catch (error) {
			toast.error(aiErrorMessage(error));
		} finally {
			setLoading(false);
		}
	}

	return (
		<Collapsible className="rounded-lg border">
			<CollapsibleTrigger className="group flex w-full items-start gap-2 p-3 text-left">
				<span className="grid min-w-0 flex-1 gap-1.5">
					<span className="text-sm leading-snug">{q.question}</span>
					<span className="flex flex-wrap gap-1">
						<Badge
							variant={q.source === "asked" ? "default" : "outline"}
							className="text-[10px]"
						>
							{q.source === "asked" ? "Me la hicieron" : "Predicha por IA"}
						</Badge>
						{q.category ? (
							<Badge variant="secondary" className="text-[10px]">
								{QUESTION_CATEGORY_LABELS[q.category]}
							</Badge>
						) : null}
						{q.rating ? (
							<Badge
								variant={q.rating === 1 ? "destructive" : "outline"}
								className="text-[10px]"
							>
								{RATING_LABELS[q.rating]}
							</Badge>
						) : null}
						{q.myAnswer ? (
							<Badge variant="outline" className="text-[10px]">
								<CheckIcon /> Con respuesta
							</Badge>
						) : null}
					</span>
				</span>
				<ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
			</CollapsibleTrigger>
			<CollapsibleContent className="grid gap-3 border-t p-3">
				{q.notes?.startsWith("Pista:") ? (
					<p className="rounded-md bg-muted/60 p-2 text-muted-foreground text-xs">
						{q.notes}
					</p>
				) : null}
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="grid gap-1.5">
						<Label>Categoría</Label>
						<Select
							items={CATEGORY_ITEMS}
							value={q.category ?? null}
							onValueChange={(v) =>
								onChange({ category: (v as QuestionCategory) ?? undefined })
							}
						>
							<SelectTrigger className="w-full" aria-label="Categoría">
								<SelectValue placeholder="Sin categoría" />
							</SelectTrigger>
							<SelectContent>
								{CATEGORY_ITEMS.map((c) => (
									<SelectItem key={c.value} value={c.value}>
										{c.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-1.5">
						<Label>¿Cómo te fue?</Label>
						{/* biome-ignore lint/a11y/useSemanticElements: grupo de botones tipo filtro */}
						<div
							role="group"
							aria-label="Autoevaluación"
							className="flex gap-1"
						>
							{([1, 2, 3] as const).map((r) => (
								<Button
									key={r}
									type="button"
									size="sm"
									variant={q.rating === r ? "default" : "outline"}
									aria-pressed={q.rating === r}
									className="flex-1"
									onClick={() =>
										onChange({ rating: q.rating === r ? undefined : r })
									}
								>
									{RATING_LABELS[r]}
								</Button>
							))}
						</div>
					</div>
				</div>
				<div className="grid gap-1.5">
					<div className="flex items-center justify-between gap-2">
						<Label htmlFor={`answer-${q.id}`}>Mi respuesta</Label>
						<div className="flex gap-1">
							{q.myAnswer ? (
								<CopyButton text={q.myAnswer} size="xs" variant="ghost" />
							) : null}
							<Button
								variant="ghost"
								size="xs"
								onClick={draftAnswer}
								disabled={loading || !hasProfile}
							>
								{loading ? (
									<Loader2Icon className="animate-spin" />
								) : (
									<SparklesIcon />
								)}
								Sugerir con IA
							</Button>
						</div>
					</div>
					<DebouncedField
						id={`answer-${q.id}`}
						multiline
						rows={4}
						value={q.myAnswer ?? ""}
						onSave={(v) => onChange({ myAnswer: v || undefined })}
						placeholder="Qué respondí o qué quiero responder la próxima vez…"
					/>
				</div>
				{!q.notes?.startsWith("Pista:") ? (
					<div className="grid gap-1.5">
						<Label htmlFor={`qnotes-${q.id}`}>Notas</Label>
						<DebouncedField
							id={`qnotes-${q.id}`}
							value={q.notes ?? ""}
							onSave={(v) => onChange({ notes: v || undefined })}
							placeholder="Repreguntas, reacción del entrevistador…"
						/>
					</div>
				) : null}
				<div className="flex flex-wrap justify-between gap-2">
					{q.source === "predicted" ? (
						<Button
							variant="secondary"
							size="sm"
							onClick={() => onChange({ source: "asked" })}
						>
							<CheckIcon /> Me la hicieron
						</Button>
					) : (
						<span />
					)}
					<Button variant="ghost" size="sm" onClick={onDelete}>
						<Trash2Icon /> Quitar
					</Button>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
