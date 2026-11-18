import "server-only";
import { Type } from "@google/genai";
import { generateJson } from "@/lib/gemini";
import type {
	JobEvaluation,
	MasterProfile,
	QAPair,
	TailoredResume,
	WorkType,
} from "@/lib/types";

// Lógica de IA de JustWork. Cada función arma el prompt con el perfil maestro
// como fuente de verdad (RAG) y fuerza una respuesta JSON con responseSchema.

export interface JobContext {
	jobTitle?: string;
	company?: string;
	jobText: string;
}

/** Evalúa la afinidad del candidato con una vacante. */
export function evaluateJob(profile: MasterProfile, job: JobContext) {
	const prompt = `Actúa como un reclutador senior y consejero de carrera de alto nivel.
Evalúa a fondo la siguiente oferta de trabajo con respecto al perfil profesional maestro del candidato.
Determina objetivamente si vale la pena postular o no, el porcentaje de coincidencia real (0 a 100), los puntos fuertes donde el candidato destaca, las lagunas o requisitos no cumplidos, pros y contras de la oportunidad, y una estrategia de postulación.

[PERFIL DEL CANDIDATO]:
Nombre: ${profile.fullName}
Titular: ${profile.headline}
Resumen: ${profile.summary}
Habilidades: ${JSON.stringify(profile.skills)}
Experiencia Laboral:
${profile.experiences?.map((e) => `- ${e.role} en ${e.company} (${e.period}): ${e.highlights?.join("; ")} [Tecnologías: ${e.skillsUsed?.join(", ")}]`).join("\n")}
Proyectos Destacados:
${profile.projects?.map((p) => `- ${p.name}: ${p.description}. Logros: ${p.highlights?.join("; ")} [Tecnologías: ${p.technologies?.join(", ")}]`).join("\n")}
Educación: ${JSON.stringify(profile.education)}
Roles Objetivo: ${profile.targetRoles?.join(", ")}

[OFERTA DE EMPLEO]:
Título: ${job.jobTitle || "No especificado"}
Empresa: ${job.company || "No especificada"}
Descripción y Requisitos:
${job.jobText.slice(0, 12000)}`;

	return generateJson<JobEvaluation>(prompt, {
		type: Type.OBJECT,
		properties: {
			fitScore: {
				type: Type.INTEGER,
				description:
					"Puntaje de afinidad de 0 a 100 basado en compatibilidad real de requisitos",
			},
			recommendation: {
				type: Type.STRING,
				enum: ["APPLY_STRONG", "APPLY_MODERATE", "PASS"],
				description:
					"APPLY_STRONG: alta afinidad (>=75%), APPLY_MODERATE: afinidad media (50-74%), PASS: baja afinidad (<50%)",
			},
			recommendationHeadline: {
				type: Type.STRING,
				description: "Frase contundente de 1 línea con el veredicto",
			},
			reasoning: {
				type: Type.STRING,
				description:
					"Explicación detallada del porqué de la recomendación en 2-3 párrafos.",
			},
			matchingSkills: {
				type: Type.ARRAY,
				items: { type: Type.STRING },
				description:
					"Habilidades y experiencias que el candidato posee claramente.",
			},
			missingSkills: {
				type: Type.ARRAY,
				items: { type: Type.STRING },
				description:
					"Requisitos de la vacante que no están presentes en el perfil.",
			},
			pros: {
				type: Type.ARRAY,
				items: { type: Type.STRING },
				description: "Ventajas de esta vacante para el candidato.",
			},
			cons: {
				type: Type.ARRAY,
				items: { type: Type.STRING },
				description: "Desventajas o banderas rojas detectadas.",
			},
			interviewTips: {
				type: Type.ARRAY,
				items: { type: Type.STRING },
				description: "3 a 4 consejos tácticos específicos para la candidatura.",
			},
			estimatedSeniority: {
				type: Type.STRING,
				description: "Nivel estimado: Junior, Mid, Senior, Lead, Staff, etc.",
			},
		},
		required: [
			"fitScore",
			"recommendation",
			"recommendationHeadline",
			"reasoning",
			"matchingSkills",
			"missingSkills",
			"pros",
			"cons",
			"interviewTips",
		],
	});
}

