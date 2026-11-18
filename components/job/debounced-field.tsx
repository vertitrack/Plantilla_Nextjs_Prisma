"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** Campo que guarda solo tras dejar de escribir (autoguardado). */
export function DebouncedField({
	id,
	value,
	onSave,
	multiline,
	rows = 5,
	type = "text",
	placeholder,
}: {
	id: string;
	value: string;
	onSave: (value: string) => void;
	multiline?: boolean;
	rows?: number;
	type?: string;
	placeholder?: string;
}) {
	const [text, setText] = useState(value);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const latest = useRef(value);

	useEffect(() => {
		// Sincroniza si el valor cambia desde fuera y no hay edición pendiente.
		if (!timer.current) setText(value);
	}, [value]);
	useEffect(
		() => () => {
			if (timer.current) {
				clearTimeout(timer.current);
				onSave(latest.current);
			}
		},
		[onSave],
	);

	function change(next: string) {
		setText(next);
		latest.current = next;
		clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			timer.current = undefined;
			onSave(next);
		}, 800);
	}

	return multiline ? (
		<Textarea
			id={id}
			rows={rows}
			value={text}
			placeholder={placeholder}
			onChange={(e) => change(e.target.value)}
		/>
	) : (
		<Input
			id={id}
			type={type}
			value={text}
			placeholder={placeholder}
			onChange={(e) => change(e.target.value)}
		/>
	);
}
