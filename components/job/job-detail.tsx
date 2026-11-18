"use client";

import {
	ArrowLeftIcon,
	BookOpenIcon,
	DownloadIcon,
	ExternalLinkIcon,
	FileTextIcon,
	Loader2Icon,
	MessageSquareTextIcon,
	NotebookPenIcon,
	RefreshCwIcon,
	SparklesIcon,
	Trash2Icon,
	WandSparklesIcon,
	XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { DebouncedField } from "@/components/job/debounced-field";
import {
	EvaluationView,
	NoProfileWarning,
} from "@/components/job/evaluation-view";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	aiErrorMessage,
	answerQuestions,
	evaluateJob,
	tailorResume,
} from "@/lib/ai-client";
import { useApp } from "@/lib/app-context";
import { SUGGESTED_QUESTIONS } from "@/lib/examples";
import { fitColor, STATUS_LABELS, WORK_TYPE_LABELS } from "@/lib/labels";
import { downloadMarkdown, slugify } from "@/lib/markdown";
import { JOB_STATUSES, type JobApplication, type JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_ITEMS = JOB_STATUSES.map((s) => ({
	value: s,
	label: STATUS_LABELS[s],
}));

export function JobDetail({
	id,
	initialTab,
	autoTailor,
}: {
	id: string;
	initialTab: string;
	autoTailor: boolean;
}) {
	const router = useRouter();
	const {
		applications,
		isLoadingDb,
		hasProfile,
		updateApplication,
		updateStatus,
		deleteApplication,
	} = useApp();
	const job = applications.find((a) => a.id === id);
	const [tab, setTab] = useState(initialTab);

	const save = useCallback(
		(patch: Partial<JobApplication>) => updateApplication(id, patch),
		[id, updateApplication],
	);

	if (!job) {
		return (
			<div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-16 text-center sm:px-6">
				{isLoadingDb ? (
					<Loader2Icon className="mx-auto size-5 animate-spin text-muted-foreground" />
				) : (
					<>
						<p className="text-muted-foreground">
							Esta postulación no existe o fue eliminada.
						</p>
						<Link
							href="/"
							className={cn(buttonVariants({ variant: "outline" }), "mx-auto")}
						>
							Volver al tablero
						</Link>
					</>
				)}
			</div>
		);
	}

	const meta = [job.company, job.location, job.salaryRange]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6">
			<div className="grid gap-4">
				<Link
					href="/"
					className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
				>
					<ArrowLeftIcon className="size-4" /> Tablero
				</Link>
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="grid min-w-0 gap-1">
						<h1 className="font-heading font-semibold text-2xl tracking-tight">
							{job.title}
						</h1>
						<p className="text-muted-foreground text-sm">{meta}</p>
						<div className="flex flex-wrap items-center gap-2 pt-1">
							{job.workType ? (
								<Badge variant="outline">
									{WORK_TYPE_LABELS[job.workType]}
								</Badge>
							) : null}
							{job.fitScore !== undefined ? (
								<Badge variant="secondary" className={fitColor(job.fitScore)}>
									Fit {job.fitScore}%
								</Badge>
							) : null}
							{job.dateApplied ? (
								<span className="text-muted-foreground text-xs">
									Postulado el {job.dateApplied}
								</span>
							) : null}
							{job.url ? (
								<a
									href={job.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-muted-foreground text-xs underline"
								>
									Oferta original <ExternalLinkIcon className="size-3" />
								</a>
							) : null}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Select
							items={STATUS_ITEMS}
							value={job.status}
							onValueChange={(v) => {
								updateStatus(id, v as JobStatus);
								toast.success(`Estado: ${STATUS_LABELS[v as JobStatus]}`);
							}}
						>
							<SelectTrigger className="w-44" aria-label="Estado">
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
						<Button
							variant="ghost"
							size="icon"
							aria-label="Eliminar postulación"
							onClick={() => {
								if (!window.confirm(`¿Eliminar "${job.title}" de tu tablero?`))
									return;
								deleteApplication(id);
								router.push("/");
							}}
						>
							<Trash2Icon />
						</Button>
					</div>
				</div>
			</div>

			{!hasProfile ? <NoProfileWarning /> : null}

			<Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
				<TabsList className="flex h-auto w-full flex-wrap justify-start">
					<TabsTrigger value="evaluation">
						<SparklesIcon /> Evaluación
					</TabsTrigger>
					<TabsTrigger value="tailor">
						<FileTextIcon /> CV y carta
					</TabsTrigger>
					<TabsTrigger value="qa">
						<MessageSquareTextIcon /> Preguntas
					</TabsTrigger>
					<TabsTrigger value="log">
						<NotebookPenIcon /> Bitácora
					</TabsTrigger>
				</TabsList>
				<TabsContent value="evaluation" className="pt-3">
					<EvaluationTab job={job} save={save} />
				</TabsContent>
				<TabsContent value="tailor" className="pt-3">
					<TailorTab job={job} save={save} auto={autoTailor} />
				</TabsContent>
				<TabsContent value="qa" className="pt-3">
					<QaTab job={job} save={save} />
				</TabsContent>
				<TabsContent value="log" className="pt-3">
					<LogTab job={job} save={save} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

type TabProps = {
	job: JobApplication;
	save: (patch: Partial<JobApplication>) => Promise<void>;
};

// ---------- Pestañas ----------

function EvaluationTab({ job, save }: TabProps) {
	const { profile, hasProfile } = useApp();
	const [loading, setLoading] = useState(false);
	const evaluated = job.fitScore !== undefined;

	async function run() {
		setLoading(true);
		try {
			const result = await evaluateJob(profile, job);
			await save({
				...result,
				status: job.status === "discovered" ? "evaluating" : job.status,
			});
			toast.success("Evaluación actualizada");
		} catch (error) {
			toast.error(aiErrorMessage(error));
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="grid gap-5">
			{evaluated ? (
				<EvaluationView evaluation={job} />
			) : (
				<Card>
					<CardContent className="grid justify-items-start gap-3">
						<p className="text-muted-foreground text-sm">
							Aún no evalúas esta vacante contra tu CV maestro.
						</p>
					</CardContent>
				</Card>
			)}
			<div className="flex flex-wrap gap-2">
				<Button
					variant={evaluated ? "outline" : "default"}
					onClick={run}
					disabled={loading || !hasProfile}
				>
					{loading ? (
						<Loader2Icon className="animate-spin" />
					) : evaluated ? (
						<RefreshCwIcon />
					) : (
						<SparklesIcon />
					)}
					{evaluated ? "Reevaluar" : "Evaluar ahora"}
				</Button>
			</div>
			<Collapsible className="rounded-lg border">
				<CollapsibleTrigger className="flex w-full items-center gap-2 p-4 text-left font-medium text-sm">
					<BookOpenIcon className="size-4 text-muted-foreground" />
					Texto original de la vacante
				</CollapsibleTrigger>
				<CollapsibleContent className="border-t p-4">
					<p className="whitespace-pre-line text-muted-foreground text-sm">
						{job.sourceText || "Sin texto guardado."}
					</p>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

function TailorTab({ job, save, auto }: TabProps & { auto: boolean }) {
	const { profile, hasProfile } = useApp();
	const [loading, setLoading] = useState(false);
	const started = useRef(false);
	const hasDocs = Boolean(
		job.tailoredResumeMarkdown || job.tailoredCoverLetterMarkdown,
	);

	async function run() {
		setLoading(true);
		try {
			await save(await tailorResume(profile, job));
			toast.success("CV y carta adaptados");
		} catch (error) {
			toast.error(aiErrorMessage(error));
		} finally {
			setLoading(false);
		}
	}

	// "Guardar y adaptar CV ahora" llega con ?auto=1: generamos una sola vez.
	// biome-ignore lint/correctness/useExhaustiveDependencies: solo al montar
	useEffect(() => {
		if (auto && !hasDocs && hasProfile && !started.current) {
			started.current = true;
			run();
		}
	}, []);

	const base = slugify(`${job.company}-${job.title}`);

	return (
		<div className="grid gap-5">
			<div className="flex flex-wrap items-center gap-3">
				<Button
					variant={hasDocs ? "outline" : "default"}
					onClick={run}
					disabled={loading || !hasProfile}
				>
					{loading ? (
						<Loader2Icon className="animate-spin" />
					) : (
						<WandSparklesIcon />
					)}
					{hasDocs ? "Regenerar" : "Generar CV y carta adaptados"}
				</Button>
				{loading ? (
					<span className="text-muted-foreground text-sm">
						Reescribiendo tu CV con las palabras clave de la oferta…
					</span>
				) : null}
			</div>

			{hasDocs ? (
				<>
					<Card>
						<CardHeader>
							<CardTitle>{job.tailoredHeadline}</CardTitle>
							<CardDescription>{job.tailoredSummary}</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4">
							{job.keyPitchAngle ? (
								<div className="grid gap-1">
									<p className="text-muted-foreground text-xs uppercase tracking-wide">
										Ángulo de propuesta de valor
									</p>
									<p className="text-sm">{job.keyPitchAngle}</p>
								</div>
							) : null}
							{job.atsKeywordsIncluded?.length ? (
								<div className="grid gap-2">
									<p className="text-muted-foreground text-xs uppercase tracking-wide">
										Palabras clave ATS integradas
									</p>
									<div className="flex flex-wrap gap-1.5">
										{job.atsKeywordsIncluded.map((k) => (
											<Badge key={k} variant="secondary">
												{k}
											</Badge>
										))}
									</div>
								</div>
							) : null}
						</CardContent>
					</Card>
					<DocumentCard
						title="Currículum adaptado"
						content={job.tailoredResumeMarkdown}
						filename={`cv-${base}`}
					/>
					<DocumentCard
						title="Carta de presentación"
						content={job.tailoredCoverLetterMarkdown}
						filename={`carta-${base}`}
					/>
				</>
			) : !loading ? (
				<p className="text-muted-foreground text-sm">
					La IA reescribe tu titular, resumen y logros reales destacando lo que
					pide esta oferta, sin inventar empresas ni años de experiencia.
				</p>
			) : null}
		</div>
	);
}

function QaTab({ job, save }: TabProps) {
	const { profile, hasProfile } = useApp();
	const [questions, setQuestions] = useState("");
	const [loading, setLoading] = useState(false);

	async function run() {
		const list = questions
			.split("\n")
			.map((q) => q.trim())
			.filter(Boolean);
		if (!list.length) return;
		setLoading(true);
		try {
			const { answers } = await answerQuestions(profile, job, list);
			await save({ qaPairs: [...answers, ...(job.qaPairs ?? [])] });
			setQuestions("");
			toast.success(`${answers.length} respuesta(s) generada(s)`);
		} catch (error) {
			toast.error(aiErrorMessage(error));
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="grid gap-5">
			<Card>
				<CardContent className="grid gap-3">
					<Label htmlFor="questions">
						Preguntas del formulario (una por línea)
					</Label>
					<Textarea
						id="questions"
						rows={5}
						value={questions}
						onChange={(e) => setQuestions(e.target.value)}
						placeholder="¿Por qué quieres trabajar con nosotros?"
						disabled={loading}
					/>
					<div className="flex flex-wrap gap-2">
						<Button
							onClick={run}
							disabled={loading || !questions.trim() || !hasProfile}
						>
							{loading ? (
								<Loader2Icon className="animate-spin" />
							) : (
								<SparklesIcon />
							)}
							Generar respuestas
						</Button>
						<Button
							variant="outline"
							onClick={() => setQuestions(SUGGESTED_QUESTIONS.join("\n"))}
							disabled={loading}
						>
							Cargar 3 sugerencias
						</Button>
					</div>
				</CardContent>
			</Card>

			{(job.qaPairs ?? []).map((qa, i) => (
				<Card key={`${qa.question}-${i}`}>
					<CardHeader>
						<CardTitle className="text-base">{qa.question}</CardTitle>
						<CardAction className="flex gap-1">
							<CopyButton text={qa.answer} size="xs" variant="ghost" />
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label="Quitar respuesta"
								onClick={() =>
									save({ qaPairs: job.qaPairs.filter((_, j) => j !== i) })
								}
							>
								<XIcon />
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent className="grid gap-3">
						<p className="whitespace-pre-line text-sm leading-relaxed">
							{qa.answer}
						</p>
						{qa.groundedIn ? (
							<p className="text-muted-foreground text-xs">
								<span className="font-medium text-foreground">Fuente:</span>{" "}
								{qa.groundedIn}
							</p>
						) : null}
						{qa.tips ? (
							<p className="text-muted-foreground text-xs">
								<span className="font-medium text-foreground">
									Para la entrevista:
								</span>{" "}
								{qa.tips}
							</p>
						) : null}
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function LogTab({ job, save }: TabProps) {
	return (
		<Card>
			<CardContent className="grid gap-5">
				<div className="grid gap-1.5 sm:max-w-xs">
					<Label htmlFor="dateApplied">Fecha de postulación</Label>
					<DebouncedField
						id="dateApplied"
						type="date"
						value={job.dateApplied ?? ""}
						onSave={(v) => save({ dateApplied: v || undefined })}
					/>
				</div>
				<div className="grid gap-1.5">
					<Label htmlFor="notes">
						Notas: entrevistas, fechas, feedback de reclutadores
					</Label>
					<DebouncedField
						id="notes"
						multiline
						rows={8}
						value={job.notes ?? ""}
						onSave={(v) => save({ notes: v })}
						placeholder="12/11 — Entrevista técnica con Ana (CTO)…"
					/>
				</div>
				<div className="grid gap-1.5">
					<Label htmlFor="outcome">
						Motivo del resultado (rechazo, descarte u oferta)
					</Label>
					<DebouncedField
						id="outcome"
						multiline
						rows={3}
						value={job.outcomeReason ?? ""}
						onSave={(v) => save({ outcomeReason: v })}
					/>
				</div>
				<p className="text-muted-foreground text-xs">
					Se guarda automáticamente.
				</p>
			</CardContent>
		</Card>
	);
}

function DocumentCard({
	title,
	content,
	filename,
}: {
	title: string;
	content?: string;
	filename: string;
}) {
	if (!content) return null;
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardAction className="flex flex-wrap gap-2">
					<CopyButton text={content} label="Copiar Markdown" />
					<Button
						variant="outline"
						size="sm"
						onClick={() => downloadMarkdown(filename, content)}
					>
						<DownloadIcon /> Descargar .md
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<Markdown>{content}</Markdown>
			</CardContent>
		</Card>
	);
}
