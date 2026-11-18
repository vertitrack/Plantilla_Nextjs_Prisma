import { AppShell } from "@/components/app-shell";
import { AppProvider } from "@/lib/app-context";
import { requireAuth } from "@/lib/auth";

export default async function PrivateLayout({ children }: LayoutProps<"/">) {
	await requireAuth();
	return (
		<AppProvider>
			<AppShell>{children}</AppShell>
		</AppProvider>
	);
}
