import "server-only";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

/** Lee el cuerpo JSON como objeto; devuelve {} si no es un objeto válido. */
export async function readJson(
	request: Request,
): Promise<Record<string, unknown>> {
	try {
		const body = await request.json();
		return body && typeof body === "object" && !Array.isArray(body) ? body : {};
	} catch {
		return {};
	}
}

export function errorMessage(error: unknown, fallback: string) {
	return error instanceof Error && error.message ? error.message : fallback;
}

/** Registra el error y responde 500 con un mensaje para el usuario. */
export function serverError(context: string, error: unknown, fallback: string) {
	console.error(`${context} error:`, error);
	return NextResponse.json(
		{ error: errorMessage(error, fallback) },
		{ status: 500 },
	);
}

export function badRequest(error: string) {
	return NextResponse.json({ error }, { status: 400 });
}

/**
 * Envuelve un Route Handler para exigir sesión. El proxy ya bloquea la API sin
 * sesión, pero lo comprobamos de nuevo aquí como defensa en profundidad.
 */
export function withAuth<A extends unknown[]>(
	handler: (...args: A) => Promise<Response>,
) {
	return async (...args: A): Promise<Response> => {
		if (!(await isAuthenticated())) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}
		return handler(...args);
	};
}
