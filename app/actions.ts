"use server";

import type { Char } from "@prisma/orm-postgres/target/codec-types";
import { revalidatePath } from "next/cache";
import { db } from "@/src/prisma/db";

// Nota: esta plantilla no incluye autenticación. Las Server Actions se pueden
// invocar con un POST directo, así que agrega verificación de sesión antes de
// usarla en producción.

export type ActionState = { ok: boolean; message: string } | null;

function text(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida que el valor sea un UUID y lo tipa como el `Char<36>` del contrato. */
function toId(value: string): Char<36> | null {
	return UUID_RE.test(value) ? (value as Char<36>) : null;
}

export async function createUser(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const email = text(formData, "email").toLowerCase();
	const name = text(formData, "name") || null;

	if (!EMAIL_RE.test(email)) {
		return { ok: false, message: "Ingresa un email válido." };
	}

	const existing = await db.orm.public.User.where({ email }).first();
	if (existing) {
		return { ok: false, message: "Ya existe un usuario con ese email." };
	}

	await db.orm.public.User.create({ email, name });
	revalidatePath("/");
	return { ok: true, message: `Usuario ${name ?? email} creado.` };
}

export async function createPost(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const title = text(formData, "title");
	const content = text(formData, "content") || null;
	const authorId = toId(text(formData, "authorId"));

	if (!title) {
		return { ok: false, message: "El título es obligatorio." };
	}
	if (!authorId) {
		return { ok: false, message: "Selecciona un autor." };
	}

	const author = await db.orm.public.User.where({ id: authorId }).first();
	if (!author) {
		return { ok: false, message: "El autor seleccionado no existe." };
	}

	await db.orm.public.Post.create({ title, content, authorId });
	revalidatePath("/");
	return { ok: true, message: "Post publicado." };
}

export async function deletePost(rawId: string) {
	const id = toId(rawId);
	if (!id) return;
	await db.orm.public.Post.where({ id }).delete();
	revalidatePath("/");
}

export async function deleteUser(rawId: string) {
	const id = toId(rawId);
	if (!id) return;
	// No hay FK con cascada en el contrato, así que borramos sus posts primero.
	await db.transaction(async (tx) => {
		await tx.orm.public.Post.where({ authorId: id }).delete();
		await tx.orm.public.User.where({ id }).delete();
	});
	revalidatePath("/");
}
