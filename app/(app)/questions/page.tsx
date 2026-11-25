"use client";

import { ListFilterIcon, MessagesSquareIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/lib/app-context";
import {
	type BankEntry,
	groupQuestions,
	normalizeQuestion,
	questionBank,
} from "@/lib/followups";
import {
	QUESTION_CATEGORY_LABELS,
	RATING_LABELS,
	STAGE_TYPE_LABELS,
} from "@/lib/labels";
import { QUESTION_CATEGORIES, STAGE_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "all";
type SourceFilter = "all" | "asked" | "predicted" | "practice";

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
	{ value: "all", label: "Todas" },
	{ value: "asked", label: "Me preguntaron" },
	{ value: "predicted", label: "Predichas" },
	{ value: "practice", label: "Por practicar" },
];

function FilterSelect({
	label,
	value,
	onChange,
	items,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	items: { value: string; label: string }[];
}) {
	const all = [{ value: ALL, label }, ...items];
	return (
		<Select
			items={all}
			value={value}
			onValueChange={(v) => onChange(String(v ?? ALL))}
		>
			<SelectTrigger className="w-full sm:w-44" aria-label={label}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{all.map((i) => (
					<SelectItem key={i.value} value={i.value}>
						{i.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/** Necesita práctica: me fue mal o aún no tengo respuesta. */
const needsPractice = (e: BankEntry) =>
	e.question.rating === 1 ||
	(!e.question.myAnswer && e.question.source === "asked");

export default function QuestionsPage() {
	const { applications, isLoadingDb } = useApp();
	const [query, setQuery] = useState("");
	const [source, setSource] = useState<SourceFilter>("all");
	const [role, setRole] = useState(ALL);
	const [company, setCompany] = useState(ALL);
	const [stageType, setStageType] = useState(ALL);
	const [category, setCategory] = useState(ALL);

	const entries = useMemo(() => questionBank(applications), [applications]);

	const roles = useMemo(
		() =>
			[...new Set(entries.map((e) => e.job.title))]
				.sort()
				.map((v) => ({ value: v, label: v })),
		[entries],
	);
	const companies = useMemo(
		() =>
			[...new Set(entries.map((e) => e.job.company))]
				.sort()
				.map((v) => ({ value: v, label: v })),
		[entries],
	);

	const groups = useMemo(() => {
		const terms = normalizeQuestion(query).split(" ").filter(Boolean);
		const filtered = entries.filter((e) => {
			if (source === "asked" && e.question.source !== "asked") return false;
			if (source === "predicted" && e.question.source !== "predicted")
				return false;
			if (source === "practice" && !needsPractice(e)) return false;
			if (role !== ALL && e.job.title !== role) return false;
			if (company !== ALL && e.job.company !== company) return false;
			if (stageType !== ALL && e.stage.type !== stageType) return false;
			if (category !== ALL && e.question.category !== category) return false;
			if (terms.length) {
				const hay = normalizeQuestion(
					[
						e.question.question,
						e.question.myAnswer,
						e.job.title,
						e.job.company,
					].join(" "),
				);
				if (!terms.every((t) => hay.includes(t))) return false;
			}
			return true;
		});
		return groupQuestions(filtered);
	}, [entries, query, source, role, company, stageType, category]);

	const askedTotal = entries.filter(
		(e) => e.question.source === "asked",
	).length;
	const processes = new Set(entries.map((e) => e.job.id)).size;
	const activeFilters = [role, company, stageType, category].filter(
		(v) => v !== ALL,
	).length;

	const selects = (
		<>
			<FilterSelect
				label="Todos los roles"
				value={role}
				onChange={setRole}
				items={roles}
			/>
			<FilterSelect
				label="Todas las empresas"
				value={company}
				onChange={setCompany}
				items={companies}
			/>
			<FilterSelect
				label="Todas las etapas"
				value={stageType}
				onChange={setStageType}
				items={STAGE_TYPES.map((t) => ({
					value: t,
					label: STAGE_TYPE_LABELS[t],
				}))}
			/>
			<FilterSelect
				label="Todas las categorías"
				value={category}
				onChange={setCategory}
				items={QUESTION_CATEGORIES.map((c) => ({
					value: c,
					label: QUESTION_CATEGORY_LABELS[c],
				}))}
			/>
		</>
	);

	return (
		<div className="mx-auto grid w-full max-w-4xl gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8">
			<PageHeader
				title="Banco de preguntas"
				description={
					entries.length
						? `${askedTotal} preguntas reales y ${entries.length - askedTotal} predichas en ${processes} procesos`
						: "Todo lo que te han preguntado, por rol, empresa y etapa."
				}
			/>

			{!isLoadingDb && entries.length === 0 ? (
				<div className="grid justify-items-center gap-3 rounded-lg border border-dashed p-10 text-center">
					<MessagesSquareIcon className="size-6 text-muted-foreground" />
					<p className="font-medium">Aún no registras preguntas</p>
					<p className="max-w-md text-muted-foreground text-sm">
						Abre una vacante, ve a la pestaña <strong>Proceso</strong> y anota
						las etapas y lo que te preguntaron en cada una. También puedes
						pedirle a la IA que prediga las preguntas más probables.
					</p>
					<Link href="/" className={buttonVariants({ variant: "outline" })}>
						Ir al tablero
					</Link>
				</div>
			) : (
				<>
					<div className="grid gap-3">
						<div className="flex items-center gap-2">
							<div className="relative min-w-0 flex-1">
								<SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
								<Input
									type="search"
									aria-label="Buscar preguntas"
									placeholder="Buscar en preguntas y respuestas"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									className="pl-8"
								/>
							</div>
							<Sheet>
								<SheetTrigger
									render={
										<Button variant="outline" className="md:hidden">
											<ListFilterIcon />
											{activeFilters ? `(${activeFilters})` : "Filtros"}
										</Button>
									}
								/>
								<SheetContent side="bottom" className="pb-safe rounded-t-xl">
									<SheetHeader>
										<SheetTitle>Filtros</SheetTitle>
										<SheetDescription>
											Acota por rol, empresa, etapa o categoría.
										</SheetDescription>
									</SheetHeader>
									<div className="grid gap-3 px-4 pb-6">{selects}</div>
								</SheetContent>
							</Sheet>
						</div>
						<div className="hidden flex-wrap gap-2 md:flex">{selects}</div>
						{/* biome-ignore lint/a11y/useSemanticElements: grupo de botones tipo filtro */}
						<div
							role="group"
							aria-label="Tipo de pregunta"
							className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
						>
							{SOURCE_OPTIONS.map((o) => (
								<button
									key={o.value}
									type="button"
									aria-pressed={source === o.value}
									onClick={() => setSource(o.value)}
									className={cn(
										"shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
										source === o.value
											? "border-primary bg-primary text-primary-foreground"
											: "text-muted-foreground",
									)}
								>
									{o.label}
								</button>
							))}
						</div>
					</div>

					<div className="grid gap-3">
						{groups.map((g) => {
							const best = g.entries.find((e) => e.question.myAnswer);
							return (
								<Card key={g.key} size="sm">
									<CardContent className="grid gap-3">
										<div className="flex items-start justify-between gap-2">
											<p className="font-medium text-sm leading-snug">
												{g.question}
											</p>
											{g.askedCount > 1 ? (
												<Badge className="shrink-0">
													{g.askedCount}× preguntada
												</Badge>
											) : null}
										</div>
										<div className="flex flex-wrap gap-1.5">
											{g.entries.map((e) => (
												<Link
													key={`${e.job.id}-${e.question.id}`}
													href={`/jobs/${e.job.id}?tab=process`}
													className="inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
												>
													<span className="truncate">
														{e.job.company} · {STAGE_TYPE_LABELS[e.stage.type]}
													</span>
													{e.question.source === "predicted" ? (
														<span className="text-muted-foreground">(IA)</span>
													) : null}
													{e.question.rating ? (
														<span
															className={cn(
																e.question.rating === 1
																	? "text-destructive"
																	: "text-muted-foreground",
															)}
														>
															· {RATING_LABELS[e.question.rating]}
														</span>
													) : null}
												</Link>
											))}
										</div>
										{best?.question.myAnswer ? (
											<details className="group rounded-md bg-muted/50 p-2 text-sm">
												<summary className="cursor-pointer text-muted-foreground text-xs">
													Ver mi respuesta ({best.job.company})
												</summary>
												<p className="mt-2 whitespace-pre-line leading-relaxed">
													{best.question.myAnswer}
												</p>
												<div className="mt-2">
													<CopyButton
														text={best.question.myAnswer}
														size="xs"
														variant="ghost"
													/>
												</div>
											</details>
										) : null}
									</CardContent>
								</Card>
							);
						})}
						{groups.length === 0 ? (
							<p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
								Ninguna pregunta coincide con los filtros.
							</p>
						) : null}
					</div>
				</>
			)}
		</div>
	);
}
