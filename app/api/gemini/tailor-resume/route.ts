import { NextResponse } from "next/server";
import { tailorResume } from "@/lib/ai";
import { badRequest, readJson, serverError, withAuth } from "@/lib/http";
import type { MasterProfile } from "@/lib/types";

export const POST = withAuth(async (request: Request) => {
	try {
		const { jobTitle, company, jobText, profile } = await readJson(request);
		if (
			typeof jobText !== "string" ||
			!profile ||
			typeof profile !== "object"
		) {
			return badRequest("Faltan datos de la vacante o perfil.");
		}
		const result = await tailorResume(profile as MasterProfile, {
			jobTitle: typeof jobTitle === "string" ? jobTitle : undefined,
			company: typeof company === "string" ? company : undefined,
			jobText,
		});
		return NextResponse.json(result);
	} catch (error) {
		return serverError(
			"Tailor resume",
			error,
			"Error al adaptar el CV y carta.",
		);
	}
});
