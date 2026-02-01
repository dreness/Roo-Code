import { defineConfig } from "drizzle-kit"

export default defineConfig({
	out: "./src/db/migrations",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.COMMIT_ANALYSIS_DB_PATH || "./commit-analysis.db",
	},
	verbose: true,
	strict: true,
})
