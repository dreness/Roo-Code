import { eq, sql, and, lt } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import { analysisCache, type InsertAnalysisCache, type CacheType } from "../schema"
import { createHash } from "crypto"

const DEFAULT_CACHE_TTL_HOURS = 24 * 7 // 1 week

export function generateCacheKey(type: CacheType, ...args: string[]): string {
	return createHash("md5")
		.update([type, ...args].join(":"))
		.digest("hex")
}

export async function getCacheEntry(cacheKey: string, db: DatabaseOrTransaction = getDb()) {
	const entry = await db.query.analysisCache.findFirst({
		where: and(eq(analysisCache.cacheKey, cacheKey), sql`${analysisCache.expiresAt} > ${Date.now()}`),
	})

	return entry
}

export async function setCacheEntry(
	data: InsertAnalysisCache,
	ttlHours: number = DEFAULT_CACHE_TTL_HOURS,
	db: DatabaseOrTransaction = getDb(),
) {
	const now = new Date()
	const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000)

	const result = await db
		.insert(analysisCache)
		.values({
			...data,
			createdAt: now,
			expiresAt,
		})
		.onConflictDoUpdate({
			target: analysisCache.cacheKey,
			set: {
				resultSha: data.resultSha,
				resultData: data.resultData,
				createdAt: now,
				expiresAt,
			},
		})
		.returning()

	return result[0]
}

export async function getBlameCache(
	filePath: string,
	lineRange: string,
	commitRange: string,
	db: DatabaseOrTransaction = getDb(),
) {
	const cacheKey = generateCacheKey("blame", filePath, lineRange, commitRange)
	return getCacheEntry(cacheKey, db)
}

export async function setBlameCache(
	filePath: string,
	lineRange: string,
	commitRange: string,
	resultShas: string[],
	db: DatabaseOrTransaction = getDb(),
) {
	const cacheKey = generateCacheKey("blame", filePath, lineRange, commitRange)
	return setCacheEntry(
		{
			cacheKey,
			cacheType: "blame",
			filePath,
			lineRange,
			resultData: resultShas,
		},
		DEFAULT_CACHE_TTL_HOURS,
		db,
	)
}

export async function invalidateCacheForFile(filePath: string, db: DatabaseOrTransaction = getDb()) {
	return db.delete(analysisCache).where(eq(analysisCache.filePath, filePath))
}

export async function cleanupExpiredCache(db: DatabaseOrTransaction = getDb()) {
	const now = Date.now()
	return db.delete(analysisCache).where(lt(analysisCache.expiresAt, new Date(now)))
}

export async function getCacheStats(db: DatabaseOrTransaction = getDb()) {
	const total = await db.select({ count: sql<number>`count(*)` }).from(analysisCache)

	const byType = await db
		.select({
			cacheType: analysisCache.cacheType,
			count: sql<number>`count(*)`,
		})
		.from(analysisCache)
		.groupBy(analysisCache.cacheType)

	const expired = await db
		.select({ count: sql<number>`count(*)` })
		.from(analysisCache)
		.where(lt(analysisCache.expiresAt, new Date()))

	return {
		total: total[0]?.count ?? 0,
		expired: expired[0]?.count ?? 0,
		byType,
	}
}
