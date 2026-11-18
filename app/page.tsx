import {
	BriefcaseIcon,
	DatabaseIcon,
	SparklesIcon,
	UserIcon,
} from "lucide-react";
import { connection } from "next/server";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getOrSeedProfile, listOrSeedApplications } from "@/lib/repository";
import { JOB_STATUSES } from "@/lib/types";

// Página provisional: muestra que el backend de JustWork funciona mientras se
// construye la nueva interfaz con shadcn/ui.

const ENDPOINTS = [
	["GET / PUT", "/api/profile", "Perfil maestro (se siembra si está vacío)"],
	["POST", "/api/profile/reset", "Restaura los datos de demostración"],
	["GET / POST", "/api/applications", "Lista o crea postulaciones"],
	[
		"PATCH / DELETE",
		"/api/applications/[id]",
		"Edita o elimina una postulación",
	],
	["POST", "/api/scrape-job", "Extrae una vacante desde una URL"],
	["POST", "/api/gemini/evaluate-job", "Evalúa la afinidad con la vacante"],
	["POST", "/api/gemini/tailor-resume", "Adapta CV y carta de presentación"],
	["POST", "/api/gemini/answer-questions", "Responde preguntas de screening"],
	["POST", "/api/gemini/parse-cv", "Convierte un CV en perfil estructurado"],
] as const;

export default async function Home() {
	await connection();
	const [profile, applications] = await Promise.all([
		getOrSeedProfile(),
		listOrSeedApplications(),
	]);
	const byStatus = JOB_STATUSES.map((status) => ({
		status,
		count: applications.filter((a) => a.status === status).length,
	}));
	const geminiReady = Boolean(process.env.GEMINI_API_KEY);

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="grid gap-2">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<DatabaseIcon className="size-4" />
						Backend de JustWork · Prisma 8 · Gemini
					</div>
					<h1 className="font-heading font-semibold text-3xl tracking-tight">
						JustWork
					</h1>
					<p className="max-w-xl text-muted-foreground">
						La lógica y la API ya están conectadas a PostgreSQL. La interfaz se
						construirá encima de estas rutas.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={geminiReady ? "secondary" : "destructive"}>
						<SparklesIcon />
						{geminiReady ? "Gemini configurado" : "Falta GEMINI_API_KEY"}
					</Badge>
					<ModeToggle />
				</div>
			</header>

			<Separator />

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="size-4" />
							Perfil maestro
						</CardTitle>
						<CardDescription>{profile.headline}</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-1 text-sm">
						<p className="font-medium">{profile.fullName}</p>
						<p className="text-muted-foreground">{profile.location}</p>
						<p className="text-muted-foreground">
							{profile.experiences.length} experiencias ·{" "}
							{profile.projects.length} proyectos ·{" "}
							{profile.skills.reduce((n, s) => n + s.items.length, 0)}{" "}
							habilidades
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BriefcaseIcon className="size-4" />
							Postulaciones
						</CardTitle>
						<CardDescription>
							{applications.length} en total por estado
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{byStatus.map(({ status, count }) => (
							<Badge key={status} variant={count ? "default" : "outline"}>
								{status} · {count}
							</Badge>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Rutas API</CardTitle>
					<CardDescription>
						Portadas desde JustWork; la lógica vive en <code>lib/</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Método</TableHead>
								<TableHead>Ruta</TableHead>
								<TableHead className="hidden sm:table-cell">
									Descripción
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{ENDPOINTS.map(([method, path, description]) => (
								<TableRow key={path}>
									<TableCell className="text-muted-foreground text-xs">
										{method}
									</TableCell>
									<TableCell className="font-mono text-xs">{path}</TableCell>
									<TableCell className="hidden text-muted-foreground sm:table-cell">
										{description}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
