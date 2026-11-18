"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({
	text,
	label = "Copiar",
	size = "sm",
	variant = "outline",
}: {
	text: string;
	label?: string;
	size?: "sm" | "xs" | "default";
	variant?: "outline" | "ghost" | "secondary";
}) {
	const [copied, setCopied] = useState(false);
	return (
		<Button
			type="button"
			size={size}
			variant={variant}
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setCopied(true);
					toast.success("Copiado al portapapeles");
					setTimeout(() => setCopied(false), 1500);
				} catch {
					toast.error("No se pudo copiar");
				}
			}}
		>
			{copied ? <CheckIcon /> : <CopyIcon />}
			{label}
		</Button>
	);
}
