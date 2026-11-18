import { AppShell } from "@/components/app-shell";
import { AppProvider } from "@/lib/app-context";
import { requireAuth } from "@/lib/auth";

// Las Server Actions de IA (p. ej. analizar el CV) pueden tardar hasta ~2 min.
export const maxDuration = 300;

export default async function PrivateLayout({ children }: LayoutProps<"/">) {
	await requireAuth();
	return (
		<AppProvider>
			<AppShell>{children}</AppShell>
		</AppProvider>
	);
}
