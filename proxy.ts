import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Toda la app es privada: sin sesión válida, las páginas redirigen a /login y
// la API responde 401. Cada Server Action y Route Handler vuelve a comprobar la
// sesión (el proxy es la primera barrera, no la única).

const PUBLIC_PATHS = new Set(["/login"]);

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

	const token = request.cookies.get(SESSION_COOKIE)?.value;
	if (verifySessionToken(token)) return NextResponse.next();

	if (pathname.startsWith("/api/")) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 });
	}
	const url = new URL("/login", request.url);
	if (pathname !== "/") url.searchParams.set("next", pathname + search);
	return NextResponse.redirect(url);
}

export const config = {
	matcher: [
		// Todo excepto los assets estáticos de Next y archivos públicos.
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
	],
};
