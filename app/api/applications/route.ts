import { NextResponse } from "next/server";
import { readJson, serverError, withAuth } from "@/lib/http";
import { createApplication, listApplications } from "@/lib/repository";

export const GET = withAuth(async () => {
	try {
		return NextResponse.json({ applications: await listApplications() });
	} catch (error) {
		return serverError(
			"GET /api/applications",
			error,
			"Error al cargar postulaciones",
		);
	}
});

export const POST = withAuth(async (request: Request) => {
	try {
		const application = await createApplication(await readJson(request));
		return NextResponse.json({ application });
	} catch (error) {
		return serverError(
			"POST /api/applications",
			error,
			"Error al guardar postulación",
		);
	}
});
