"use client";

import { api } from "@/lib/app-context";
import type {
	JobApplication,
	JobEvaluation,
	MasterProfile,
	QAPair,
	ScrapedJob,
	TailoredResume,
} from "@/lib/types";

// Llamadas desde el navegador a las rutas de IA (todas requieren sesión).

const post = <T>(url: string, body: unknown) =>
	api<T>(url, { method: "POST", body: JSON.stringify(body) });

type JobRef = Pick<JobApplication, "title" | "company" | "sourceText">;

export const scrapeJobUrl = (url: string) =>
	post<ScrapedJob>("/api/scrape-job", { url });
export const extractJobText = (text: string) =>
	post<ScrapedJob>("/api/scrape-job", { text });

export const evaluateJob = (profile: MasterProfile, job: JobRef) =>
	post<JobEvaluation>("/api/gemini/evaluate-job", {
		profile,
		jobTitle: job.title,
		company: job.company,
		jobText: job.sourceText,
	});

export const tailorResume = (profile: MasterProfile, job: JobRef) =>
	post<TailoredResume>("/api/gemini/tailor-resume", {
		profile,
		jobTitle: job.title,
		company: job.company,
		jobText: job.sourceText,
	});

export const answerQuestions = (
	profile: MasterProfile,
	job: JobRef,
	questions: string[],
) =>
	post<{ answers: QAPair[] }>("/api/gemini/answer-questions", {
		profile,
		questions,
		jobTitle: job.title,
		company: job.company,
		jobText: job.sourceText,
	});

/** Mensaje amigable para errores de IA (sobrecarga, red, etc.). */
export function aiErrorMessage(error: unknown) {
	const message = error instanceof Error ? error.message : "";
	if (/503|504|UNAVAILABLE|DEADLINE|high demand/i.test(message)) {
		return "Gemini está saturado en este momento. Intenta de nuevo en unos minutos.";
	}
	return message || "Ocurrió un error con la IA.";
}
