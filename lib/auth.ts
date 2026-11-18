import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Autenticación de un solo usuario: la contraseña vive en APP_PASSWORD (.env).
// Al iniciar sesión se entrega una cookie httpOnly firmada con HMAC; cambiar la
// contraseña (o AUTH_SECRET) invalida todas las sesiones existentes.

export const SESSION_COOKIE = "jw_session";
const SESSION_DAYS = 30;
export const MIN_PASSWORD_LENGTH = 12;

export type AuthConfigError = "missing" | "too-short";

/** Indica por qué la autenticación no está configurada (o null si está OK). */
export function authConfigError(): AuthConfigError | null {
	const password = process.env.APP_PASSWORD;
	if (!password) return "missing";
	if (password.length < MIN_PASSWORD_LENGTH) return "too-short";
	return null;
}

function signingKey() {
	return createHash("sha256")
		.update(
			`jw-session:${process.env.AUTH_SECRET ?? ""}:${process.env.APP_PASSWORD}`,
		)
		.digest();
}

function sign(value: string) {
	return createHmac("sha256", signingKey()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
	// Comparamos digests de igual largo para no filtrar información por timing.
	const ha = createHash("sha256").update(a).digest();
	const hb = createHash("sha256").update(b).digest();
	return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
	if (authConfigError()) return false;
	return safeEqual(input, process.env.APP_PASSWORD as string);
}

export function createSessionToken(now = Date.now()) {
	const expires = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
	const payload = String(expires);
	return { token: `${payload}.${sign(payload)}`, expires: new Date(expires) };
}

export function verifySessionToken(
	token: string | undefined,
	now = Date.now(),
) {
	if (!token || authConfigError()) return false;
	const [payload, signature] = token.split(".");
	if (!payload || !signature) return false;
	if (!safeEqual(signature, sign(payload))) return false;
	return Number(payload) > now;
}

/** Comprueba la sesión desde un Server Component, Server Action o Route Handler. */
export async function isAuthenticated() {
	const store = await cookies();
	return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Lanza si no hay sesión. Úsalo al inicio de cada Server Action. */
export async function requireAuth() {
	if (!(await isAuthenticated())) {
		throw new Error("No autorizado");
	}
}

// ---------- Límite de intentos (en memoria, por IP) ----------

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; lockedUntil: number }>();

export function loginLockedFor(ip: string, now = Date.now()) {
	const entry = attempts.get(ip);
	return entry && entry.lockedUntil > now ? entry.lockedUntil - now : 0;
}

export function registerFailedLogin(ip: string, now = Date.now()) {
	const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
	entry.count += 1;
	if (entry.count >= MAX_ATTEMPTS) {
		entry.count = 0;
		entry.lockedUntil = now + LOCK_MS;
	}
	attempts.set(ip, entry);
}

export function clearFailedLogins(ip: string) {
	attempts.delete(ip);
}
