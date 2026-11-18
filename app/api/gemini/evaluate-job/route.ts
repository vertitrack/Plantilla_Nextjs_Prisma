import { NextResponse } from "next/server";
import { evaluateJob } from "@/lib/ai";
import { badRequest, readJson, serverError, withAuth } from "@/lib/http";
import type { MasterProfile } from "@/lib/types";

// Las llamadas a Gemini pueden tardar; Vercel corta en el límite indicado.
export const maxDuration = 300;

export const POST = withAuth(async (request: Request) => {
	try {
		const { jobTitle, company, jobText, profile } = await readJson(request);
		if (
			typeof jobText !== "string" ||
			!profile ||
			typeof profile !== "object"
		) {
			return badRequest("Faltan datos de la vacante o el perfil del usuario.");
		}
		const result = await evaluateJob(profile as MasterProfile, {
			jobTitle: typeof jobTitle === "string" ? jobTitle : undefined,
			company: typeof company === "string" ? company : undefined,
			jobText,
		});
		return NextResponse.json(result);
	} catch (error) {
		return serverError("Evaluate job", error, "Error al evaluar la vacante.");
	}
});
