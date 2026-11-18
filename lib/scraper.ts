import "server-only";

const BROWSER_UA =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** Error con mensaje para el usuario; `canFallback` sugiere pegar el texto a mano. */
export class ScrapeError extends Error {
	constructor(
		message: string,
		readonly status = 422,
		readonly canFallback = true,
	) {
		super(message);
	}
}

export function cleanHtml(html: string): string {
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
		.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
		.replace(/<(br|p|div|h[1-6]|li|tr)[^>]*>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/[ \t]+/g, " ")
		.replace(/\n\s*\n/g, "\n\n")
		.trim();
}

const PRIVATE_HOST =
	/^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i;

/**
 * Valida que la URL sea pública (http/https y no apunte a la red interna),
 * para que el servidor no pueda usarse como proxy hacia servicios privados.
 */
export function parsePublicUrl(raw: unknown): URL {
	if (typeof raw !== "string") {
		throw new ScrapeError(
			"Proporciona una URL válida (ej. https://...)",
			400,
			false,
		);
	}
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new ScrapeError(
			"Proporciona una URL válida (ej. https://...)",
			400,
			false,
		);
	}
	const host = url.hostname;
	if (
		!["http:", "https:"].includes(url.protocol) ||
		PRIVATE_HOST.test(host) ||
		host.endsWith(".local") ||
		host.endsWith(".internal")
	) {
		throw new ScrapeError(
			"Solo se permiten URLs públicas http(s).",
			400,
			false,
		);
	}
	return url;
}

async function fetchViaJina(url: URL): Promise<string | null> {
	try {
		const res = await fetch(`https://r.jina.ai/${url.href}`, {
			headers: { Accept: "text/plain", "User-Agent": BROWSER_UA },
			signal: AbortSignal.timeout(12000),
		});
		if (!res.ok) return null;
		const text = await res.text();
		const blocked = text.includes("Captcha") || text.includes("Access Denied");
		return text.length > 200 && !blocked ? text : null;
	} catch {
		return null;
	}
}

async function fetchDirect(url: URL): Promise<string> {
	const res = await fetch(url, {
		headers: {
			"User-Agent": BROWSER_UA,
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
		},
		// No seguimos redirecciones a ciegas: podrían apuntar a la red interna.
		redirect: "manual",
		signal: AbortSignal.timeout(10000),
	});
	if (!res.ok) {
		throw new ScrapeError(
			`No se pudo acceder a la página (${res.status} ${res.statusText}). Utiliza la pestaña 'Pegar Texto' para ingresar la descripción manualmente.`,
		);
	}
	return cleanHtml(await res.text());
}

/** Obtiene el texto de una vacante: primero Jina Reader, luego fetch directo. */
export async function fetchJobText(url: URL): Promise<string> {
	let text = (await fetchViaJina(url)) ?? "";
	if (text.length < 200) {
		text = await fetchDirect(url);
	}
	if (text.length < 80) {
		throw new ScrapeError(
			"El contenido extraído es muy corto o el sitio requiere inicio de sesión. Por favor pega el texto de la vacante directamente.",
		);
	}
	return text.slice(0, 15000);
}
