"use server";

import { revalidatePath } from "next/cache";
import { analyzeCv, type CvInput } from "@/lib/ai";
import { requireAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/http";
import { saveProfileFromCv } from "@/lib/repository";
import type { CvAnalysis, MasterProfile } from "@/lib/types";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const TEXT_TYPES = new Set(["text/plain", "text/markdown", ""]);

export type AnalyzeCvState =
	| { ok: true; profile: Partial<MasterProfile>; analysis: CvAnalysis }
	| { ok: false; error: string }
	| null;

async function readCvInput(formData: FormData): Promise<CvInput | string> {
	const file = formData.get("file");
	const text = formData.get("text");

	if (file instanceof File && file.size > 0) {
		if (file.size > MAX_FILE_BYTES) return "El archivo supera los 8 MB.";
		const isPdf =
			file.type === "application/pdf" ||
			file.name.toLowerCase().endsWith(".pdf");
		if (isPdf) {
			const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
			return { kind: "file", mimeType: "application/pdf", base64 };
		}
		if (TEXT_TYPES.has(file.type) || /\.(txt|md)$/i.test(file.name)) {
			return { kind: "text", text: await file.text() };
		}
		return "Formato no soportado. Sube un PDF, .txt o .md (o pega el texto).";
	}

	if (typeof text === "string" && text.trim().length >= 50) {
		return { kind: "text", text: text.trim() };
	}
	return "Sube tu CV o pega al menos unas líneas de texto.";
}

/** Lee el CV subido, extrae tu perfil y lo evalúa con IA (no guarda nada aún). */
export async function analyzeCvAction(
	_prev: AnalyzeCvState,
	formData: FormData,
): Promise<AnalyzeCvState> {
	await requireAuth();
	const input = await readCvInput(formData);
	if (typeof input === "string") return { ok: false, error: input };

	try {
		const { profile, analysis } = await analyzeCv(input);
		return { ok: true, profile, analysis };
	} catch (error) {
		console.error("analyzeCvAction error:", error);
		const message = errorMessage(error, "");
		return {
			ok: false,
			error:
				message.includes("503") || message.includes("UNAVAILABLE")
					? "Gemini está saturado en este momento. Intenta de nuevo en unos minutos."
					: "No se pudo analizar el CV. Revisa el archivo e intenta otra vez.",
		};
	}
}

/** Guarda el perfil extraído (reemplaza el actual) junto con su análisis. */
export async function saveCvProfileAction(
	profile: Partial<MasterProfile>,
	analysis: CvAnalysis | null,
) {
	await requireAuth();
	await saveProfileFromCv(profile as Record<string, unknown>, analysis);
	revalidatePath("/");
}
