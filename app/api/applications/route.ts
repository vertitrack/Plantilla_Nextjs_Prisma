import { NextResponse } from "next/server";
import { readJson, serverError } from "@/lib/http";
import { createApplication, listOrSeedApplications } from "@/lib/repository";

export async function GET() {
	try {
		return NextResponse.json({ applications: await listOrSeedApplications() });
	} catch (error) {
		return serverError(
			"GET /api/applications",
			error,
			"Error al cargar postulaciones",
		);
	}
}

export async function POST(request: Request) {
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
}
