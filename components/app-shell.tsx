"use client";

import {
	BarChart3Icon,
	BriefcaseIcon,
	FileUserIcon,
	KanbanSquareIcon,
	LogOutIcon,
	MenuIcon,
	SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { logout } from "@/app/login/actions";
import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { conversionStats } from "@/lib/analytics";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

const NAV = [
	{ href: "/", label: "Tablero", icon: KanbanSquareIcon },
	{ href: "/profile", label: "Mi CV maestro", icon: FileUserIcon },
	{ href: "/investigate", label: "Investigar vacante", icon: SearchIcon },
	{ href: "/analytics", label: "Analítica", icon: BarChart3Icon },
];

function isActive(pathname: string, href: string) {
	if (href === "/") return pathname === "/" || pathname.startsWith("/jobs/");
	return pathname.startsWith(href);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname();
	const { applications, profile } = useApp();
	const stats = conversionStats(applications);

	return (
		<div className="flex h-full flex-col gap-6 p-4">
			<Link
				href="/"
				onClick={onNavigate}
				className="flex items-center gap-2 px-2"
			>
				<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<BriefcaseIcon className="size-4" />
				</div>
				<span className="font-heading font-semibold text-lg">JustWork</span>
			</Link>

			<Link
				href="/investigate"
				onClick={onNavigate}
				className={cn(buttonVariants(), "w-full")}
			>
				<SearchIcon />
				Nueva vacante
			</Link>

			<nav className="grid gap-1">
				{NAV.map(({ href, label, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						onClick={onNavigate}
						className={cn(
							"flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted",
							isActive(pathname, href)
								? "bg-muted font-medium text-foreground"
								: "text-muted-foreground",
						)}
					>
						<Icon className="size-4" />
						{label}
					</Link>
				))}
			</nav>

			<div className="grid gap-2 rounded-lg border p-3">
				<p className="text-muted-foreground text-xs">Conversión a entrevista</p>
				<p className="font-semibold text-2xl tabular-nums">
					{stats.sent ? `${stats.interviewRate}%` : "—"}
				</p>
				<Progress
					value={stats.interviewRate}
					aria-label="Conversión a entrevista"
				/>
				<p className="text-muted-foreground text-xs">
					{stats.interviews} de {stats.sent} postulaciones enviadas
				</p>
			</div>

			<div className="mt-auto flex items-center justify-between gap-2">
				<p className="truncate px-2 text-muted-foreground text-xs">
					{profile.fullName || "Sin perfil"}
				</p>
				<div className="flex items-center gap-1">
					<ModeToggle />
					<form action={logout}>
						<Button
							variant="ghost"
							size="icon"
							type="submit"
							aria-label="Salir"
						>
							<LogOutIcon />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}

export function AppShell({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex min-h-svh w-full">
			<aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r bg-sidebar lg:block">
				<SidebarContent />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/90 px-4 py-2 backdrop-blur lg:hidden">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger
							render={
								<Button variant="ghost" size="icon" aria-label="Abrir menú">
									<MenuIcon />
								</Button>
							}
						/>
						<SheetContent side="left" className="w-72 p-0">
							<SheetTitle className="sr-only">Navegación</SheetTitle>
							<SidebarContent onNavigate={() => setOpen(false)} />
						</SheetContent>
					</Sheet>
					<span className="font-heading font-semibold">JustWork</span>
				</header>
				<main className="flex flex-1 flex-col">{children}</main>
			</div>
		</div>
	);
}

/** Encabezado común de cada vista. */
export function PageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div className="grid gap-1">
				<h1 className="font-heading font-semibold text-2xl tracking-tight">
					{title}
				</h1>
				{description ? (
					<p className="text-muted-foreground text-sm">{description}</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex flex-wrap items-center gap-2">{actions}</div>
			) : null}
		</div>
	);
}
