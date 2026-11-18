import { GlobeIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MasterProfile } from "@/lib/types";

function Contact({
	icon: Icon,
	children,
	href,
}: {
	icon: typeof MailIcon;
	children: React.ReactNode;
	href?: string;
}) {
	if (!children) return null;
	const content = (
		<>
			<Icon className="size-3.5 shrink-0" />
			<span className="truncate">{children}</span>
		</>
	);
	return href ? (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex min-w-0 items-center gap-1.5 hover:text-foreground"
		>
			{content}
		</a>
	) : (
		<span className="flex min-w-0 items-center gap-1.5">{content}</span>
	);
}

/** Vista de lectura del perfil maestro (sirve para el guardado y la vista previa). */
export function ProfileView({ profile }: { profile: Partial<MasterProfile> }) {
	const links = [
		profile.linkedinUrl,
		profile.githubUrl,
		profile.portfolioUrl,
	].filter((l): l is string => Boolean(l));

	return (
		<div className="grid gap-6">
			<div className="grid gap-2">
				<h2 className="font-heading font-semibold text-2xl tracking-tight">
					{profile.fullName || "Sin nombre"}
				</h2>
				{profile.headline ? (
					<p className="text-muted-foreground">{profile.headline}</p>
				) : null}
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
					<Contact icon={MapPinIcon}>{profile.location}</Contact>
					<Contact
						icon={MailIcon}
						href={profile.email ? `mailto:${profile.email}` : undefined}
					>
						{profile.email}
					</Contact>
					<Contact icon={PhoneIcon}>{profile.phone}</Contact>
					{links.map((link) => (
						<Contact key={link} icon={GlobeIcon} href={link}>
							{link.replace(/^https?:\/\/(www\.)?/, "")}
						</Contact>
					))}
				</div>
			</div>

			{profile.summary ? (
				<p className="text-sm leading-relaxed">{profile.summary}</p>
			) : null}

			{profile.targetRoles?.length ? (
				<div className="flex flex-wrap gap-2">
					{profile.targetRoles.map((role) => (
						<Badge key={role}>{role}</Badge>
					))}
				</div>
			) : null}

			{profile.experiences?.length ? (
				<section className="grid gap-4">
					<Separator />
					<h3 className="font-medium">Experiencia</h3>
					{profile.experiences.map((exp) => (
						<div key={exp.id} className="grid gap-1.5">
							<div className="flex flex-wrap items-baseline justify-between gap-2">
								<p className="font-medium text-sm">
									{exp.role} ·{" "}
									<span className="text-muted-foreground">{exp.company}</span>
								</p>
								<p className="text-muted-foreground text-xs">{exp.period}</p>
							</div>
							<ul className="grid gap-1 pl-5 text-muted-foreground text-sm">
								{exp.highlights?.map((h) => (
									<li key={h} className="list-disc">
										{h}
									</li>
								))}
							</ul>
						</div>
					))}
				</section>
			) : null}

			{profile.projects?.length ? (
				<section className="grid gap-4">
					<Separator />
					<h3 className="font-medium">Proyectos</h3>
					{profile.projects.map((p) => (
						<div key={p.id} className="grid gap-1">
							<p className="font-medium text-sm">{p.name}</p>
							<p className="text-muted-foreground text-sm">{p.description}</p>
							{p.technologies?.length ? (
								<p className="text-muted-foreground text-xs">
									{p.technologies.join(" · ")}
								</p>
							) : null}
						</div>
					))}
				</section>
			) : null}

			{profile.skills?.length ? (
				<section className="grid gap-3">
					<Separator />
					<h3 className="font-medium">Habilidades</h3>
					{profile.skills.map((group) => (
						<div key={group.category} className="grid gap-1.5">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								{group.category}
							</p>
							<div className="flex flex-wrap gap-1.5">
								{group.items?.map((item) => (
									<Badge key={item} variant="secondary">
										{item}
									</Badge>
								))}
							</div>
						</div>
					))}
				</section>
			) : null}

			{profile.education?.length ? (
				<section className="grid gap-3">
					<Separator />
					<h3 className="font-medium">Educación</h3>
					{profile.education.map((ed) => (
						<p key={`${ed.institution}-${ed.degree}`} className="text-sm">
							{ed.degree} ·{" "}
							<span className="text-muted-foreground">{ed.institution}</span>{" "}
							<span className="text-muted-foreground text-xs">{ed.year}</span>
						</p>
					))}
				</section>
			) : null}
		</div>
	);
}
