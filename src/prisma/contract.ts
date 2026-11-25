import { defineContract } from "@prisma/orm-postgres/contract-builder";

export const contract = defineContract({}, ({ field, model }) => {
	// Perfil maestro del candidato: la fuente de verdad (RAG) para la IA.
	const MasterProfile = model("MasterProfile", {
		fields: {
			id: field.id.uuidv7String(),
			fullName: field.text(),
			headline: field.text(),
			email: field.text(),
			phone: field.text(),
			location: field.text(),
			portfolioUrl: field.text().optional(),
			linkedinUrl: field.text().optional(),
			githubUrl: field.text().optional(),
			summary: field.text(),
			targetSalary: field.text().optional(),
			targetRoles: field.json(),
			skills: field.json(),
			experiences: field.json(),
			projects: field.json(),
			education: field.json(),
			// Último análisis del CV hecho con IA (puntaje, fortalezas, mejoras...).
			cvAnalysis: field.json().optional(),
			cvAnalyzedAt: field.text().optional(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	// Vacante investigada + evaluación, CV adaptado y respuestas generadas.
	const JobApplication = model("JobApplication", {
		fields: {
			id: field.id.uuidv7String(),
			title: field.text(),
			company: field.text(),
			location: field.text(),
			url: field.text().optional(),
			sourceText: field.text(),
			salaryRange: field.text().optional(),
			workType: field.text().optional(),
			status: field.text(),
			dateAdded: field.text(),
			dateApplied: field.text().optional(),
			fitScore: field.int().optional(),
			recommendation: field.text().optional(),
			recommendationHeadline: field.text().optional(),
			reasoning: field.text().optional(),
			matchingSkills: field.json(),
			missingSkills: field.json(),
			pros: field.json(),
			cons: field.json(),
			interviewTips: field.json(),
			estimatedSeniority: field.text().optional(),
			tailoredHeadline: field.text().optional(),
			tailoredSummary: field.text().optional(),
			tailoredResumeMarkdown: field.text().optional(),
			tailoredCoverLetterMarkdown: field.text().optional(),
			atsKeywordsIncluded: field.json(),
			keyPitchAngle: field.text().optional(),
			qaPairs: field.json(),
			notes: field.text().optional(),
			outcomeReason: field.text().optional(),
			// Seguimiento: próxima acción y su fecha (YYYY-MM-DD).
			nextAction: field.text().optional(),
			nextActionAt: field.text().optional(),
			// Proceso de entrevista: etapas con las preguntas que me hicieron.
			// Opcional (NULL = sin etapas) para no requerir backfill en filas existentes.
			interviewStages: field.json().optional(),
			createdAt: field.temporal.createdAtString(),
			updatedAt: field.temporal.updatedAtString(),
		},
	});

	return {
		models: {
			MasterProfile,
			JobApplication,
		},
	};
});
