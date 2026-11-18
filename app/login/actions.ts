"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	authConfigError,
	checkPassword,
	clearFailedLogins,
	createSessionToken,
	loginLockedFor,
	registerFailedLogin,
	SESSION_COOKIE,
} from "@/lib/auth";

export type LoginState = { error: string } | null;

/** Solo permite redirigir a rutas internas (evita open redirects). */
function safeNext(value: FormDataEntryValue | null) {
	return typeof value === "string" &&
		value.startsWith("/") &&
		!value.startsWith("//")
		? value
		: "/";
}

async function clientIp() {
	const h = await headers();
	return (
		h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		h.get("x-real-ip") ||
		"local"
	);
}

export async function login(
	_prev: LoginState,
	formData: FormData,
): Promise<LoginState> {
	if (authConfigError()) {
		return { error: "La contraseña no está configurada en el servidor." };
	}

	const ip = await clientIp();
	const locked = loginLockedFor(ip);
	if (locked > 0) {
		const minutes = Math.ceil(locked / 60000);
		return { error: `Demasiados intentos. Espera ${minutes} min.` };
	}

	const password = formData.get("password");
	if (typeof password !== "string" || !checkPassword(password)) {
		registerFailedLogin(ip);
		// Pequeña pausa para frenar ataques de fuerza bruta.
		await new Promise((r) => setTimeout(r, 600));
		return { error: "Contraseña incorrecta." };
	}

	clearFailedLogins(ip);
	const { token, expires } = createSessionToken();
	(await cookies()).set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires,
	});
	redirect(safeNext(formData.get("next")));
}

export async function logout() {
	(await cookies()).delete(SESSION_COOKIE);
	redirect("/login");
}
