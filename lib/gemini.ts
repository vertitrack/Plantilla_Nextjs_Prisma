import "server-only";
import { type GenerateContentParameters, GoogleGenAI } from "@google/genai";

/** Modelo por defecto. Se puede cambiar con la variable GEMINI_MODEL. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

let client: GoogleGenAI | undefined;

function getClient() {
	if (!process.env.GEMINI_API_KEY) {
		throw new Error(
			"GEMINI_API_KEY no está definida. Agrégala a tu archivo .env.",
		);
	}
	client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
	return client;
}

function isUnavailable(err: unknown) {
	const e = err as { status?: number; message?: string } | undefined;
	const message = e?.message ?? "";
	return (
		e?.status === 503 ||
		message.includes("503") ||
		message.includes("UNAVAILABLE") ||
		message.includes("high demand")
	);
}

/** Llama a Gemini reintentando cuando el modelo responde 503 (sobrecarga). */
export async function generateContentWithRetry(
	params: Omit<GenerateContentParameters, "model"> & { model?: string },
	maxRetries = 2,
) {
	const ai = getClient();
	for (let attempt = 0; ; attempt++) {
		try {
			return await ai.models.generateContent({
				model: GEMINI_MODEL,
				...params,
			});
		} catch (err) {
			if (isUnavailable(err) && attempt < maxRetries) {
				console.warn(`Gemini 503, reintento ${attempt + 1}...`);
				await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
				continue;
			}
			throw err;
		}
	}
}

/** Genera una respuesta JSON validada por `responseSchema` y la parsea. */
export async function generateJson<T>(
	contents: string,
	responseSchema: NonNullable<
		GenerateContentParameters["config"]
	>["responseSchema"],
): Promise<T> {
	const response = await generateContentWithRetry({
		contents,
		config: { responseMimeType: "application/json", responseSchema },
	});
	return JSON.parse(response.text || "{}") as T;
}
