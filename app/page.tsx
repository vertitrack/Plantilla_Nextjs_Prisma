import { DatabaseIcon, FileTextIcon, UsersIcon } from "lucide-react";
import { deletePost, deleteUser } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { ModeToggle } from "@/components/mode-toggle";
import { PostForm } from "@/components/post-form";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserForm } from "@/components/user-form";
import { getPosts, getUsers } from "@/lib/data";

const dateFormat = new Intl.DateTimeFormat("es-CL", {
	dateStyle: "medium",
	timeStyle: "short",
});

function formatDate(value: string | Date) {
	return dateFormat.format(new Date(value));
}

export default async function Home() {
	const [users, posts] = await Promise.all([getUsers(), getPosts()]);

	const authors = users.map((u) => ({
		id: u.id,
		label: u.name ? `${u.name} (${u.email})` : u.email,
	}));

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="grid gap-2">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<DatabaseIcon className="size-4" />
						Next.js 16 · Prisma 8 · PostgreSQL · shadcn/ui
					</div>
					<h1 className="font-heading font-semibold text-3xl tracking-tight">
						Plantilla Next.js + Prisma
					</h1>
					<p className="max-w-xl text-muted-foreground">
						Ejemplo conectado a la base de datos: crea usuarios y posts con
						Server Actions y consulta con el ORM tipado de Prisma Next.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="secondary">
						<UsersIcon />
						{users.length} usuarios
					</Badge>
					<Badge variant="secondary">
						<FileTextIcon />
						{posts.length} posts
					</Badge>
					<ModeToggle />
				</div>
			</header>

			<Separator />

			<div className="grid gap-6 lg:grid-cols-[360px_1fr]">
				<aside className="grid content-start gap-6">
					<UserForm />
					<PostForm authors={authors} />
				</aside>

				<main className="grid content-start gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Posts recientes</CardTitle>
							<CardDescription>
								Incluye el autor con <code>.include("author")</code>.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{posts.length === 0 ? (
								<Empty className="border">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<FileTextIcon />
										</EmptyMedia>
										<EmptyTitle>Sin posts todavía</EmptyTitle>
										<EmptyDescription>
											Publica el primero con el formulario.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<ul className="grid gap-3">
									{posts.map((post) => (
										<li key={post.id}>
											<Card size="sm" className="bg-muted/40">
												<CardHeader>
													<CardTitle>{post.title}</CardTitle>
													<CardDescription>
														{post.author?.name ?? post.author?.email ?? "—"} ·{" "}
														{formatDate(post.createdAt)}
													</CardDescription>
													<CardAction>
														<DeleteButton
															label={`Eliminar ${post.title}`}
															action={deletePost.bind(null, post.id)}
														/>
													</CardAction>
												</CardHeader>
												{post.content ? (
													<CardContent className="whitespace-pre-line text-sm">
														{post.content}
													</CardContent>
												) : null}
											</Card>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Usuarios</CardTitle>
							<CardDescription>
								Con el conteo de posts vía{" "}
								<code>.include("posts", (p) =&gt; p.count())</code>.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{users.length === 0 ? (
								<Empty className="border">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<UsersIcon />
										</EmptyMedia>
										<EmptyTitle>Sin usuarios</EmptyTitle>
										<EmptyDescription>
											Crea uno para empezar a publicar.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Nombre</TableHead>
											<TableHead>Email</TableHead>
											<TableHead className="text-right">Posts</TableHead>
											<TableHead className="hidden sm:table-cell">
												Creado
											</TableHead>
											<TableHead className="w-10" />
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.map((user) => (
											<TableRow key={user.id}>
												<TableCell className="font-medium">
													{user.name ?? "—"}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{user.email}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{user.posts}
												</TableCell>
												<TableCell className="hidden text-muted-foreground sm:table-cell">
													{formatDate(user.createdAt)}
												</TableCell>
												<TableCell>
													<DeleteButton
														label={`Eliminar ${user.email}`}
														confirmMessage={`¿Eliminar a ${user.email} y sus posts?`}
														action={deleteUser.bind(null, user.id)}
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</main>
			</div>
		</div>
	);
}
