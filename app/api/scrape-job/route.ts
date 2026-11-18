import { NextResponse } from "next/server";
import { extractJobPosting } from "@/lib/ai";
import { errorMessage, readJson, withAuth } from "@/lib/http";
import { fetchJobText, parsePublicUrl, ScrapeError } from "@/lib/scraper";
import type { ScrapedJob } from "@/lib/types";

export const POST = withAuth(async (request: Request) => {
	try {
		const { url: rawUrl, text } = await readJson(request);
		// Modo "pegar texto": se omite la descarga y solo se extraen los datos.
		const pasted = typeof text === "string" ? text.trim() : "";
		if (!rawUrl && pasted.length < 80) {
			return NextResponse.json(
				{
					error: "Pega la descripción completa de la vacante.",
					canFallback: false,
				},
				{ status: 400 },
			);
		}
		const url = rawUrl ? parsePublicUrl(rawUrl) : null;
		const fullText = url ? await fetchJobText(url) : pasted.slice(0, 15000);

		let job: ScrapedJob;
		try {
			const parsed = await extractJobPosting(fullText);
			job = {
				url: url?.href ?? "",
				title: parsed.title || "Oferta de Empleo",
				company: parsed.company || "Empresa",
				location: parsed.location || "No especificada",
				workType: parsed.workType || "unknown",
				salaryRange: parsed.salaryRange || "No especificado",
				summary: parsed.summary || "",
				fullText,
			};
		} catch (error) {
			// Si la IA falla igual devolvemos el texto para que el usuario continúe.
			console.warn("extractJobPosting falló:", error);
			job = {
				url: url?.href ?? "",
				title: "Oferta de Empleo Detectada",
				company: "Empresa",
				location: "No especificada",
				workType: "unknown",
				salaryRange: "No especificado",
				summary: `${fullText.slice(0, 400)}...`,
				fullText,
			};
		}
		return NextResponse.json(job);
	} catch (error) {
		if (error instanceof ScrapeError) {
			return NextResponse.json(
				{ error: error.message, canFallback: error.canFallback },
				{ status: error.status },
			);
		}
		console.error("Scrape error:", error);
		return NextResponse.json(
			{
				error: errorMessage(
					error,
					"Error al procesar el enlace. Prueba con la pestaña de pegado manual.",
				),
				canFallback: true,
			},
			{ status: 500 },
		);
	}
});
