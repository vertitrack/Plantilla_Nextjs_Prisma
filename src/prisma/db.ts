import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };
import { databaseUrl } from "./database-url";

function createDb() {
	const url = databaseUrl();
	if (!url) {
		throw new Error(
			"DATABASE_URL no está definida. Copia .env.example a .env y levanta la base con `docker compose up -d`.",
		);
	}
	return postgres<Contract>({ contractJson, url });
}

type Db = ReturnType<typeof createDb>;

// En desarrollo, Next.js recarga los módulos en cada cambio (HMR). Guardamos el
// cliente en globalThis para no abrir un pool de conexiones nuevo cada vez, y lo
// recreamos cuando cambia el contrato (p. ej. tras `prisma contract emit`).
const contractHash = contractJson.storage.storageHash;
const globalForDb = globalThis as unknown as {
	__db?: { hash: string; client: Db };
};

function getDb(): Db {
	const cached = globalForDb.__db;
	if (cached?.hash === contractHash) return cached.client;
	// Cerramos el pool del contrato anterior (sin bloquear ni fallar si no se puede).
	cached?.client?.close?.().catch(() => {});
	const client = createDb();
	if (process.env.NODE_ENV !== "production") {
		globalForDb.__db = { hash: contractHash, client };
	}
	return client;
}

export const db: Db = getDb();
