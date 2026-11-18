"use client";

import { Loader2Icon, SaveIcon, SparklesIcon, XIcon } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
	type AnalyzeCvState,
	analyzeCvAction,
	saveCvProfileAction,
} from "@/app/cv-actions";
import { CvAnalysisView } from "@/components/cv-analysis";
import { ProfileView } from "@/components/profile-view";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

/** Subir CV → análisis con IA → revisar → guardar como perfil maestro. */
export function CvUpload({
	hasProfile,
	onSaved,
}: {
	hasProfile: boolean;
	/** Se llama después de guardar el perfil (p. ej. para recargar el estado). */
	onSaved?: () => void;
}) {
	const [state, action, analyzing] = useActionState<AnalyzeCvState, FormData>(
		analyzeCvAction,
		null,
	);
	const [result, setResult] = useState<Extract<
		AnalyzeCvState,
		{ ok: true }
	> | null>(null);
	const [saving, startSaving] = useTransition();

	useEffect(() => {
		if (!state) return;
		if (state.ok) setResult(state);
		else toast.error(state.error);
	}, [state]);

	function save() {
		if (!result) return;
		startSaving(async () => {
			try {
				await saveCvProfileAction(result.profile, result.analysis);
				toast.success("Perfil guardado. Esta es ahora la base de la IA.");
				setResult(null);
				onSaved?.();
			} catch {
				toast.error("No se pudo guardar el perfil.");
			}
		});
	}

	if (result) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Resultado del análisis</CardTitle>
					<CardDescription>
						Revisa lo que la IA extrajo de tu CV antes de guardarlo
						{hasProfile ? " (reemplazará tu perfil actual)." : "."}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
					<CvAnalysisView analysis={result.analysis} />
					<div className="rounded-lg border p-4">
						<ProfileView profile={result.profile} />
					</div>
				</CardContent>
				<CardFooter className="flex flex-wrap justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => setResult(null)}
						disabled={saving}
					>
						<XIcon />
						Descartar
					</Button>
					<Button onClick={save} disabled={saving}>
						{saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
						Guardar como mi perfil
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card>
			<form action={action} className="contents">
				<CardHeader>
					<CardTitle>
						{hasProfile ? "Actualizar mi CV" : "Sube tu CV"}
					</CardTitle>
					<CardDescription>
						La IA extrae tu experiencia, proyectos y habilidades, y evalúa tu
						CV. Nada se guarda hasta que lo confirmes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="file">
						<TabsList>
							<TabsTrigger value="file">Archivo</TabsTrigger>
							<TabsTrigger value="text">Pegar texto</TabsTrigger>
						</TabsList>
						<TabsContent value="file" keepMounted className="grid gap-2 pt-2">
							<Label htmlFor="cv-file">PDF, .txt o .md (máx. 4 MB)</Label>
							<Input
								id="cv-file"
								name="file"
								type="file"
								accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
								disabled={analyzing}
							/>
						</TabsContent>
						<TabsContent value="text" keepMounted className="grid gap-2 pt-2">
							<Label htmlFor="cv-text">
								Texto de tu CV o perfil de LinkedIn
							</Label>
							<Textarea
								id="cv-text"
								name="text"
								rows={8}
								placeholder="Pega aquí tu CV…"
								disabled={analyzing}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						disabled={analyzing}
						className="w-full sm:w-auto"
					>
						{analyzing ? (
							<Loader2Icon className="animate-spin" />
						) : (
							<SparklesIcon />
						)}
						{analyzing ? "Analizando… (puede tardar ~30 s)" : "Analizar con IA"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
