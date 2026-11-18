import { NextResponse } from "next/server";
import { readJson, serverError } from "@/lib/http";
import { getOrSeedProfile, upsertProfile } from "@/lib/repository";

export async function GET() {
	try {
		return NextResponse.json({ profile: await getOrSeedProfile() });
	} catch (error) {
		return serverError("GET /api/profile", error, "Error al cargar el perfil");
	}
}

export async function PUT(request: Request) {
	try {
		const profile = await upsertProfile(await readJson(request));
		return NextResponse.json({ profile });
	} catch (error) {
		return serverError("PUT /api/profile", error, "Error al actualizar perfil");
	}
}
