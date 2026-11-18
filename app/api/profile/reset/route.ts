import { NextResponse } from "next/server";
import { serverError } from "@/lib/http";
import { resetToSampleData } from "@/lib/repository";

export async function POST() {
	try {
		const { profile, applications } = await resetToSampleData();
		return NextResponse.json({
			profile,
			applications,
			message: "Datos restaurados con éxito",
		});
	} catch (error) {
		return serverError(
			"POST /api/profile/reset",
			error,
			"Error al reiniciar datos",
		);
	}
}
