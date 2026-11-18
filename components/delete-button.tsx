"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteButton({
	action,
	label,
	confirmMessage,
}: {
	action: () => Promise<void>;
	label: string;
	confirmMessage?: string;
}) {
	const [pending, startTransition] = useTransition();

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			aria-label={label}
			disabled={pending}
			onClick={() => {
				if (confirmMessage && !window.confirm(confirmMessage)) return;
				startTransition(async () => {
					try {
						await action();
						toast.success("Eliminado.");
					} catch {
						toast.error("No se pudo eliminar.");
					}
				});
			}}
		>
			{pending ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
		</Button>
	);
}
