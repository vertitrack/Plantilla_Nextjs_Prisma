"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Campos de formulario reutilizables para el editor del CV maestro.

export function Field({
	label,
	htmlFor,
	hint,
	className,
	children,
}: {
	label: string;
	htmlFor: string;
	hint?: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={cn("grid gap-1.5", className)}>
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			{hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
		</div>
	);
}

export function TextField({
	id,
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	className,
}: {
	id: string;
	label: string;
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
	type?: string;
	className?: string;
}) {
	return (
		<Field label={label} htmlFor={id} className={className}>
			<Input
				id={id}
				type={type}
				value={value ?? ""}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
			/>
		</Field>
	);
}

const splitComma = (text: string) =>
	text
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
const splitLines = (text: string) =>
	text
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);

/**
 * Lista editada como texto (separada por comas o por líneas). Mantiene el texto
 * crudo mientras escribes para no mover el cursor al limpiar separadores.
 */
export function ListField({
	id,
	label,
	value,
	onChange,
	mode = "comma",
	placeholder,
	hint,
	rows = 4,
	className,
}: {
	id: string;
	label: string;
	value: string[] | undefined;
	onChange: (value: string[]) => void;
	mode?: "comma" | "lines";
	placeholder?: string;
	hint?: string;
	rows?: number;
	className?: string;
}) {
	const join = (v: string[] | undefined) =>
		(v ?? []).join(mode === "comma" ? ", " : "\n");
	const [text, setText] = useState(() => join(value));
	const [synced, setSynced] = useState(value);
	// Si el valor cambia desde fuera (p. ej. al importar el CV), se resincroniza.
	if (
		value !== synced &&
		JSON.stringify(value) !== JSON.stringify(splitByMode(text))
	) {
		setSynced(value);
		setText(join(value));
	}
	function splitByMode(t: string) {
		return mode === "comma" ? splitComma(t) : splitLines(t);
	}
	function update(next: string) {
		setText(next);
		const parsed = splitByMode(next);
		setSynced(parsed);
		onChange(parsed);
	}

	return (
		<Field label={label} htmlFor={id} hint={hint} className={className}>
			{mode === "comma" ? (
				<Input
					id={id}
					value={text}
					placeholder={placeholder}
					onChange={(e) => update(e.target.value)}
				/>
			) : (
				<Textarea
					id={id}
					rows={rows}
					value={text}
					placeholder={placeholder}
					onChange={(e) => update(e.target.value)}
				/>
			)}
		</Field>
	);
}
