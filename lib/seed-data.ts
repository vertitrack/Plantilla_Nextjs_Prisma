import type { JobApplication, MasterProfile } from "@/lib/types";

export const initialMasterProfile: MasterProfile = {
	fullName: "Samuel Pedreros",
	headline:
		"Senior Full Stack Software Engineer | React, TypeScript, Node.js & Cloud Architecture",
	email: "samuel@ejemplo.com",
	phone: "+56 9 8765 4321",
	location: "Santiago, Chile (Disponible Remoto Global)",
	portfolioUrl: "https://samuelpedreros.dev",
	linkedinUrl: "https://linkedin.com/in/samuel-pedreros",
	githubUrl: "https://github.com/samuel-pedreros",
	summary:
		"Ingeniero de software con más de 6 años de experiencia diseñando y construyendo aplicaciones web distribuidas, interfaces modernas de alto rendimiento y APIs escalables. Especializado en el ecosistema React/TypeScript, Node.js, arquitectura serverless y microservicios. Apasionado por la optimización de rendimiento frontend, diseño de sistemas limpios y la integración de modelos de inteligencia artificial en productos cotidianos.",
	skills: [
		{
			category: "Frontend & UI",
			items: [
				"React 19",
				"Next.js",
				"TypeScript",
				"Tailwind CSS",
				"Vite",
				"State Management (Zustand/Redux)",
				"WebSockets",
			],
		},
		{
			category: "Backend & APIs",
			items: [
				"Node.js",
				"Express",
				"NestJS",
				"Python / FastAPI",
				"RESTful APIs",
				"GraphQL",
				"Microservicios",
			],
		},
		{
			category: "Bases de Datos & Cloud",
			items: [
				"PostgreSQL",
				"MongoDB",
				"Redis",
				"Docker",
				"AWS (S3, Lambda, ECS)",
				"GCP Cloud Run",
				"CI/CD GitHub Actions",
			],
		},
		{
			category: "IA & Herramientas",
			items: [
				"Gemini API",
				"LangChain / RAG",
				"OpenAI API",
				"Embeddings",
				"Git",
				"Agile / Scrum",
			],
		},
	],
	experiences: [
		{
			id: "exp-1",
			company: "Fintech Nova Latam",
			role: "Senior Full Stack Engineer",
			period: "2023 - Presente",
			highlights: [
				"Lideré la modernización del panel de transacciones financieras a React 18 + Vite, reduciendo el tiempo de carga inicial en un 48% para más de 200,000 usuarios activos.",
				"Diseñé y desplegué microservicios en Node.js y PostgreSQL con colas Redis para procesamiento asíncrono de pagos, garantizando un uptime del 99.95%.",
				"Implementé un sistema de alertas en tiempo real vía WebSockets que redujo la tasa de carritos abandonados en checkout en un 14%.",
			],
			skillsUsed: [
				"React",
				"TypeScript",
				"Node.js",
				"PostgreSQL",
				"Redis",
				"Docker",
				"AWS",
			],
		},
		{
			id: "exp-2",
			company: "Digital Solutions Corp",
			role: "Full Stack Developer",
			period: "2020 - 2023",
			highlights: [
				"Desarrollé plataformas SaaS multi-inquilino basadas en React y Express consumiendo APIs RESTful y GraphQL.",
				"Automaticé pipelines de integración y despliegue continuo (CI/CD) con GitHub Actions reduciendo el ciclo de release semanal de 4 horas a 15 minutos.",
				"Mentoricé a 4 desarrolladores junior en buenas prácticas de TypeScript, pruebas unitarias con Vitest y accesibilidad web WCAG.",
			],
			skillsUsed: [
				"React",
				"JavaScript",
				"Express",
				"MongoDB",
				"Tailwind CSS",
				"Jest",
				"GitHub Actions",
			],
		},
		{
			id: "exp-3",
			company: "AppVentures Studio",
			role: "Frontend Developer",
			period: "2018 - 2020",
			highlights: [
				"Creé más de 12 landing pages y aplicaciones SPA con responsive design pixel-perfect y animaciones fluidas.",
				"Optimizé métricas de Core Web Vitals (LCP, FID, CLS) mejorando el posicionamiento SEO orgánico en un 35%.",
			],
			skillsUsed: [
				"JavaScript",
				"HTML5/CSS3",
				"Vue.js",
				"React",
				"Sass",
				"Webpack",
			],
		},
	],
	projects: [
		{
			id: "proj-1",
			name: "SmartDocs AI (RAG Assistant)",
			description:
				"Plataforma de búsqueda semántica y preguntas sobre documentos PDF corporativos utilizando modelos de lenguaje y base de datos vectorial.",
			highlights: [
				"Arquitectura RAG completa con chunking de texto inteligente y embeddings vectoriales.",
				"Interfaz interactiva con streaming de respuestas en tiempo real y citas a la página de origen.",
			],
			technologies: [
				"React",
				"TypeScript",
				"Node.js",
				"Gemini API",
				"PostgreSQL pgvector",
				"Tailwind CSS",
			],
		},
		{
			id: "proj-2",
			name: "OmniAnalytics Dashboard",
			description:
				"Panel de métricas SaaS de alta densidad con visualización de datos en tiempo real y exportación de reportes.",
			highlights: [
				"Renderizado optimizado de tablas de más de 50,000 filas con virtualización y filtros instantáneos.",
				"Soporte completo para temas claro/oscuro y diseño ultra-responsivo.",
			],
			technologies: [
				"React",
				"Next.js",
				"Tailwind CSS",
				"Chart.js",
				"TypeScript",
			],
		},
	],
	education: [
		{
			institution: "Universidad Técnica Federico Santa María",
			degree: "Ingeniería Civil en Informática / Ciencias de la Computación",
			year: "2014 - 2019",
		},
	],
	targetRoles: [
		"Senior Full Stack Engineer",
		"Senior Frontend Engineer (React/TypeScript)",
		"Tech Lead",
	],
	targetSalary: "$4,500 - $6,500 USD / mes (Remoto Internacional)",
};

