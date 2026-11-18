import "server-only";
import { type GenerateContentParameters, GoogleGenAI } from "@google/genai";

/** Modelo por defecto. Se puede cambiar con la variable GEMINI_MODEL. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
/** Modelo de respaldo si el principal está saturado (GEMINI_FALLBACK_MODEL; vacío lo desactiva). */
export const GEMINI_FALLBACK_MODEL =
	process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash";

let client: GoogleGenAI | undefined;

function getClient() {
	if (!process.env.GEMINI_API_KEY) {
		throw new Error(
			"GEMINI_API_KEY no está definida. Agrégala a tu archivo .env.",
		);
	}
	client ??= new GoogleGenAI({
		apiKey: process.env.GEMINI_API_KEY,
		// Evita que una petición quede colgada indefinidamente (2 min).
		httpOptions: { timeout: 120_000 },
	});
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

/**
 * Llama a Gemini reintentando cuando el modelo responde 503 (sobrecarga). Si
 * sigue saturado, prueba una vez con el modelo de respaldo.
 */
export async function generateContentWithRetry(
	params: Omit<GenerateContentParameters, "model"> & { model?: string },
	maxRetries = 1,
) {
	const ai = getClient();
	const model = params.model ?? GEMINI_MODEL;
	for (let attempt = 0; ; attempt++) {
		try {
			return await ai.models.generateContent({ ...params, model });
		} catch (err) {
			if (!isUnavailable(err)) throw err;
			if (attempt < maxRetries) {
				console.warn(`Gemini 503 (${model}), reintento ${attempt + 1}...`);
				await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
				continue;
			}
			if (GEMINI_FALLBACK_MODEL && GEMINI_FALLBACK_MODEL !== model) {
				console.warn(`Gemini 503 (${model}), usando ${GEMINI_FALLBACK_MODEL}`);
				return ai.models.generateContent({
					...params,
					model: GEMINI_FALLBACK_MODEL,
				});
			}
			throw err;
		}
	}
}

/** Genera una respuesta JSON validada por `responseSchema` y la parsea. */
export async function generateJson<T>(
	contents: GenerateContentParameters["contents"],
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
