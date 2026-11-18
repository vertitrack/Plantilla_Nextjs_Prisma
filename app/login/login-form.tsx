"use client";

import { Loader2Icon, LockIcon } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export function LoginForm({ next }: { next?: string }) {
	const [state, action, pending] = useActionState(login, null);

	return (
		<form action={action} className="grid gap-4">
			<input type="hidden" name="next" value={next ?? "/"} />
			<div className="grid gap-2">
				<Label htmlFor="password">Contraseña</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					autoFocus
					required
					aria-invalid={state?.error ? true : undefined}
				/>
				{state?.error ? (
					<p className="text-destructive text-sm" role="alert">
						{state.error}
					</p>
				) : null}
			</div>
			<Button type="submit" disabled={pending} className="w-full">
				{pending ? <Loader2Icon className="animate-spin" /> : <LockIcon />}
				Entrar
			</Button>
		</form>
	);
}