export const initialApplications: JobApplication[] = [
	{
		id: "job-1",
		title: "Senior Frontend Engineer (React / TypeScript)",
		company: "Stripe Partners Global",
		location: "Remoto (América)",
		url: "https://careers.stripe.com/jobs/sr-frontend-global",
		sourceText:
			"Estamos buscando un Senior Frontend Engineer con dominio absoluto de React, TypeScript y arquitecturas de alto rendimiento. Trabajarás con nuestro equipo de infraestructura de pagos para crear flujos de cobro rápidos, seguros y accesibles para millones de comercios globales. Requisitos: 5+ años en frontend moderno, experiencia con TypeScript estricto, WebSockets, optimización de Core Web Vitals y diseño de sistemas.",
		salaryRange: "$5,500 - $7,000 USD / mes",
		workType: "remote",
		status: "interviewing",
		dateAdded: "2026-10-24",
		dateApplied: "2026-10-25",
		fitScore: 92,
		recommendation: "APPLY_STRONG",
		recommendationHeadline:
			"¡Postulación recomendada al 100%! Encaje perfecto en tu stack central y experiencia Fintech.",
		reasoning:
			"Tu experiencia en Fintech Nova Latam optimizando paneles de transacciones financieras y reduciendo latencia en un 48% es exactamente lo que busca Stripe. Además, dominas React 19, TypeScript y WebSockets.",
		matchingSkills: [
			"React",
			"TypeScript",
			"Arquitectura Fintech",
			"WebSockets",
			"Core Web Vitals",
			"Diseño de Sistemas UI",
		],
		missingSkills: ["Experiencia previa directa con el SDK de Stripe Checkout"],
		pros: [
			"Salario superior a tu banda objetivo ($5,500 - $7,000 USD)",
			"100% remoto con cultura de ingeniería de élite",
			"Impacto masivo en millones de usuarios finales",
		],
		cons: [
			"Proceso de entrevistas técnico exigente (4 rondas que incluyen live coding y system design frontend)",
		],
		interviewTips: [
			"Enfócate en tu logro del 48% de mejora de rendimiento en el panel de Fintech Nova.",
			"Explica cómo gestionas la consistencia de estado cuando hay eventos concurrentes por WebSockets.",
			"Menciona tu proyecto SmartDocs AI para demostrar tu capacidad de aprender e integrar APIs modernas.",
		],
		estimatedSeniority: "Senior",
		tailoredHeadline:
			"Senior Frontend Engineer | Especialista en React, TypeScript y Sistemas Financieros de Alto Rendimiento",
		tailoredSummary:
			"Ingeniero de Software Senior con más de 6 años liderando el desarrollo de interfaces financieras críticas en React y TypeScript. Con trayectoria probada reduciendo tiempos de carga en un 48% para 200k+ usuarios y diseñando flujos en tiempo real con WebSockets.",
		atsKeywordsIncluded: [
			"React",
			"TypeScript",
			"High Performance",
			"WebSockets",
			"Core Web Vitals",
			"Fintech Architecture",
		],
		keyPitchAngle:
			"Experiencia directa en escalabilidad de paneles de pago y transacciones financieras seguras en tiempo real.",
		qaPairs: [
			{
				question:
					"¿Por qué te interesa unirte a Stripe en lugar de otras fintechs?",
				answer:
					"Porque Stripe define el estándar de excelencia técnica en infraestructura de pagos mundial. En mi rol reciente en Fintech Nova, enfrenté desafíos complejos de consistencia y latencia en pagos; llevar ese rigor a la escala de Stripe donde cada milisegundo importa es el mayor reto al que puedo aspirar.",
				groundedIn:
					"Experiencia en Fintech Nova Latam y liderazgo en rendimiento de transacciones.",
				tips: "Destaca que valoras la documentación limpia y la Developer Experience de Stripe.",
			},
			{
				question:
					"Describe un problema complejo de rendimiento frontend que resolviste.",
				answer:
					"En Fintech Nova, el panel de monitoreo de transacciones se ralentizaba debido a renderizados masivos e innecesarios al recibir eventos de WebSockets. Implementé memoización estratégica, selectores derivados atómicos con Zustand y virtualización de listas para 50,000 registros, logrando reducir el First Contentful Paint en un 48% y manteniendo 60fps estables.",
				groundedIn: "Logro en Fintech Nova Latam y proyecto OmniAnalytics.",
				tips: "Menciona métricas exactas (48% y 60 FPS).",
			},
		],
		notes:
			"Ronda de screening con reclutadora superada el 26 de octubre. Entrevista técnica de System Design agendada para el lunes.",
	},
	{
		id: "job-2",
		title: "Full Stack Engineer (Node.js + React)",
		company: "Linear Ventures / SaaS",
		location: "Remoto Global",
		url: "https://linear.app/careers/fullstack",
		sourceText:
			"Buscamos un ingeniero Full Stack apasionado por la velocidad de la interfaz, diseño limpio y arquitecturas en la nube. Requisitos: experiencia con React, Node.js, PostgreSQL y despliegues serverless. Valoramos experiencia previa en herramientas de productividad o desarrolladores.",
		salaryRange: "$4,800 - $6,000 USD / mes",
		workType: "remote",
		status: "applied",
		dateAdded: "2026-10-27",
		dateApplied: "2026-10-28",
		fitScore: 88,
		recommendation: "APPLY_STRONG",
		recommendationHeadline:
			"Excelente encaje técnico con fuerte afinidad por la velocidad y la calidad de producto.",
		reasoning:
			"Cuentas con el balance exacto entre frontend moderno (React/Tailwind) y backend robusto (Node.js/PostgreSQL), sumado a proyectos personales de analítica y herramientas de productividad.",
		matchingSkills: [
			"React",
			"Node.js",
			"PostgreSQL",
			"TypeScript",
			"Tailwind CSS",
			"CI/CD",
		],
		missingSkills: [
			"Arquitectura local-first / CRDTs (ventaja deseable pero no excluyente)",
		],
		pros: [
			"Producto con excelente reputación de diseño e ingeniería",
			"Horarios flexibles y compensación en dólares",
		],
		cons: ["Alta competencia de candidatos internacionales"],
		interviewTips: [
			"Muestra cómo construyes interfaces con teclado rápido y micro-interacciones.",
		],
		estimatedSeniority: "Senior / Mid-Senior",
		qaPairs: [],
		notes:
			"CV adaptado enviado a través de su portal. Esperando respuesta en 3 a 5 días hábiles.",
	},
	{
		id: "job-3",
		title: "Senior Software Architect - HealthTech Cloud",
		company: "CarePulse Health",
		location: "Híbrido (Santiago / Remoto)",
		url: "https://carepulse.health/careers",
		sourceText:
			"Buscamos un arquitecto de software para liderar la integración de telemedicina y expedientes médicos electrónicos con estándares HIPAA y FHIR. Stack: React, Python, PostgreSQL, AWS.",
		salaryRange: "$6,000 - $7,500 USD / mes",
		workType: "hybrid",
		status: "offer",
		dateAdded: "2026-10-15",
		dateApplied: "2026-10-16",
		fitScore: 84,
		recommendation: "APPLY_STRONG",
		recommendationHeadline:
			"Oferta recibida tras 3 rondas técnicas satisfactorias.",
		reasoning:
			"El cliente valoró altamente el dominio de arquitecturas en la nube, seguridad en APIs de salud y liderazgo técnico.",
		matchingSkills: [
			"React",
			"Python",
			"PostgreSQL",
			"AWS",
			"Arquitectura de Software",
		],
		missingSkills: ["Certificación oficial HIPAA (se capacitará internamente)"],
		pros: [
			"Excelente paquete de beneficios y bono por desempeño anual",
			"Oferta formal extendida",
		],
		cons: ["Requiere acudir 1 día al mes a reuniones presenciales en Santiago"],
		interviewTips: [],
		estimatedSeniority: "Lead / Staff",
		qaPairs: [],
		notes:
			"¡Oferta formal de $6,500 USD recibida! Analizando antes de tomar decisión final frente a la entrevista de Stripe.",
	},
	{
		id: "job-4",
		title: "Staff Machine Learning Infrastructure Engineer",
		company: "DeepTensor Labs",
		location: "San Francisco, CA (Híbrido)",
		url: "https://deeptensor.ai/jobs/staff-mlops",
		sourceText:
			"Looking for a Staff MLOps Engineer to train multi-billion parameter models on distributed GPU clusters using PyTorch, Triton, CUDA, and Kubernetes. Must have 8+ years of deep CUDA optimization and Linux kernel hacking.",
		salaryRange: "$180,000 - $240,000 USD / año",
		workType: "onsite",
		status: "rejected",
		dateAdded: "2026-10-10",
		dateApplied: "2026-10-11",
		fitScore: 38,
		recommendation: "PASS",
		recommendationHeadline:
			"No recomendado: Vacante hiper-especializada en bajo nivel de GPU y MLOps duro.",
		reasoning:
			"La oferta exige 8+ años en programación CUDA y kernel Linux para clústeres masivos de GPU, lo cual se aleja de tu perfil de Full Stack / Frontend Engineer.",
		matchingSkills: [
			"Python",
			"Docker",
			"Gemini / AI integration de alto nivel",
		],
		missingSkills: [
			"C++",
			"CUDA",
			"Triton Server",
			"Linux Kernel Hacking",
			"Distributed GPU Training",
		],
		pros: ["Salario sumamente elevado"],
		cons: [
			"Presencial en San Francisco sin patrocinio de visa confirmado",
			"Desalineado con tu trayectoria en desarrollo de software web y producto",
		],
		interviewTips: [],
		estimatedSeniority: "Staff / Principal",
		qaPairs: [],
		notes:
			"Rechazo automático recibido a las 48h. Confirmación de la regla: enfocar el tiempo y postulaciones en roles con fit > 70% donde destaco fuertemente.",
		outcomeReason:
			"Falta de requisitos técnicos obligatorios en CUDA y MLOps de infraestructura profunda.",
	},
	{
		id: "job-5",
		title: "Lead Frontend Developer (React 19 & Next.js)",
		company: "Financiera Global Tech",
		location: "Remoto",
		url: "https://financiera.com/careers/lead-fe",
		sourceText:
			"Buscamos Lead Frontend Developer para liderar equipo de 6 ingenieros en la creación de una nueva plataforma de inversiones para clientes institucionales. Se requiere experiencia sólida en React moderno, TypeScript, optimización de bundles, testing automatizado y mentoría de equipos.",
		salaryRange: "$5,000 - $6,200 USD / mes",
		workType: "remote",
		status: "discovered",
		dateAdded: "2026-10-29",
		fitScore: 90,
		recommendation: "APPLY_STRONG",
		recommendationHeadline:
			"¡Alta recomendación! Encaja tanto en tu liderazgo técnico como en tu especialidad React/TypeScript.",
		reasoning:
			"Has liderado equipos, modernizado arquitecturas a React 18/19 y posees experiencia Fintech directa. Es una postulación con altísima probabilidad de avanzar a entrevista.",
		matchingSkills: [
			"React",
			"TypeScript",
			"Liderazgo Técnico",
			"Fintech",
			"Next.js",
			"Testing",
		],
		missingSkills: [
			"Arquitectura de micro-frontends Module Federation (fácil de argumentar)",
		],
		pros: [
			"Posición de liderazgo reconocida",
			"Salario competitivo",
			"Equipo en crecimiento",
		],
		cons: ["Mayor carga de reuniones de coordinación y gestión"],
		interviewTips: [
			"Resalta tu experiencia mentoreando a desarrolladores en Digital Solutions Corp.",
		],
		estimatedSeniority: "Lead",
		qaPairs: [],
		notes:
			"Vacante descubierta recientemente. Pendiente de generar CV adaptado y enviar postulación.",
	},
];
