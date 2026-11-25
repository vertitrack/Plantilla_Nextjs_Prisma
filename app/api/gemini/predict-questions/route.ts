import { NextResponse } from "next/server";
import { predictInterviewQuestions } from "@/lib/ai";
import { badRequest, readJson, serverError, withAuth } from "@/lib/http";
import { type MasterProfile, STAGE_TYPES, type StageType } from "@/lib/types";

// Las llamadas a Gemini pueden tardar; Vercel corta en el límite indicado.
export const maxDuration = 300;

const strings = (v: unknown) =>
	Array.isArray(v)
		? v
				.filter((x): x is string => typeof x === "string")
				.map((x) => x.slice(0, 500))
		: [];

export const POST = withAuth(async (request: Request) => {
	try {
		const { jobTitle, company, jobText, profile, stage } =
			await readJson(request);
		if (
			typeof jobText !== "string" ||
			!profile ||
			typeof profile !== "object" ||
			!stage ||
			typeof stage !== "object"
		) {
			return badRequest("Faltan datos de la vacante, la etapa o el perfil.");
		}
		const s = stage as Record<string, unknown>;
		const type = (STAGE_TYPES as readonly string[]).includes(s.type as string)
			? (s.type as StageType)
			: "other";
		const result = await predictInterviewQuestions(
			profile as MasterProfile,
			{
				jobTitle: typeof jobTitle === "string" ? jobTitle : undefined,
				company: typeof company === "string" ? company : undefined,
				jobText,
			},
			{
				name: typeof s.name === "string" ? s.name.slice(0, 200) : "Entrevista",
				type,
				pastQuestions: strings(s.pastQuestions),
				existing: strings(s.existing),
			},
		);
		return NextResponse.json(result);
	} catch (error) {
		return serverError(
			"Predict questions",
			error,
			"Error al predecir las preguntas.",
		);
	}
});
