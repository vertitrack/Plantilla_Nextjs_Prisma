/**
 * URL de conexión a PostgreSQL. En local usa DATABASE_URL (.env); en Vercel,
 * si conectas un Prisma Postgres desde el panel, se inyectan POSTGRES_URL y
 * PRISMA_DATABASE_URL automáticamente, así que también se aceptan.
 */
export function databaseUrl(): string | undefined {
	return (
		process.env["DATABASE_URL"] ||
		process.env["POSTGRES_URL"] ||
		process.env["PRISMA_DATABASE_URL"] ||
		undefined
	);
}
