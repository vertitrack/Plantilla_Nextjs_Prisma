import { NextResponse } from "next/server";
import { parseCv } from "@/lib/ai";
import { badRequest, readJson, serverError, withAuth } from "@/lib/http";

// Las llamadas a Gemini pueden tardar; Vercel corta en el límite indicado.
export const maxDuration = 300;

export const POST = withAuth(async (request: Request) => {
	try {
		const { rawText } = await readJson(request);
		if (typeof rawText !== "string" || rawText.trim().length < 50) {
			return badRequest(
				"El texto del currículum es demasiado corto para procesar.",
			);
		}
		return NextResponse.json({ profile: await parseCv(rawText) });
	} catch (error) {
		return serverError("Parse CV", error, "Error al procesar el CV con IA.");
	}
});
