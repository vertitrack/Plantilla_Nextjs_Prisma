import "dotenv/config";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import { databaseUrl } from "./src/prisma/database-url";

export default definePrismaConfig({
	orm: ormConfig({
		contract: "./src/prisma/contract.ts",
		db: {
			connection: databaseUrl()!,
		},
	}),
});
