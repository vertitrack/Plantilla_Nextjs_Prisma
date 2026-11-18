"use client";

import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import { initialApplications, initialMasterProfile } from "@/lib/seed-data";
import type {
	AppView,
	JobApplication,
	JobStatus,
	MasterProfile,
} from "@/lib/types";

// Estado de cliente de JustWork: perfil, postulaciones y navegación.
// Las mutaciones son optimistas: se actualiza la UI y luego se persiste vía /api.

type ToastType = "success" | "error" | "info";

interface AppContextType {
	profile: MasterProfile;
	setProfile: Dispatch<SetStateAction<MasterProfile>>;
	updateProfile: (updated: Partial<MasterProfile>) => Promise<void>;
	applications: JobApplication[];
	addApplication: (job: JobApplication) => Promise<void>;
	updateApplication: (
		id: string,
		updated: Partial<JobApplication>,
	) => Promise<void>;
	deleteApplication: (id: string) => Promise<void>;
	updateStatus: (id: string, status: JobStatus) => Promise<void>;
	activeView: AppView;
	setActiveView: (view: AppView) => void;
	selectedJobId: string | null;
	setSelectedJobId: (id: string | null) => void;
	viewJobDetail: (id: string) => void;
	resetToSampleData: () => Promise<void>;
	showToast: (message: string, type?: ToastType) => void;
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

function showToast(message: string, type: ToastType = "success") {
	toast[type](message);
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(data?.error ?? `Error ${res.status}`);
	}
	return data as T;
}

const today = () => new Date().toISOString().split("T")[0];

export function AppProvider({ children }: { children: ReactNode }) {
	const [profile, setProfile] = useState<MasterProfile>(initialMasterProfile);
	const [applications, setApplications] =
		useState<JobApplication[]>(initialApplications);
	const [activeView, setActiveView] = useState<AppView>("kanban");
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
	const [isLoadingDb, setIsLoadingDb] = useState(true);

	// Carga inicial: primero la caché local (instantánea), luego PostgreSQL.
	useEffect(() => {
		let mounted = true;
		setProfile(readCache(PROFILE_KEY, initialMasterProfile));
		setApplications(readCache(APPS_KEY, initialApplications));

		Promise.allSettled([
			api<{ profile: MasterProfile }>("/api/profile"),
			api<{ applications: JobApplication[] }>("/api/applications"),
		])
			.then(([profileRes, appsRes]) => {
				if (!mounted) return;
				if (profileRes.status === "fulfilled") {
					setProfile(profileRes.value.profile);
				}
				if (appsRes.status === "fulfilled") {
					const apps = appsRes.value.applications;
					setApplications(apps);
					setSelectedJobId(apps[0]?.id ?? null);
				}
				if (profileRes.status === "rejected" || appsRes.status === "rejected") {
					console.warn("No se pudo sincronizar con PostgreSQL; usando caché.");
				}
			})
			.finally(() => mounted && setIsLoadingDb(false));

		return () => {
			mounted = false;
		};
	}, []);

	// Respaldo en localStorage.
	useEffect(() => writeCache(PROFILE_KEY, profile), [profile]);
	useEffect(() => writeCache(APPS_KEY, applications), [applications]);

	const updateProfile = useCallback(
		async (updated: Partial<MasterProfile>) => {
			const next = { ...profile, ...updated };
			setProfile(next);
			try {
				const data = await api<{ profile: MasterProfile }>("/api/profile", {
					method: "PUT",
					body: JSON.stringify(next),
				});
				setProfile(data.profile);
				showToast("Perfil maestro guardado en PostgreSQL");
			} catch (err) {
				console.error("Error al guardar el perfil:", err);
				showToast("Perfil actualizado localmente", "info");
			}
		},
		[profile],
	);

	const addApplication = useCallback(async (job: JobApplication) => {
		setApplications((prev) => [job, ...prev]);
		try {
			const data = await api<{ application: JobApplication }>(
				"/api/applications",
				{ method: "POST", body: JSON.stringify(job) },
			);
			// Reemplaza el id temporal por el definitivo de la base.
			setApplications((prev) =>
				prev.map((a) => (a.id === job.id ? data.application : a)),
			);
			setSelectedJobId((cur) => (cur === job.id ? data.application.id : cur));
			showToast(`Vacante guardada en PostgreSQL: ${job.title}`);
		} catch (err) {
			console.error("Error al guardar la vacante:", err);
			showToast(`Vacante guardada localmente: ${job.title}`, "info");
		}
	}, []);

	const updateApplication = useCallback(
		async (id: string, updated: Partial<JobApplication>) => {
			setApplications((prev) =>
				prev.map((app) => (app.id === id ? { ...app, ...updated } : app)),
			);
			try {
				await api(`/api/applications/${id}`, {
					method: "PATCH",
					body: JSON.stringify(updated),
				});
			} catch (err) {
				console.error("Error al actualizar la postulación:", err);
			}
		},
		[],
	);

	const deleteApplication = useCallback(
		async (id: string) => {
			setApplications((prev) => prev.filter((app) => app.id !== id));
			showToast("Postulación eliminada del tablero", "info");
			if (selectedJobId === id) {
				setSelectedJobId(null);
				setActiveView("kanban");
			}
			try {
				await api(`/api/applications/${id}`, { method: "DELETE" });
			} catch (err) {
				console.error("Error al eliminar la postulación:", err);
			}
		},
		[selectedJobId],
	);

	const updateStatus = useCallback(
		async (id: string, status: JobStatus) => {
			const updates: Partial<JobApplication> = { status };
			const current = applications.find((a) => a.id === id);
			if (status === "applied" && current && !current.dateApplied) {
				updates.dateApplied = today();
			}
			await updateApplication(id, updates);
			showToast("Estado actualizado");
		},
		[applications, updateApplication],
	);

	const viewJobDetail = useCallback((id: string) => {
		setSelectedJobId(id);
		setActiveView("detail");
	}, []);

	const resetToSampleData = useCallback(async () => {
		try {
			const data = await api<{
				profile: MasterProfile;
				applications: JobApplication[];
			}>("/api/profile/reset", { method: "POST" });
			setProfile(data.profile);
			setApplications(data.applications);
			setSelectedJobId(data.applications[0]?.id ?? null);
			showToast("Datos de demostración restaurados en PostgreSQL");
		} catch (err) {
			console.error("Error al restaurar datos:", err);
			setProfile(initialMasterProfile);
			setApplications(initialApplications);
			setSelectedJobId(initialApplications[0]?.id ?? null);
			showToast("Datos de demostración restaurados localmente", "info");
		}
		setActiveView("kanban");
	}, []);

	const value = useMemo<AppContextType>(
		() => ({
			profile,
			setProfile,
			updateProfile,
			applications,
			addApplication,
			updateApplication,
			deleteApplication,
			updateStatus,
			activeView,
			setActiveView,
			selectedJobId,
			setSelectedJobId,
			viewJobDetail,
			resetToSampleData,
			showToast,
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
			activeView,
			selectedJobId,
			viewJobDetail,
			resetToSampleData,
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
