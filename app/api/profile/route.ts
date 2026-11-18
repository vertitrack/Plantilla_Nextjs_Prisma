import { NextResponse } from "next/server";
import { readJson, serverError, withAuth } from "@/lib/http";
import { getProfile, upsertProfile } from "@/lib/repository";

export const GET = withAuth(async () => {
	try {
		return NextResponse.json({ profile: await getProfile() });
	} catch (error) {
		return serverError("GET /api/profile", error, "Error al cargar el perfil");
	}
});

export const PUT = withAuth(async (request: Request) => {
	try {
		const profile = await upsertProfile(await readJson(request));
		return NextResponse.json({ profile });
	} catch (error) {
		return serverError("PUT /api/profile", error, "Error al actualizar perfil");
	}
});
