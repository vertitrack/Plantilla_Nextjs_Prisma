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
		// Evita que una petición quede colgada indefinidamente (60 s).
		httpOptions: { timeout: 60_000 },
	});
	return client;
}

function isUnavailable(err: unknown) {
	const e = err as { status?: number; message?: string } | undefined;
	const message = e?.message ?? "";
	return (
		e?.status === 503 ||
		e?.status === 504 ||
		message.includes("DEADLINE_EXCEEDED") ||
		message.includes("503") ||
		message.includes("UNAVAILABLE") ||
		message.includes("high demand") ||
		// Un modelo saturado a veces no responde: tratamos el timeout igual.
		/timed? ?out|aborted|AbortError/i.test(message)
	);
}

// Si el modelo principal está saturado, lo evitamos por un rato y usamos el de
// respaldo directamente (cada 503 tarda ~20 s en llegar).
const COOLDOWN_MS = 5 * 60 * 1000;
let primaryUnavailableUntil = 0;

/**
 * Llama a Gemini reintentando cuando el modelo responde 503 (sobrecarga). Si
 * sigue saturado, usa el modelo de respaldo.
 */
export async function generateContentWithRetry(
	params: Omit<GenerateContentParameters, "model"> & { model?: string },
	maxRetries = 0,
) {
	const ai = getClient();
	const fallback =
		GEMINI_FALLBACK_MODEL &&
		GEMINI_FALLBACK_MODEL !== (params.model ?? GEMINI_MODEL)
			? GEMINI_FALLBACK_MODEL
			: null;
	const useFallbackNow =
		!params.model && fallback && Date.now() < primaryUnavailableUntil;
	const model = useFallbackNow ? fallback : (params.model ?? GEMINI_MODEL);

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
			if (fallback && model !== fallback) {
				primaryUnavailableUntil = Date.now() + COOLDOWN_MS;
				console.warn(`Gemini 503 (${model}), usando ${fallback} por 5 min`);
				return ai.models.generateContent({ ...params, model: fallback });
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
