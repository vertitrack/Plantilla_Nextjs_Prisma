import { BriefcaseIcon, LogOutIcon } from "lucide-react";
import { connection } from "next/server";
import { CvAnalysisView } from "@/components/cv-analysis";
import { CvUpload } from "@/components/cv-upload";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfileView } from "@/components/profile-view";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { getProfile } from "@/lib/repository";
import { logout } from "./login/actions";

const dateFormat = new Intl.DateTimeFormat("es-CL", {
	dateStyle: "medium",
	timeStyle: "short",
});

export default async function Home() {
	await connection();
	await requireAuth();
	const profile = await getProfile();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
			<header className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<BriefcaseIcon className="size-4" />
					</div>
					<span className="font-heading font-semibold text-lg">JustWork</span>
				</div>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<form action={logout}>
						<Button variant="ghost" size="sm" type="submit">
							<LogOutIcon />
							Salir
						</Button>
					</form>
				</div>
			</header>

			{profile ? (
				<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
					<Card>
						<CardContent>
							<ProfileView profile={profile} />
						</CardContent>
					</Card>

					<div className="grid gap-6">
						{profile.cvAnalysis ? (
							<Card>
								<CardHeader>
									<CardTitle>Análisis de tu CV</CardTitle>
									{profile.cvAnalyzedAt ? (
										<CardDescription>
											{dateFormat.format(new Date(profile.cvAnalyzedAt))}
										</CardDescription>
									) : null}
								</CardHeader>
								<CardContent>
									<CvAnalysisView analysis={profile.cvAnalysis} />
								</CardContent>
							</Card>
						) : null}
						<CvUpload hasProfile />
					</div>
				</div>
			) : (
				<div className="mx-auto grid w-full max-w-3xl gap-6 py-6">
					<div className="grid gap-2 text-center">
						<h1 className="font-heading font-semibold text-3xl tracking-tight">
							Empecemos por ti
						</h1>
						<p className="text-muted-foreground">
							Sube tu CV para crear tu perfil maestro. Será la fuente de verdad
							para evaluar vacantes, adaptar tu CV y responder formularios.
						</p>
					</div>
					<CvUpload hasProfile={false} />
				</div>
			)}
		</div>
	);
}
