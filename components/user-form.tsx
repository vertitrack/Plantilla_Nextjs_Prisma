"use client";

import { Loader2Icon, UserPlusIcon } from "lucide-react";
import { useActionState } from "react";
import { createUser } from "@/app/actions";
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
import { useActionToast } from "@/components/use-action-toast";

export function UserForm() {
	const [state, action, pending] = useActionState(createUser, null);
	useActionToast(state);

	return (
		<Card>
			<form action={action} className="contents">
				<CardHeader>
					<CardTitle>Nuevo usuario</CardTitle>
					<CardDescription>Se guarda en la tabla User.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="ada@ejemplo.com"
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="name">Nombre</Label>
						<Input id="name" name="name" placeholder="Ada Lovelace" />
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" disabled={pending} className="w-full">
						{pending ? (
							<Loader2Icon className="animate-spin" />
						) : (
							<UserPlusIcon />
						)}
						Crear usuario
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
