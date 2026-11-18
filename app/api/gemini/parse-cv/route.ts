import { NextResponse } from "next/server";
import { parseCv } from "@/lib/ai";
import { badRequest, readJson, serverError } from "@/lib/http";

export async function POST(request: Request) {
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
}
