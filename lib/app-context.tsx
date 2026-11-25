"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { addDays, newId } from "@/lib/followups";
import {
	type CvAnalysis,
	emptyProfile,
	type JobApplication,
	type JobStatus,
	type MasterProfile,
} from "@/lib/types";

// Estado de cliente de JustWork: tu perfil maestro y tus postulaciones.
// PostgreSQL es la fuente de verdad; localStorage es una caché para cargar al
// instante y no perder cambios si la red falla. Las mutaciones son optimistas.

/** Perfil tal como lo devuelve la API (incluye el último análisis del CV). */
export type Profile = MasterProfile & {
	cvAnalysis?: CvAnalysis;
	cvAnalyzedAt?: string;
};

interface AppContextType {
	profile: Profile;
	hasProfile: boolean;
	/** Guarda cambios del perfil. `silent` evita el toast (autoguardado). */
	updateProfile: (
		updated: Partial<MasterProfile>,
		opts?: { silent?: boolean },
	) => Promise<void>;
	applications: JobApplication[];
	/** Crea una postulación y devuelve la versión guardada (con su id real). */
	addApplication: (
		job: Omit<JobApplication, "id">,
	) => Promise<JobApplication | null>;
	updateApplication: (
		id: string,
		updated: Partial<JobApplication>,
	) => Promise<void>;
	deleteApplication: (id: string) => Promise<void>;
	updateStatus: (id: string, status: JobStatus) => Promise<void>;
	/** Vuelve a leer todo desde la base (p. ej. tras importar el CV). */
	reload: () => Promise<void>;
	isLoadingDb: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROFILE_KEY = "justwork_master_profile";
const APPS_KEY = "justwork_applications";

function readCache<T>(key: string, fallback: T): T {
	try {
		const saved = localStorage.getItem(key);
		return saved ? (JSON.parse(saved) as T) : fallback;
	} catch {
		return fallback;
	}
}

function writeCache(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// localStorage puede no estar disponible (modo privado, cuota, etc.).
	}
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	const data = await res.json().catch(() => ({}));
	if (res.status === 401) {
		window.location.href = "/login";
	}
	if (!res.ok) {
		const error = new Error(data?.error ?? `Error ${res.status}`);
		Object.assign(error, { data, status: res.status });
		throw error;
	}
	return data as T;
}

export const today = () => new Date().toISOString().split("T")[0];

const isComplete = (p: Profile) => Boolean(p.fullName || p.summary);

