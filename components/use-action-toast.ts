"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/app/actions";

/** Muestra un toast cada vez que una Server Action devuelve un estado nuevo. */
export function useActionToast(state: ActionState) {
	useEffect(() => {
		if (!state) return;
		if (state.ok) toast.success(state.message);
		else toast.error(state.message);
	}, [state]);
}
