"use client";

import {
	BriefcaseIcon,
	FolderGitIcon,
	GraduationCapIcon,
	PlusIcon,
	Trash2Icon,
	UserIcon,
	WrenchIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-context";
import type { MasterProfile } from "@/lib/types";
import { Field, ListField, TextField } from "./fields";

type SaveState = "idle" | "pending" | "saving" | "saved";

const newId = (prefix: string) =>
	`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function RemoveButton({
	onClick,
	label,
}: {
	onClick: () => void;
	label: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={label}
			onClick={onClick}
		>
			<Trash2Icon />
		</Button>
	);
}

/** Editor del CV maestro en 5 pestañas, con autoguardado. */
export function ProfileEditor({
	onSaveStateChange,
}: {
	onSaveStateChange?: (state: SaveState) => void;
}) {
	const { profile, updateProfile } = useApp();
	const [draft, setDraft] = useState<MasterProfile>(profile);
	const dirty = useRef(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	// Mientras no estés editando, el borrador sigue al perfil (carga, importación).
	useEffect(() => {
		if (!dirty.current) setDraft(profile);
	}, [profile]);

	useEffect(() => () => clearTimeout(timer.current), []);

	function change(patch: Partial<MasterProfile>) {
		dirty.current = true;
		onSaveStateChange?.("pending");
		setDraft((prev) => {
			const next = { ...prev, ...patch };
			clearTimeout(timer.current);
			timer.current = setTimeout(async () => {
				onSaveStateChange?.("saving");
				await updateProfile(next, { silent: true });
				dirty.current = false;
				onSaveStateChange?.("saved");
			}, 900);
			return next;
		});
	}

	const set =
		<K extends keyof MasterProfile>(key: K) =>
		(value: MasterProfile[K]) =>
			change({ [key]: value } as Partial<MasterProfile>);

	function updateItem<
		K extends "experiences" | "projects" | "skills" | "education",
	>(key: K, index: number, patch: Partial<MasterProfile[K][number]>) {
		const list = [...draft[key]] as MasterProfile[K][number][];
		list[index] = { ...list[index], ...patch };
		change({ [key]: list } as Partial<MasterProfile>);
	}
	function removeItem(
		key: "experiences" | "projects" | "skills" | "education",
		index: number,
	) {
		change({
			[key]: draft[key].filter((_, i) => i !== index),
		} as Partial<MasterProfile>);
	}

	return (
		<Tabs defaultValue="info">
			<TabsList className="flex h-auto w-full flex-wrap justify-start">
				<TabsTrigger value="info">
					<UserIcon /> Información
				</TabsTrigger>
				<TabsTrigger value="experience">
					<BriefcaseIcon /> Experiencia
				</TabsTrigger>
				<TabsTrigger value="skills">
					<WrenchIcon /> Habilidades
				</TabsTrigger>
				<TabsTrigger value="projects">
					<FolderGitIcon /> Proyectos
				</TabsTrigger>
				<TabsTrigger value="education">
					<GraduationCapIcon /> Educación
				</TabsTrigger>
			</TabsList>

			{/* 1. Información & Resumen */}
			<TabsContent value="info" className="pt-2">
				<Card>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						<TextField
							id="fullName"
							label="Nombre completo"
							value={draft.fullName}
							onChange={set("fullName")}
						/>
						<TextField
							id="headline"
							label="Titular"
							value={draft.headline}
							onChange={set("headline")}
							placeholder="Senior Full Stack Engineer | React, Node.js"
						/>
						<TextField
							id="email"
							type="email"
							label="Email"
							value={draft.email}
							onChange={set("email")}
						/>
						<TextField
							id="phone"
							label="Teléfono"
							value={draft.phone}
							onChange={set("phone")}
						/>
						<TextField
							id="location"
							label="Ubicación"
							value={draft.location}
							onChange={set("location")}
							placeholder="Santiago, Chile (remoto)"
						/>
						<TextField
							id="targetSalary"
							label="Banda salarial objetivo"
							value={draft.targetSalary}
							onChange={set("targetSalary")}
							placeholder="USD 4.000 – 6.000 / mes"
						/>
						<TextField
							id="linkedinUrl"
							type="url"
							label="LinkedIn"
							value={draft.linkedinUrl}
							onChange={set("linkedinUrl")}
							placeholder="https://linkedin.com/in/…"
						/>
						<TextField
							id="githubUrl"
							type="url"
							label="GitHub"
							value={draft.githubUrl}
							onChange={set("githubUrl")}
							placeholder="https://github.com/…"
						/>
						<TextField
							id="portfolioUrl"
							type="url"
							label="Portafolio"
							value={draft.portfolioUrl}
							onChange={set("portfolioUrl")}
							className="sm:col-span-2"
						/>
						<ListField
							id="targetRoles"
							label="Roles objetivo"
							value={draft.targetRoles}
							onChange={set("targetRoles")}
							hint="Separados por comas"
							placeholder="Full Stack Engineer, Frontend Lead"
							className="sm:col-span-2"
						/>
						<Field
							label="Resumen maestro"
							htmlFor="summary"
							className="sm:col-span-2"
						>
							<Textarea
								id="summary"
								rows={6}
								value={draft.summary}
								onChange={(e) => set("summary")(e.target.value)}
							/>
						</Field>
					</CardContent>
				</Card>
			</TabsContent>

			{/* 2. Experiencia laboral */}
			<TabsContent value="experience" className="grid gap-4 pt-2">
				{draft.experiences.map((exp, i) => (
					<Card key={exp.id}>
						<CardHeader>
							<CardTitle>
								{exp.role || "Nuevo cargo"}
								{exp.company ? ` · ${exp.company}` : ""}
							</CardTitle>
							<CardAction>
								<RemoveButton
									label="Eliminar experiencia"
									onClick={() => removeItem("experiences", i)}
								/>
							</CardAction>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-3">
							<TextField
								id={`${exp.id}-company`}
								label="Empresa"
								value={exp.company}
								onChange={(v) => updateItem("experiences", i, { company: v })}
							/>
							<TextField
								id={`${exp.id}-role`}
								label="Cargo"
								value={exp.role}
								onChange={(v) => updateItem("experiences", i, { role: v })}
							/>
							<TextField
								id={`${exp.id}-period`}
								label="Periodo"
								value={exp.period}
								onChange={(v) => updateItem("experiences", i, { period: v })}
								placeholder="2022 – Presente"
							/>
							<ListField
								id={`${exp.id}-highlights`}
								mode="lines"
								label="Logros medibles"
								hint="Uno por línea"
								value={exp.highlights}
								onChange={(v) =>
									updateItem("experiences", i, { highlights: v })
								}
								className="sm:col-span-3"
							/>
							<ListField
								id={`${exp.id}-skills`}
								label="Tecnologías usadas"
								hint="Separadas por comas"
								value={exp.skillsUsed}
								onChange={(v) =>
									updateItem("experiences", i, { skillsUsed: v })
								}
								className="sm:col-span-3"
							/>
						</CardContent>
					</Card>
				))}
				<Button
					type="button"
					variant="outline"
					onClick={() =>
						change({
							experiences: [
								...draft.experiences,
								{
									id: newId("exp"),
									company: "",
									role: "",
									period: "",
									highlights: [],
									skillsUsed: [],
								},
							],
						})
					}
				>
					<PlusIcon /> Agregar experiencia
				</Button>
			</TabsContent>

			{/* 3. Habilidades técnicas */}
			<TabsContent value="skills" className="grid gap-4 pt-2">
				<Card>
					<CardContent className="grid gap-4">
						{draft.skills.map((group, i) => (
							<div
								key={`skill-${i}`}
								className="grid items-end gap-3 sm:grid-cols-[200px_1fr_auto]"
							>
								<TextField
									id={`skill-${i}-cat`}
									label="Categoría"
									value={group.category}
									onChange={(v) => updateItem("skills", i, { category: v })}
									placeholder="Frontend"
								/>
								<ListField
									id={`skill-${i}-items`}
									label="Tecnologías"
									value={group.items}
									onChange={(v) => updateItem("skills", i, { items: v })}
									placeholder="React, TypeScript, Tailwind"
								/>
								<RemoveButton
									label="Eliminar categoría"
									onClick={() => removeItem("skills", i)}
								/>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								change({
									skills: [...draft.skills, { category: "", items: [] }],
								})
							}
						>
							<PlusIcon /> Agregar categoría
						</Button>
					</CardContent>
				</Card>
			</TabsContent>

			{/* 4. Proyectos destacados */}
			<TabsContent value="projects" className="grid gap-4 pt-2">
				{draft.projects.map((p, i) => (
					<Card key={p.id}>
						<CardHeader>
							<CardTitle>{p.name || "Nuevo proyecto"}</CardTitle>
							<CardAction>
								<RemoveButton
									label="Eliminar proyecto"
									onClick={() => removeItem("projects", i)}
								/>
							</CardAction>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<TextField
								id={`${p.id}-name`}
								label="Nombre"
								value={p.name}
								onChange={(v) => updateItem("projects", i, { name: v })}
							/>
							<TextField
								id={`${p.id}-link`}
								type="url"
								label="Enlace"
								value={p.link}
								onChange={(v) =>
									updateItem("projects", i, { link: v || undefined })
								}
							/>
							<Field
								label="Descripción"
								htmlFor={`${p.id}-desc`}
								className="sm:col-span-2"
							>
								<Textarea
									id={`${p.id}-desc`}
									rows={3}
									value={p.description}
									onChange={(e) =>
										updateItem("projects", i, { description: e.target.value })
									}
								/>
							</Field>
							<ListField
								id={`${p.id}-highlights`}
								mode="lines"
								label="Logros"
								hint="Uno por línea"
								value={p.highlights}
								onChange={(v) => updateItem("projects", i, { highlights: v })}
								className="sm:col-span-2"
							/>
							<ListField
								id={`${p.id}-tech`}
								label="Stack"
								hint="Separado por comas"
								value={p.technologies}
								onChange={(v) => updateItem("projects", i, { technologies: v })}
								className="sm:col-span-2"
							/>
						</CardContent>
					</Card>
				))}
				<Button
					type="button"
					variant="outline"
					onClick={() =>
						change({
							projects: [
								...draft.projects,
								{
									id: newId("proj"),
									name: "",
									description: "",
									highlights: [],
									technologies: [],
								},
							],
						})
					}
				>
					<PlusIcon /> Agregar proyecto
				</Button>
			</TabsContent>

			{/* 5. Educación */}
			<TabsContent value="education" className="grid gap-4 pt-2">
				<Card>
					<CardContent className="grid gap-4">
						{draft.education.map((ed, i) => (
							<div
								key={`edu-${i}`}
								className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_120px_auto]"
							>
								<TextField
									id={`edu-${i}-degree`}
									label="Título / certificación"
									value={ed.degree}
									onChange={(v) => updateItem("education", i, { degree: v })}
								/>
								<TextField
									id={`edu-${i}-inst`}
									label="Institución"
									value={ed.institution}
									onChange={(v) =>
										updateItem("education", i, { institution: v })
									}
								/>
								<TextField
									id={`edu-${i}-year`}
									label="Año"
									value={ed.year}
									onChange={(v) => updateItem("education", i, { year: v })}
								/>
								<RemoveButton
									label="Eliminar estudio"
									onClick={() => removeItem("education", i)}
								/>
							</div>
						))}
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								change({
									education: [
										...draft.education,
										{ institution: "", degree: "", year: "" },
									],
								})
							}
						>
							<PlusIcon /> Agregar estudio
						</Button>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