export function AppProvider({ children }: { children: ReactNode }) {
	const [profile, setProfile] = useState<Profile>(emptyProfile);
	const [applications, setApplications] = useState<JobApplication[]>([]);
	const [isLoadingDb, setIsLoadingDb] = useState(true);
	const profileRef = useRef(profile);
	profileRef.current = profile;
	const appsRef = useRef(applications);
	appsRef.current = applications;

	const reload = useCallback(async () => {
		const [profileRes, appsRes] = await Promise.allSettled([
			api<{ profile: Profile | null }>("/api/profile"),
			api<{ applications: JobApplication[] }>("/api/applications"),
		]);
		if (profileRes.status === "fulfilled") {
			setProfile(profileRes.value.profile ?? emptyProfile);
		}
		if (appsRes.status === "fulfilled") {
			setApplications(appsRes.value.applications);
		}
		if (profileRes.status === "rejected" || appsRes.status === "rejected") {
			toast.error("No se pudo sincronizar con la base; usando la caché local.");
		}
	}, []);

	// Carga inicial: primero la caché local (instantánea), luego PostgreSQL.
	useEffect(() => {
		setProfile(readCache(PROFILE_KEY, emptyProfile));
		setApplications(readCache<JobApplication[]>(APPS_KEY, []));
		reload().finally(() => setIsLoadingDb(false));
	}, [reload]);

	useEffect(() => writeCache(PROFILE_KEY, profile), [profile]);
	useEffect(() => writeCache(APPS_KEY, applications), [applications]);

	const updateProfile = useCallback<AppContextType["updateProfile"]>(
		async (updated, opts) => {
			const next = { ...profileRef.current, ...updated };
			setProfile(next);
			try {
				await api<{ profile: MasterProfile }>("/api/profile", {
					method: "PUT",
					body: JSON.stringify(next),
				});
				if (!opts?.silent) toast.success("CV maestro guardado");
			} catch (err) {
				console.error("Error al guardar el perfil:", err);
				toast.error("No se pudo guardar en la base (quedó en caché local).");
			}
		},
		[],
	);

	const addApplication = useCallback<AppContextType["addApplication"]>(
		async (job) => {
			const tempId = `tmp-${Date.now()}`;
			setApplications((prev) => [{ ...job, id: tempId }, ...prev]);
			try {
				const data = await api<{ application: JobApplication }>(
					"/api/applications",
					{ method: "POST", body: JSON.stringify(job) },
				);
				setApplications((prev) =>
					prev.map((a) => (a.id === tempId ? data.application : a)),
				);
				toast.success(`Vacante guardada: ${job.title}`);
				return data.application;
			} catch (err) {
				console.error("Error al guardar la vacante:", err);
				setApplications((prev) => prev.filter((a) => a.id !== tempId));
				toast.error("No se pudo guardar la vacante.");
				return null;
			}
		},
		[],
	);

	const updateApplication = useCallback<AppContextType["updateApplication"]>(
		async (id, updated) => {
			setApplications((prev) =>
				prev.map((app) => (app.id === id ? { ...app, ...updated } : app)),
			);
			if (id.startsWith("tmp-")) return;
			try {
				// JSON.stringify descarta `undefined`; lo enviamos como null para
				// que borrar un campo (p. ej. una fecha) también llegue a la base.
				const body = Object.fromEntries(
					Object.entries(updated).map(([k, v]) => [k, v ?? null]),
				);
				await api(`/api/applications/${id}`, {
					method: "PATCH",
					body: JSON.stringify(body),
				});
			} catch (err) {
				console.error("Error al actualizar la postulación:", err);
				toast.error("No se pudo guardar el cambio en la base.");
			}
		},
		[],
	);

	const deleteApplication = useCallback<AppContextType["deleteApplication"]>(
		async (id) => {
			setApplications((prev) => prev.filter((app) => app.id !== id));
			toast.info("Postulación eliminada");
			try {
				await api(`/api/applications/${id}`, { method: "DELETE" });
			} catch (err) {
				console.error("Error al eliminar la postulación:", err);
			}
		},
		[],
	);

	const updateStatus = useCallback<AppContextType["updateStatus"]>(
		async (id, status) => {
			const updates: Partial<JobApplication> = { status };
			const current = appsRef.current.find((a) => a.id === id);
			// Al pasar a "Postulado" se registra la fecha del día y se agenda
			// un seguimiento a 7 días si no había uno.
			if (status === "applied" && current) {
				if (!current.dateApplied) updates.dateApplied = today();
				if (!current.nextActionAt) {
					updates.nextAction = current.nextAction || "Hacer seguimiento";
					updates.nextActionAt = addDays(7);
				}
			}
			// Al pasar a "En entrevista" se crea la primera etapa del proceso.
			if (
				status === "interviewing" &&
				current &&
				!current.interviewStages?.length
			) {
				updates.interviewStages = [
					{
						id: newId(),
						name: "Entrevista inicial",
						type: "screening",
						status: "pending",
						questions: [],
					},
				];
			}
			await updateApplication(id, updates);
		},
		[updateApplication],
	);

	const value = useMemo<AppContextType>(
		() => ({
			profile,
			hasProfile: isComplete(profile),
			updateProfile,
			applications,
			addApplication,
			updateApplication,
			deleteApplication,
			updateStatus,
			reload,
			isLoadingDb,
		}),
		[
			profile,
			updateProfile,
			applications,
			addApplication,
			updateApplication,
			deleteApplication,
			updateStatus,
			reload,
			isLoadingDb,
		],
	);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useApp debe usarse dentro de <AppProvider>");
	}
	return context;
}