/** Adapta CV, resumen y carta de presentación a una vacante concreta. */
export function tailorResume(profile: MasterProfile, job: JobContext) {
	const prompt = `Eres un redactor profesional de currículums ATS y cartas de presentación para puestos de alto nivel.
Tu tarea es ADAPTAR el perfil del candidato específicamente para esta oferta de empleo.

REGLAS ESTRICTAS DE INTEGRIDAD:
1. NO inventes empresas, cargos o años de experiencia que no estén en el perfil del candidato.
2. SÍ puedes reescribir y reorganizar los bullet points de las experiencias reales para destacar las palabras clave, tecnologías y logros más relevantes para esta vacante específica.
3. Genera un Perfil Profesional / Resumen Ejecutivo adaptado al rol y a los dolores de la empresa.
4. Genera una Carta de Presentación (Cover Letter) persuasiva, humana y personalizada (en español a menos que la vacante esté totalmente en inglés).

[PERFIL DEL CANDIDATO]:
Nombre: ${profile.fullName}
Titular: ${profile.headline}
Email: ${profile.email} | Tel: ${profile.phone} | Ubicación: ${profile.location}
Enlaces: ${profile.linkedinUrl || ""} ${profile.githubUrl || ""} ${profile.portfolioUrl || ""}
Resumen actual: ${profile.summary}
Habilidades: ${JSON.stringify(profile.skills)}
Experiencias: ${JSON.stringify(profile.experiences)}
Proyectos: ${JSON.stringify(profile.projects)}
Educación: ${JSON.stringify(profile.education)}

[OFERTA DE TRABAJO A LA QUE POSTULA]:
Puesto: ${job.jobTitle}
Empresa: ${job.company}
Descripción:
${job.jobText.slice(0, 10000)}`;

	return generateJson<TailoredResume>(prompt, {
		type: Type.OBJECT,
		properties: {
			tailoredHeadline: {
				type: Type.STRING,
				description: "Titular profesional adaptado específicamente para el rol",
			},
			tailoredSummary: {
				type: Type.STRING,
				description:
					"Resumen profesional de 3-4 líneas alineado con la necesidad de la empresa",
			},
			tailoredResumeMarkdown: {
				type: Type.STRING,
				description:
					"Currículum vitae completo formateado en Markdown limpio y estructurado",
			},
			tailoredCoverLetterMarkdown: {
				type: Type.STRING,
				description: "Carta de presentación personalizada completa en Markdown",
			},
			atsKeywordsIncluded: {
				type: Type.ARRAY,
				items: { type: Type.STRING },
				description: "Palabras clave de la vacante incorporadas en el CV",
			},
			keyPitchAngle: {
				type: Type.STRING,
				description: "Ángulo principal o propuesta única de valor utilizada",
			},
		},
		required: [
			"tailoredHeadline",
			"tailoredSummary",
			"tailoredResumeMarkdown",
			"tailoredCoverLetterMarkdown",
			"atsKeywordsIncluded",
			"keyPitchAngle",
		],
	});
}

