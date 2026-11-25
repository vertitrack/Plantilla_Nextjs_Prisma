import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "JustWork — copiloto de búsqueda de empleo",
		short_name: "JustWork",
		description:
			"Evalúa vacantes, adapta tu CV, registra tus entrevistas y no pierdas ningún seguimiento.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		lang: "es",
		icons: [
			{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
			{ src: "/apple-icon", sizes: "180x180", type: "image/png" },
		],
		shortcuts: [
			{ name: "Hoy", url: "/today" },
			{ name: "Investigar vacante", url: "/investigate" },
			{ name: "Banco de preguntas", url: "/questions" },
		],
	};
}
