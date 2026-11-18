import type { MasterProfile } from "@/lib/types";

/** Convierte tu CV maestro a Markdown limpio. */
export function profileToMarkdown(p: MasterProfile): string {
	const lines: string[] = [];
	lines.push(`# ${p.fullName || "Sin nombre"}`);
	if (p.headline) lines.push(`**${p.headline}**`);
	const contact = [p.email, p.phone, p.location].filter(Boolean).join(" · ");
	if (contact) lines.push("", contact);
	const links = [
		p.linkedinUrl && `[LinkedIn](${p.linkedinUrl})`,
		p.githubUrl && `[GitHub](${p.githubUrl})`,
		p.portfolioUrl && `[Portafolio](${p.portfolioUrl})`,
	].filter(Boolean);
	if (links.length) lines.push(links.join(" · "));

	if (p.summary) lines.push("", "## Resumen", "", p.summary);
	if (p.targetRoles?.length || p.targetSalary) {
		lines.push("", "## Objetivo", "");
		if (p.targetRoles?.length)
			lines.push(`- **Roles:** ${p.targetRoles.join(", ")}`);
		if (p.targetSalary) lines.push(`- **Banda salarial:** ${p.targetSalary}`);
	}

	if (p.experiences?.length) {
		lines.push("", "## Experiencia");
		for (const e of p.experiences) {
			lines.push("", `### ${e.role} — ${e.company}`, `*${e.period}*`, "");
			for (const h of e.highlights ?? []) lines.push(`- ${h}`);
			if (e.skillsUsed?.length)
				lines.push("", `**Tecnologías:** ${e.skillsUsed.join(", ")}`);
		}
	}

	if (p.skills?.length) {
		lines.push("", "## Habilidades", "");
		for (const s of p.skills)
			lines.push(`- **${s.category}:** ${s.items.join(", ")}`);
	}

	if (p.projects?.length) {
		lines.push("", "## Proyectos");
		for (const pr of p.projects) {
			lines.push(
				"",
				`### ${pr.link ? `[${pr.name}](${pr.link})` : pr.name}`,
				"",
				pr.description,
			);
			for (const h of pr.highlights ?? []) lines.push(`- ${h}`);
			if (pr.technologies?.length)
				lines.push("", `**Stack:** ${pr.technologies.join(", ")}`);
		}
	}

	if (p.education?.length) {
		lines.push("", "## Educación", "");
		for (const ed of p.education)
			lines.push(`- **${ed.degree}** — ${ed.institution} (${ed.year})`);
	}

	return `${lines.join("\n").trim()}\n`;
}

/** Descarga un texto como archivo .md. */
export function downloadMarkdown(filename: string, content: string) {
	const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
	a.click();
	URL.revokeObjectURL(url);
}

export function slugify(text: string) {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}
