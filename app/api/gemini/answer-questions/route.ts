import { NextResponse } from "next/server";
import { answerQuestions } from "@/lib/ai";
import { badRequest, readJson, serverError, withAuth } from "@/lib/http";
import type { MasterProfile } from "@/lib/types";

// Las llamadas a Gemini pueden tardar; Vercel corta en el límite indicado.
export const maxDuration = 300;

export const POST = withAuth(async (request: Request) => {
	try {
		const { questions, jobTitle, company, jobText, profile } =
			await readJson(request);
		const list = Array.isArray(questions)
			? questions.filter(
					(q): q is string => typeof q === "string" && !!q.trim(),
				)
			: [];
		if (list.length === 0) {
			return badRequest("Proporciona al menos una pregunta de postulación.");
		}
		if (!profile || typeof profile !== "object") {
			return badRequest("Falta el perfil del usuario.");
		}
		const result = await answerQuestions(
			profile as MasterProfile,
			{
				jobTitle: typeof jobTitle === "string" ? jobTitle : undefined,
				company: typeof company === "string" ? company : undefined,
				jobText: typeof jobText === "string" ? jobText : undefined,
			},
			list,
		);
		return NextResponse.json(result);
	} catch (error) {
		return serverError(
			"Answer questions",
			error,
			"Error al generar respuestas para el formulario.",
		);
	}
});
