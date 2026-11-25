"use client";

import {
	ClipboardPasteIcon,
	LinkIcon,
	Loader2Icon,
	SaveIcon,
	SparklesIcon,
	WandSparklesIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import {
	EvaluationView,
	NoProfileWarning,
} from "@/components/job/evaluation-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	aiErrorMessage,
	evaluateJob,
	extractJobText,
	scrapeJobUrl,
} from "@/lib/ai-client";
import { today, useApp } from "@/lib/app-context";
import { EXAMPLE_JOB_TEXT } from "@/lib/examples";
import { WORK_TYPE_LABELS } from "@/lib/labels";
import type { JobEvaluation, ScrapedJob } from "@/lib/types";

type Step = "idle" | "extracting" | "evaluating";

export default function InvestigatePage() {
	const router = useRouter();
	const { profile, hasProfile, addApplication } = useApp();
	const [tab, setTab] = useState<string>("url");
	const [url, setUrl] = useState("");
	const [text, setText] = useState("");
	const [step, setStep] = useState<Step>("idle");
	const [job, setJob] = useState<ScrapedJob | null>(null);
	const [evaluation, setEvaluation] = useState<JobEvaluation | null>(null);
	const [saving, setSaving] = useState(false);

	const busy = step !== "idle";

	async function run(extract: () => Promise<ScrapedJob>) {
		setJob(null);
		setEvaluation(null);
		setStep("extracting");
		let extracted: ScrapedJob;
		try {
			extracted = await extract();
			setJob(extracted);
		} catch (error) {
			setStep("idle");
			const canFallback = (error as { data?: { canFallback?: boolean } }).data
				?.canFallback;
			toast.error(aiErrorMessage(error));
			// Si el portal bloquea bots o exige login, pasamos al pegado manual.
			if (canFallback && tab === "url") setTab("text");
			return;
		}
		if (!hasProfile) {
			setStep("idle");
			return;
		}
		setStep("evaluating");
		try {
			setEvaluation(
				await evaluateJob(profile, {
					title: extracted.title,
					company: extracted.company,
					sourceText: extracted.fullText,
				}),
			);
		} catch (error) {
			toast.error(aiErrorMessage(error));
		} finally {
			setStep("idle");
		}
	}

	async function save(thenTailor: boolean) {
		if (!job) return;
		setSaving(true);
		const saved = await addApplication({
			title: job.title,
			company: job.company,
			location: job.location,
			url: job.url || undefined,
			sourceText: job.fullText,
			salaryRange: job.salaryRange,
			workType: job.workType,
			status: evaluation ? "evaluating" : "discovered",
			dateAdded: today(),
			matchingSkills: evaluation?.matchingSkills ?? [],
			missingSkills: evaluation?.missingSkills ?? [],
			pros: evaluation?.pros ?? [],
			cons: evaluation?.cons ?? [],
			interviewTips: evaluation?.interviewTips ?? [],
			fitScore: evaluation?.fitScore,
			recommendation: evaluation?.recommendation,
			recommendationHeadline: evaluation?.recommendationHeadline,
			reasoning: evaluation?.reasoning,
			estimatedSeniority: evaluation?.estimatedSeniority,
			qaPairs: [],
			interviewStages: [],
		});
		setSaving(false);
		if (!saved) return;
		router.push(thenTailor ? `/jobs/${saved.id}?tab=tailor&auto=1` : "/");
	}

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6">
			<PageHeader
				title="Investigar vacante"
				description="Analiza una oferta antes de invertir tiempo en postular: ¿postulo o no?"
			/>

			{!hasProfile ? <NoProfileWarning /> : null}

			<Card>
				<CardContent>
					<Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
						<TabsList>
							<TabsTrigger value="url">
								<LinkIcon /> Por enlace
							</TabsTrigger>
							<TabsTrigger value="text">
								<ClipboardPasteIcon /> Pegar texto
							</TabsTrigger>
						</TabsList>
						<TabsContent value="url" className="pt-3">
							<form
								className="flex flex-col gap-2 sm:flex-row"
								onSubmit={(e) => {
									e.preventDefault();
									run(() => scrapeJobUrl(url.trim()));
								}}
							>
								<Label htmlFor="job-url" className="sr-only">
									URL de la oferta
								</Label>
								<Input
									id="job-url"
									type="url"
									required
									placeholder="https://empresa.com/empleos/senior-engineer"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									disabled={busy}
								/>
								<Button type="submit" disabled={busy || !url.trim()}>
									{busy ? (
										<Loader2Icon className="animate-spin" />
									) : (
										<SparklesIcon />
									)}
									Investigar
								</Button>
							</form>
							<p className="mt-2 text-muted-foreground text-xs">
								Si el portal exige login o bloquea bots, te llevaremos a “Pegar
								texto”.
							</p>
						</TabsContent>
						<TabsContent value="text" className="grid gap-3 pt-3">
							<Label htmlFor="job-text">
								Descripción completa de la vacante
							</Label>
							<Textarea
								id="job-text"
								rows={10}
								placeholder="Pega aquí el texto de la oferta…"
								value={text}
								onChange={(e) => setText(e.target.value)}
								disabled={busy}
							/>
							<div className="flex flex-wrap gap-2">
								<Button
									onClick={() => run(() => extractJobText(text))}
									disabled={busy || text.trim().length < 80}
								>
									{busy ? (
										<Loader2Icon className="animate-spin" />
									) : (
										<SparklesIcon />
									)}
									Analizar vacante
								</Button>
								<Button
									variant="outline"
									onClick={() => setText(EXAMPLE_JOB_TEXT)}
									disabled={busy}
								>
									Cargar vacante de ejemplo
								</Button>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{busy ? (
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<Loader2Icon className="size-4 animate-spin" />
					{step === "extracting"
						? "Extrayendo la vacante…"
						: "Cruzando la vacante con tu CV maestro…"}
				</div>
			) : null}

			{job ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">{job.title}</CardTitle>
						<CardDescription>
							{[job.company, job.location, job.salaryRange]
								.filter(Boolean)
								.join(" · ")}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-5">
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">
								{WORK_TYPE_LABELS[job.workType] ?? job.workType}
							</Badge>
							{job.url ? (
								<a
									href={job.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground text-xs underline"
								>
									Ver oferta original
								</a>
							) : null}
						</div>
						{job.summary ? (
							<p className="text-muted-foreground text-sm">{job.summary}</p>
						) : null}
						{evaluation ? <EvaluationView evaluation={evaluation} /> : null}
					</CardContent>
					<CardFooter className="flex flex-wrap justify-end gap-2">
						{!evaluation && hasProfile && !busy ? (
							<Button variant="outline" onClick={() => run(async () => job)}>
								<SparklesIcon /> Evaluar fit
							</Button>
						) : null}
						<Button
							variant="outline"
							onClick={() => save(false)}
							disabled={saving || busy}
						>
							<SaveIcon /> Guardar en tablero
						</Button>
						<Button
							onClick={() => save(true)}
							disabled={saving || busy || !hasProfile}
						>
							{saving ? (
								<Loader2Icon className="animate-spin" />
							) : (
								<WandSparklesIcon />
							)}
							Guardar y adaptar CV ahora
						</Button>
					</CardFooter>
				</Card>
			) : null}
		</div>
	);
}