/** Responde preguntas de screening basándose solo en el perfil real. */
export function answerQuestions(
	profile: MasterProfile,
	job: Partial<JobContext>,
	questions: string[],
) {
	const prompt = `Eres el copiloto personal de postulación del candidato.
El usuario está rellenando el formulario de postulación para el puesto "${job.jobTitle}" en "${job.company}".
El formulario le hace una serie de preguntas de filtro / screening.
Tu trabajo es responder a CADA pregunta utilizando como fuente de verdad (RAG) la información real del perfil del candidato.

NORMAS CRÍTICAS:
- Basa cada respuesta estrictamente en los proyectos, logros, roles y habilidades reales del perfil.
- Utiliza la metodología STAR (Situación, Tarea, Acción, Resultado) para preguntas de comportamiento ("Cuéntanos sobre una vez que...").
- Adopta un tono profesional, seguro, en primera persona ("he liderado...", "en mi rol anterior implementé...").
- Cada respuesta debe ser persuasiva, precisa y lista para copiar y pegar en el formulario de la empresa.

[PERFIL MAESTRO DEL CANDIDATO]:
${JSON.stringify(profile, null, 2)}

[CONTEXTO DE LA VACANTE]:
Puesto: ${job.jobTitle}
Empresa: ${job.company}
Extracto de la vacante: ${job.jobText?.slice(0, 4000) || "No provisto"}

[PREGUNTAS DEL FORMULARIO A RESPONDER]:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;

	return generateJson<{ answers: QAPair[] }>(prompt, {
		type: Type.OBJECT,
		properties: {
			answers: {
				type: Type.ARRAY,
				items: {
					type: Type.OBJECT,
					properties: {
						question: { type: Type.STRING },
						answer: { type: Type.STRING },
						groundedIn: {
							type: Type.STRING,
							description:
								"Qué experiencia o proyecto del perfil respalda esta respuesta",
						},
						tips: {
							type: Type.STRING,
							description:
								"Consejo rápido para el candidato si le preguntan más sobre esto",
						},
					},
					required: ["question", "answer", "groundedIn"],
				},
			},
		},
		required: ["answers"],
	});
}

/** Convierte el texto de un CV en un perfil maestro estructurado. */
export async function parseCv(rawText: string) {
	const parsed = await generateJson<Partial<MasterProfile>>(
		`Eres un reclutador y experto en carreras técnicas. Analiza el siguiente texto de un currículum o perfil profesional y extrae todos los datos estructurados con el mayor detalle posible. No inventes información:

Texto del CV:
${rawText.slice(0, 20000)}`,
		{
			type: Type.OBJECT,
			properties: {
				fullName: { type: Type.STRING },
				headline: { type: Type.STRING },
				email: { type: Type.STRING },
				phone: { type: Type.STRING },
				location: { type: Type.STRING },
				portfolioUrl: { type: Type.STRING },
				linkedinUrl: { type: Type.STRING },
				githubUrl: { type: Type.STRING },
				summary: { type: Type.STRING },
				skills: {
					type: Type.ARRAY,
					items: {
						type: Type.OBJECT,
						properties: {
							category: { type: Type.STRING },
							items: { type: Type.ARRAY, items: { type: Type.STRING } },
						},
						required: ["category", "items"],
					},
				},
				experiences: {
					type: Type.ARRAY,
					items: {
						type: Type.OBJECT,
						properties: {
							id: { type: Type.STRING },
							company: { type: Type.STRING },
							role: { type: Type.STRING },
							period: { type: Type.STRING },
							highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
							skillsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
						},
						required: ["company", "role", "period", "highlights", "skillsUsed"],
					},
				},
				projects: {
					type: Type.ARRAY,
					items: {
						type: Type.OBJECT,
						properties: {
							id: { type: Type.STRING },
							name: { type: Type.STRING },
							description: { type: Type.STRING },
							highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
							technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
						},
						required: ["name", "description", "highlights", "technologies"],
					},
				},
				education: {
					type: Type.ARRAY,
					items: {
						type: Type.OBJECT,
						properties: {
							institution: { type: Type.STRING },
							degree: { type: Type.STRING },
							year: { type: Type.STRING },
						},
						required: ["institution", "degree", "year"],
					},
				},
				targetRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
				targetSalary: { type: Type.STRING },
			},
			required: ["fullName", "headline", "summary", "skills", "experiences"],
		},
	);

	const stamp = Date.now();
	parsed.experiences = parsed.experiences?.map((exp, idx) => ({
		...exp,
		id: exp.id || `exp-${stamp}-${idx}`,
	}));
	parsed.projects = parsed.projects?.map((proj, idx) => ({
		...proj,
		id: proj.id || `proj-${stamp}-${idx}`,
	}));
	return parsed;
}

/** Extrae los datos clave de una vacante a partir de su texto plano. */
export function extractJobPosting(text: string) {
	return generateJson<{
		title?: string;
		company?: string;
		location?: string;
		workType?: WorkType;
		salaryRange?: string;
		summary?: string;
	}>(
		`Analiza este texto extraído de una oferta de empleo y extrae únicamente:
1. Título del puesto
2. Nombre de la empresa u organización
3. Ubicación o modalidad (Remoto / Híbrido / Presencial)
4. Rango salarial si está especificado (o "No especificado")
5. Un resumen conciso de 2 párrafos de la vacante.

Texto:
${text.slice(0, 5000)}`,
		{
			type: Type.OBJECT,
			properties: {
				title: { type: Type.STRING },
				company: { type: Type.STRING },
				location: { type: Type.STRING },
				workType: {
					type: Type.STRING,
					enum: ["remote", "hybrid", "onsite", "unknown"],
				},
				salaryRange: { type: Type.STRING },
				summary: { type: Type.STRING },
			},
			required: ["title", "company", "location", "summary"],
		},
	);
}
