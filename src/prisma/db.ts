import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

function createDb() {
	const url = process.env["DATABASE_URL"];
	if (!url) {
		throw new Error(
			"DATABASE_URL no está definida. Copia .env.example a .env y levanta la base con `docker compose up -d`.",
		);
	}
	return postgres<Contract>({ contractJson, url });
}

type Db = ReturnType<typeof createDb>;

// En desarrollo, Next.js recarga los módulos en cada cambio (HMR). Guardamos el
// cliente en globalThis para no abrir un pool de conexiones nuevo cada vez.
const globalForDb = globalThis as unknown as { __db?: Db };

export const db: Db = globalForDb.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
	globalForDb.__db = db;
}
