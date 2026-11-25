"use client";

import {
	BarChart3Icon,
	BriefcaseIcon,
	CalendarCheckIcon,
	FileUserIcon,
	KanbanSquareIcon,
	LogOutIcon,
	MenuIcon,
	MessagesSquareIcon,
	PlusIcon,
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
import { dueCount } from "@/lib/followups";
import { cn } from "@/lib/utils";

const NAV = [
	{ href: "/", label: "Tablero", icon: KanbanSquareIcon },
	{ href: "/today", label: "Hoy", icon: CalendarCheckIcon },
	{ href: "/questions", label: "Banco de preguntas", icon: MessagesSquareIcon },
	{ href: "/investigate", label: "Investigar vacante", icon: SearchIcon },
	{ href: "/profile", label: "Mi CV maestro", icon: FileUserIcon },
	{ href: "/analytics", label: "Analítica", icon: BarChart3Icon },
];

/** Contador de seguimientos que requieren atención hoy. */
function DueBadge({ className }: { className?: string }) {
	const { applications } = useApp();
	const count = dueCount(applications);
	if (!count) return null;
	return (
		<span
			className={cn(
				"inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-medium text-[10px] text-white tabular-nums leading-4",
				className,
			)}
			aria-label={`${count} seguimientos pendientes`}
		>
			{count}
		</span>
	);
}

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
						{href === "/today" ? <DueBadge className="ml-auto" /> : null}
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

const TABS = [
	{ href: "/", label: "Tablero", icon: KanbanSquareIcon },
	{ href: "/today", label: "Hoy", icon: CalendarCheckIcon },
	{ href: "/investigate", label: "Nueva", icon: PlusIcon, primary: true },
	{ href: "/questions", label: "Preguntas", icon: MessagesSquareIcon },
];

/** Barra de navegación inferior para móvil (pulgar-friendly). */
function BottomNav() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const moreActive = ["/profile", "/analytics"].some((h) =>
		pathname.startsWith(h),
	);

	return (
		<nav
			aria-label="Navegación principal"
			className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden"
		>
			<div className="mx-auto grid h-16 max-w-lg grid-cols-5">
				{TABS.map(({ href, label, icon: Icon, primary }) => {
					const active = isActive(pathname, href);
					return (
						<Link
							key={href}
							href={href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"relative flex flex-col items-center justify-center gap-0.5 text-[11px]",
								active ? "text-foreground" : "text-muted-foreground",
							)}
						>
							{primary ? (
								<span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
									<Icon className="size-5" />
								</span>
							) : (
								<>
									<span className="relative">
										<Icon className="size-5" />
										{href === "/today" ? (
											<DueBadge className="-top-1.5 -right-2.5 absolute" />
										) : null}
									</span>
									<span className={cn(active && "font-medium")}>{label}</span>
								</>
							)}
						</Link>
					);
				})}
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger
						render={
							<button
								type="button"
								className={cn(
									"flex flex-col items-center justify-center gap-0.5 text-[11px]",
									moreActive ? "text-foreground" : "text-muted-foreground",
								)}
							>
								<MenuIcon className="size-5" />
								<span>Más</span>
							</button>
						}
					/>
					<SheetContent side="left" className="w-72 p-0">
						<SheetTitle className="sr-only">Navegación</SheetTitle>
						<SidebarContent onNavigate={() => setOpen(false)} />
					</SheetContent>
				</Sheet>
			</div>
		</nav>
	);
}

export function AppShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-svh w-full">
			<aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r bg-sidebar lg:block">
				<SidebarContent />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-2 border-b bg-background/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
					<Link href="/" className="flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<BriefcaseIcon className="size-3.5" />
						</div>
						<span className="font-heading font-semibold">JustWork</span>
					</Link>
					<ModeToggle />
				</header>
				<main className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
					{children}
				</main>
			</div>
			<BottomNav />
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
		<div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
			<div className="grid min-w-0 gap-1">
				<h1 className="font-heading font-semibold text-xl tracking-tight sm:text-2xl">
					{title}
				</h1>
				{description ? (
					<p className="text-muted-foreground text-sm">{description}</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
					{actions}
				</div>
			) : null}
		</div>
	);
}
