import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import * as schema from "./schema"
import { existsSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

let db: ReturnType<typeof createClient> | null = null

function createClient(dbPath: string) {
	// Ensure directory exists
	const dir = dirname(dbPath)
	if (dir !== "." && !existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
	}

	const sqlite = new Database(dbPath)

	// Enable WAL mode for better concurrent access
	sqlite.pragma("journal_mode = WAL")

	const drizzleDb = drizzle(sqlite, { schema })

	// Run migrations to ensure schema is up to date
	const __dirname = dirname(fileURLToPath(import.meta.url))
	const migrationsFolder = join(__dirname, "migrations")

	try {
		migrate(drizzleDb, { migrationsFolder })
	} catch (err) {
		// Migrations may fail if already applied, which is fine
		const message = err instanceof Error ? err.message : String(err)
		if (!message.includes("already been applied")) {
			console.error("Migration error:", message)
		}
	}

	return drizzleDb
}

export function getDb(dbPath?: string): ReturnType<typeof createClient> {
	const path = dbPath || process.env.COMMIT_ANALYSIS_DB_PATH || "./commit-analysis.db"

	if (!db) {
		db = createClient(path)
	}

	return db
}

export function closeDb() {
	if (db) {
		;(db as { $client?: { close?: () => void } }).$client?.close?.()
		db = null
	}
}

export type DatabaseClient = ReturnType<typeof getDb>
export type DatabaseOrTransaction = DatabaseClient | Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0]
