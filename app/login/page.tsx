import { BriefcaseIcon } from "lucide-react";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	authConfigError,
	isAuthenticated,
	MIN_PASSWORD_LENGTH,
} from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
	if (await isAuthenticated()) redirect("/");
	const { next } = await searchParams;
	const configError = authConfigError();

	return (
		<main className="flex flex-1 items-center justify-center px-4 py-16">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<BriefcaseIcon className="size-4" />
					</div>
					<CardTitle>JustWork</CardTitle>
					<CardDescription>
						Espacio privado. Ingresa tu contraseña para continuar.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{configError ? (
						<p className="text-destructive text-sm">
							{configError === "missing"
								? "Define APP_PASSWORD en el archivo .env y reinicia el servidor."
								: `APP_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`}
						</p>
					) : (
						<LoginForm next={typeof next === "string" ? next : undefined} />
					)}
				</CardContent>
			</Card>
		</main>
	);
}
