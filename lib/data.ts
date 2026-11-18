import { connection } from "next/server";
import { db } from "@/src/prisma/db";

export async function getUsers() {
	await connection();
	return db.orm.public.User.include("posts", (posts) => posts.count())
		.orderBy((u) => u.createdAt.desc())
		.all();
}

export async function getPosts() {
	await connection();
	return db.orm.public.Post.include("author", (author) =>
		author.select("id", "name", "email"),
	)
		.orderBy((p) => p.createdAt.desc())
		.limit(50)
		.all();
}

export type UserWithCount = Awaited<ReturnType<typeof getUsers>>[number];
export type PostWithAuthor = Awaited<ReturnType<typeof getPosts>>[number];
