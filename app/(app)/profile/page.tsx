"use client";

import { CheckIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { CvAnalysisView } from "@/components/cv-analysis";
import { CvUpload } from "@/components/cv-upload";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { profileToMarkdown } from "@/lib/markdown";

type SaveState = "idle" | "pending" | "saving" | "saved";

function SaveIndicator({ state }: { state: SaveState }) {
	if (state === "idle") return null;
	return (
		<span className="flex items-center gap-1.5 text-muted-foreground text-xs">
			{state === "saved" ? (
				<CheckIcon className="size-3.5" />
			) : (
				<Loader2Icon className="size-3.5 animate-spin" />
			)}
			{state === "saved" ? "Guardado" : "Guardando…"}
		</span>
	);
}

export default function ProfilePage() {
	const { profile, hasProfile, reload, isLoadingDb } = useApp();
	const [importOpen, setImportOpen] = useState(false);
	const [saveState, setSaveState] = useState<SaveState>("idle");
	// Al importar un CV, remontamos el editor para que tome los datos nuevos.
	const [editorKey, setEditorKey] = useState(0);

	return (
		<div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6">
			<PageHeader
				title="Mi CV maestro"
				description="Tu base de conocimiento: la IA la usa como única fuente de verdad."
				actions={
					<>
						<SaveIndicator state={saveState} />
						<CopyButton text={profileToMarkdown(profile)} label="Exportar MD" />
						<Dialog open={importOpen} onOpenChange={setImportOpen}>
							<DialogTrigger
								render={
									<Button>
										<SparklesIcon />
										Importar CV con IA
									</Button>
								}
							/>
							<DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
								<DialogHeader>
									<DialogTitle>Importar CV con IA</DialogTitle>
									<DialogDescription>
										Sube tu CV o pega el texto de tu CV o LinkedIn. Revisarás el
										resultado antes de reemplazar tu perfil.
									</DialogDescription>
								</DialogHeader>
								<CvUpload
									hasProfile={hasProfile}
									onSaved={async () => {
										await reload();
										setEditorKey((k) => k + 1);
										setImportOpen(false);
									}}
								/>
							</DialogContent>
						</Dialog>
					</>
				}
			/>

			{!hasProfile && !isLoadingDb ? (
				<div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
					Aún no tienes perfil. Usa <strong>Importar CV con IA</strong> para
					crearlo en segundos, o complétalo a mano en las pestañas de abajo.
				</div>
			) : null}

			{profile.cvAnalysis ? (
				<Collapsible className="rounded-lg border">
					<CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-4 text-left">
						<span className="font-medium text-sm">
							Análisis de tu CV ·{" "}
							<span className="tabular-nums">
								{profile.cvAnalysis.overallScore}/100
							</span>
						</span>
						<span className="text-muted-foreground text-xs">Ver detalle</span>
					</CollapsibleTrigger>
					<CollapsibleContent className="border-t p-4">
						<CvAnalysisView analysis={profile.cvAnalysis} />
					</CollapsibleContent>
				</Collapsible>
			) : null}

			<ProfileEditor key={editorKey} onSaveStateChange={setSaveState} />
		</div>
	);
}
