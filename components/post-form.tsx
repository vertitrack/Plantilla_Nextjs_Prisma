"use client";

import { Loader2Icon, SendIcon } from "lucide-react";
import { useActionState } from "react";
import { createPost } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/components/use-action-toast";

type Author = { id: string; label: string };

export function PostForm({ authors }: { authors: Author[] }) {
	const [state, action, pending] = useActionState(createPost, null);
	useActionToast(state);

	const items = authors.map((a) => ({ value: a.id, label: a.label }));
	const disabled = authors.length === 0;

	return (
		<Card>
			<form action={action} className="contents">
				<CardHeader>
					<CardTitle>Nuevo post</CardTitle>
					<CardDescription>
						{disabled
							? "Crea un usuario primero para poder publicar."
							: "Relacionado con su autor vía authorId."}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="authorId">Autor</Label>
						<Select name="authorId" items={items} disabled={disabled} required>
							<SelectTrigger id="authorId" className="w-full">
								<SelectValue placeholder="Selecciona un autor" />
							</SelectTrigger>
							<SelectContent>
								{items.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="title">Título</Label>
						<Input
							id="title"
							name="title"
							placeholder="Hola Prisma 8"
							disabled={disabled}
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="content">Contenido</Label>
						<Textarea
							id="content"
							name="content"
							placeholder="Escribe algo…"
							rows={3}
							disabled={disabled}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						disabled={pending || disabled}
						className="w-full"
					>
						{pending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
						Publicar
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
