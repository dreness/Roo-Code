import { eq, desc, and, sql, isNotNull, gte, lte } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import { causalityInvestigations, investigationCandidates, investigationEvidence, bugCausality } from "../schema"

// ============================================================================
// Types
// ============================================================================

export interface DateFilter {
	since?: Date
	until?: Date
}

export interface InvestigationExportData {
	investigations: InvestigationExportRecord[]
	causalityRecords: CausalityExportRecord[]
	summary: ExportSummary
}

export interface InvestigationExportRecord {
	id: number
	bugFixSha: string
	bugFixShortSha: string
	bugFixMessage: string | null
	investigator: string
	startedAt: Date
	completedAt: Date | null
	conclusionType: string | null
	finalCauseSha: string | null
	confidenceOverride: number | null
	summary: string | null
	candidates: CandidateExportRecord[]
	evidence: EvidenceExportRecord[]
}

export interface CandidateExportRecord {
	candidateSha: string
	candidateShortSha: string
	candidateMessage: string | null
	verdict: string
	rejectionReason: string | null
	reasoning: string | null
	orderExamined: number | null
}

export interface EvidenceExportRecord {
	evidenceType: string
	filePath: string | null
	contentPreview: string | null
	capturedAt: Date
}

export interface CausalityExportRecord {
	id: number
	bugFixSha: string
	bugFixShortSha: string
	causeSha: string
	causeShortSha: string
	relationshipType: string
	confidence: number
	bugAge: number | null
	bugAgeCommits: number | null
	analysisMethod: string | null
	humanVerified: boolean | null
	humanConfidence: number | null
	automationWasCorrect: boolean | null
	investigationId: number | null
}

export interface ExportSummary {
	totalInvestigations: number
	completedInvestigations: number
	totalCausalityRecords: number
	humanVerifiedRecords: number
	exportedAt: Date
}

export interface ConfidenceCalibrationBin {
	binStart: number
	binEnd: number
	label: string
	count: number
	avgAutomatedConfidence: number
	avgHumanConfidence: number
	delta: number
	correctCount: number
	incorrectCount: number
	accuracyRate: number
}

export interface ConfidenceCalibrationData {
	bins: ConfidenceCalibrationBin[]
	overall: {
		totalSamples: number
		avgAutomatedConfidence: number
		avgHumanConfidence: number
		avgDelta: number
		overallAccuracy: number
		calibrationScore: number // Lower is better - measures how well confidence matches accuracy
	}
	insights: string[]
}

export interface RejectionReasonData {
	reason: string
	count: number
	percentage: number
	examples: RejectionExample[]
}

export interface RejectionExample {
	investigationId: number
	bugFixSha: string
	candidateSha: string
	candidateMessage: string | null
	reasoning: string | null
}

export interface RejectionReasonAnalysis {
	reasons: RejectionReasonData[]
	totalRejections: number
	topKeywords: KeywordFrequency[]
	suggestions: string[]
}

export interface KeywordFrequency {
	keyword: string
	count: number
	percentage: number
}

export interface VerificationMetrics {
	overall: {
		totalCausalityRecords: number
		humanVerifiedCount: number
		verificationRate: number
		correctCount: number
		incorrectCount: number
		accuracyRate: number
	}
	byMethod: MethodMetrics[]
	byRelationshipType: RelationshipMetrics[]
	trends: TrendData[]
}

export interface MethodMetrics {
	method: string
	count: number
	verifiedCount: number
	correctCount: number
	accuracyRate: number
	avgConfidence: number
	avgHumanConfidence: number | null
}

export interface RelationshipMetrics {
	relationshipType: string
	count: number
	verifiedCount: number
	correctCount: number
	accuracyRate: number
}

export interface TrendData {
	period: string
	investigationCount: number
	accuracyRate: number
	avgConfidenceDelta: number
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Gets comprehensive investigation data for export.
 * Includes investigations, candidates, evidence, and causality records with feedback.
 */
export async function getInvestigationDataExport(
	filters?: DateFilter,
	db: DatabaseOrTransaction = getDb(),
): Promise<InvestigationExportData> {
	// Build date conditions for investigations
	const investigationConditions: ReturnType<typeof gte | typeof lte>[] = []
	if (filters?.since) {
		investigationConditions.push(gte(causalityInvestigations.startedAt, filters.since))
	}
	if (filters?.until) {
		investigationConditions.push(lte(causalityInvestigations.startedAt, filters.until))
	}

	// Get all investigations with their related data
	const investigationRows = await db.query.causalityInvestigations.findMany({
		where: investigationConditions.length > 0 ? and(...investigationConditions) : undefined,
		with: {
			bugFix: true,
			candidates: {
				with: {
					candidate: true,
				},
				orderBy: desc(investigationCandidates.orderExamined),
			},
			evidence: {
				orderBy: desc(investigationEvidence.capturedAt),
			},
		},
		orderBy: desc(causalityInvestigations.startedAt),
	})

	// Transform to export format
	const investigations: InvestigationExportRecord[] = investigationRows.map((inv) => ({
		id: inv.id,
		bugFixSha: inv.bugFixSha,
		bugFixShortSha: inv.bugFix?.shortSha ?? inv.bugFixSha.slice(0, 7),
		bugFixMessage: inv.bugFix?.message ?? null,
		investigator: inv.investigator,
		startedAt: inv.startedAt,
		completedAt: inv.completedAt,
		conclusionType: inv.conclusionType,
		finalCauseSha: inv.finalCauseSha,
		confidenceOverride: inv.confidenceOverride,
		summary: inv.summary,
		candidates: inv.candidates.map((c) => ({
			candidateSha: c.candidateSha,
			candidateShortSha: c.candidate?.shortSha ?? c.candidateSha.slice(0, 7),
			candidateMessage: c.candidate?.message ?? null,
			verdict: c.verdict,
			rejectionReason: c.rejectionReason,
			reasoning: c.reasoning,
			orderExamined: c.orderExamined,
		})),
		evidence: inv.evidence.map((e) => ({
			evidenceType: e.evidenceType,
			filePath: e.filePath,
			contentPreview: e.contentPreview,
			capturedAt: e.capturedAt,
		})),
	}))

	// Build date conditions for causality records
	const causalityConditions: ReturnType<typeof eq | typeof gte | typeof lte>[] = [
		eq(bugCausality.humanVerified, true),
	]
	if (filters?.since) {
		causalityConditions.push(gte(bugCausality.createdAt, filters.since))
	}
	if (filters?.until) {
		causalityConditions.push(lte(bugCausality.createdAt, filters.until))
	}

	// Get all human-verified causality records
	const causalityRows = await db.query.bugCausality.findMany({
		where: and(...causalityConditions),
		with: {
			bugFix: true,
			cause: true,
		},
		orderBy: desc(bugCausality.createdAt),
	})

	const causalityRecords: CausalityExportRecord[] = causalityRows.map((c) => ({
		id: c.id,
		bugFixSha: c.bugFixSha,
		bugFixShortSha: c.bugFix?.shortSha ?? c.bugFixSha.slice(0, 7),
		causeSha: c.causeSha,
		causeShortSha: c.cause?.shortSha ?? c.causeSha.slice(0, 7),
		relationshipType: c.relationshipType,
		confidence: c.confidence,
		bugAge: c.bugAge,
		bugAgeCommits: c.bugAgeCommits,
		analysisMethod: c.analysisMethod,
		humanVerified: c.humanVerified,
		humanConfidence: c.humanConfidence,
		automationWasCorrect: c.automationWasCorrect,
		investigationId: c.investigationId,
	}))

	// Build summary
	const summary: ExportSummary = {
		totalInvestigations: investigations.length,
		completedInvestigations: investigations.filter((i) => i.completedAt !== null).length,
		totalCausalityRecords: causalityRecords.length,
		humanVerifiedRecords: causalityRecords.filter((c) => c.humanVerified).length,
		exportedAt: new Date(),
	}

	return {
		investigations,
		causalityRecords,
		summary,
	}
}

// ============================================================================
// Calibration Functions
// ============================================================================

/**
 * Gets confidence calibration data binned by automated confidence level.
 * Compares automated confidence vs human confidence and accuracy.
 */
export async function getConfidenceCalibration(
	filters?: DateFilter,
	db: DatabaseOrTransaction = getDb(),
): Promise<ConfidenceCalibrationData> {
	// Build conditions
	const conditions: ReturnType<typeof eq | typeof gte | typeof lte | typeof isNotNull>[] = [
		eq(bugCausality.humanVerified, true),
		isNotNull(bugCausality.humanConfidence),
	]
	if (filters?.since) {
		conditions.push(gte(bugCausality.createdAt, filters.since))
	}
	if (filters?.until) {
		conditions.push(lte(bugCausality.createdAt, filters.until))
	}

	const whereClause = and(...conditions)

	// Get all verified records with both confidence values
	const records = await db
		.select({
			confidence: bugCausality.confidence,
			humanConfidence: bugCausality.humanConfidence,
			automationWasCorrect: bugCausality.automationWasCorrect,
		})
		.from(bugCausality)
		.where(whereClause)

	// Define bins (0-20%, 20-40%, etc.)
	const binBoundaries = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
	const bins: ConfidenceCalibrationBin[] = []

	for (let i = 0; i < binBoundaries.length - 1; i++) {
		const binStart = binBoundaries[i]!
		const binEnd = binBoundaries[i + 1]!
		const label = `${(binStart * 100).toFixed(0)}-${(binEnd * 100).toFixed(0)}%`

		// Filter records in this bin
		const binRecords = records.filter(
			(r) =>
				r.confidence >= binStart &&
				(i === binBoundaries.length - 2 ? r.confidence <= binEnd : r.confidence < binEnd),
		)

		const count = binRecords.length
		const correctCount = binRecords.filter((r) => r.automationWasCorrect === true).length
		const incorrectCount = binRecords.filter((r) => r.automationWasCorrect === false).length

		const avgAutomatedConfidence = count > 0 ? binRecords.reduce((sum, r) => sum + r.confidence, 0) / count : 0

		const avgHumanConfidence =
			count > 0 ? binRecords.reduce((sum, r) => sum + (r.humanConfidence ?? 0), 0) / count : 0

		bins.push({
			binStart,
			binEnd,
			label,
			count,
			avgAutomatedConfidence,
			avgHumanConfidence,
			delta: avgHumanConfidence - avgAutomatedConfidence,
			correctCount,
			incorrectCount,
			accuracyRate: count > 0 ? correctCount / count : 0,
		})
	}

	// Calculate overall metrics
	const totalSamples = records.length
	const avgAutomatedConfidence =
		totalSamples > 0 ? records.reduce((sum, r) => sum + r.confidence, 0) / totalSamples : 0
	const avgHumanConfidence =
		totalSamples > 0 ? records.reduce((sum, r) => sum + (r.humanConfidence ?? 0), 0) / totalSamples : 0
	const totalCorrect = records.filter((r) => r.automationWasCorrect === true).length

	// Calculate calibration score (Expected Calibration Error)
	// This measures how well confidence predicts accuracy
	let calibrationScore = 0
	for (const bin of bins) {
		if (bin.count > 0) {
			const expectedAccuracy = bin.avgAutomatedConfidence
			const actualAccuracy = bin.accuracyRate
			calibrationScore += (bin.count / totalSamples) * Math.abs(actualAccuracy - expectedAccuracy)
		}
	}

	// Generate insights
	const insights: string[] = []

	// Check for overconfidence
	const overconfidentBins = bins.filter((b) => b.count >= 3 && b.avgAutomatedConfidence > b.accuracyRate + 0.15)
	if (overconfidentBins.length > 0) {
		const ranges = overconfidentBins.map((b) => b.label).join(", ")
		insights.push(`⚠️ Overconfident in ranges: ${ranges}. Automation confidence exceeds actual accuracy.`)
	}

	// Check for underconfidence
	const underconfidentBins = bins.filter((b) => b.count >= 3 && b.avgAutomatedConfidence < b.accuracyRate - 0.15)
	if (underconfidentBins.length > 0) {
		const ranges = underconfidentBins.map((b) => b.label).join(", ")
		insights.push(`📈 Underconfident in ranges: ${ranges}. Consider increasing confidence thresholds.`)
	}

	// Check for significant human-automated delta
	const highDeltaBins = bins.filter((b) => b.count >= 3 && Math.abs(b.delta) > 0.2)
	if (highDeltaBins.length > 0) {
		insights.push(`📊 Significant human-automated confidence gap detected in ${highDeltaBins.length} bin(s).`)
	}

	// Overall calibration assessment
	if (calibrationScore < 0.1) {
		insights.push("✅ Good calibration: confidence aligns well with accuracy.")
	} else if (calibrationScore < 0.2) {
		insights.push("⚡ Moderate calibration: some room for improvement.")
	} else {
		insights.push("❌ Poor calibration: significant mismatch between confidence and accuracy.")
	}

	if (totalSamples < 10) {
		insights.push("⚠️ Limited data: need more human-verified samples for reliable calibration.")
	}

	return {
		bins,
		overall: {
			totalSamples,
			avgAutomatedConfidence,
			avgHumanConfidence,
			avgDelta: avgHumanConfidence - avgAutomatedConfidence,
			overallAccuracy: totalSamples > 0 ? totalCorrect / totalSamples : 0,
			calibrationScore,
		},
		insights,
	}
}

// ============================================================================
// Rejection Reason Analysis Functions
// ============================================================================

/**
 * Analyzes rejection reasons from investigation candidates to find common patterns.
 */
export async function getRejectionReasons(
	filters?: DateFilter,
	db: DatabaseOrTransaction = getDb(),
): Promise<RejectionReasonAnalysis> {
	// Build conditions for investigations
	const investigationConditions: ReturnType<typeof gte | typeof lte>[] = []
	if (filters?.since) {
		investigationConditions.push(gte(causalityInvestigations.startedAt, filters.since))
	}
	if (filters?.until) {
		investigationConditions.push(lte(causalityInvestigations.startedAt, filters.until))
	}

	// Get investigation IDs matching the filter
	let investigationIds: number[] = []
	if (investigationConditions.length > 0) {
		const investigations = await db
			.select({ id: causalityInvestigations.id })
			.from(causalityInvestigations)
			.where(and(...investigationConditions))
		investigationIds = investigations.map((i) => i.id)
	}

	// Get all ruled_out candidates with their rejection reasons
	// Note: "ruled_out" is the verdict used for rejected candidates in the schema

	// Note: We can't easily filter by investigation IDs in a single query with drizzle,
	// so we'll fetch all and filter in memory if needed
	const candidates = await db.query.investigationCandidates.findMany({
		where: eq(investigationCandidates.verdict, "ruled_out"),
		with: {
			investigation: {
				with: {
					bugFix: true,
				},
			},
			candidate: true,
		},
	})

	// Filter by investigation IDs if date filter was applied
	const filteredCandidates =
		investigationIds.length > 0
			? candidates.filter((c) => investigationIds.includes(c.investigationId))
			: candidates

	const totalRejections = filteredCandidates.length

	// Group by rejection reason
	const reasonCounts = new Map<string, typeof filteredCandidates>()

	for (const candidate of filteredCandidates) {
		const reason = candidate.rejectionReason || "No reason provided"
		const normalizedReason = normalizeRejectionReason(reason)

		if (!reasonCounts.has(normalizedReason)) {
			reasonCounts.set(normalizedReason, [])
		}
		reasonCounts.get(normalizedReason)!.push(candidate)
	}

	// Convert to array and sort by count
	const reasons: RejectionReasonData[] = Array.from(reasonCounts.entries())
		.map(([reason, candidates]) => ({
			reason,
			count: candidates.length,
			percentage: totalRejections > 0 ? (candidates.length / totalRejections) * 100 : 0,
			examples: candidates.slice(0, 3).map((c) => ({
				investigationId: c.investigationId,
				bugFixSha: c.investigation?.bugFixSha ?? "",
				candidateSha: c.candidateSha,
				candidateMessage: c.candidate?.message ?? null,
				reasoning: c.reasoning,
			})),
		}))
		.sort((a, b) => b.count - a.count)

	// Extract keywords from rejection reasons
	const keywordCounts = new Map<string, number>()
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"is",
		"was",
		"not",
		"this",
		"that",
		"to",
		"in",
		"for",
		"of",
		"with",
		"no",
	])

	for (const candidate of filteredCandidates) {
		const reason = candidate.rejectionReason || ""
		const words = reason
			.toLowerCase()
			.replace(/[^\w\s]/g, "")
			.split(/\s+/)
			.filter((w) => w.length > 3 && !stopWords.has(w))

		for (const word of words) {
			keywordCounts.set(word, (keywordCounts.get(word) ?? 0) + 1)
		}
	}

	const topKeywords: KeywordFrequency[] = Array.from(keywordCounts.entries())
		.map(([keyword, count]) => ({
			keyword,
			count,
			percentage: totalRejections > 0 ? (count / totalRejections) * 100 : 0,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10)

	// Generate suggestions based on patterns
	const suggestions: string[] = []

	if (reasons.some((r) => r.reason.includes("unrelated") && r.percentage > 20)) {
		suggestions.push(
			"High 'unrelated' rejection rate suggests file-overlap analysis may be too broad. Consider tightening semantic similarity thresholds.",
		)
	}

	if (reasons.some((r) => r.reason.includes("temporal") && r.percentage > 15)) {
		suggestions.push(
			"Temporal rejections indicate time-based analysis needs refinement. Review commit window parameters.",
		)
	}

	if (reasons.some((r) => r.reason.includes("refactor") && r.percentage > 10)) {
		suggestions.push(
			"Many rejections due to refactoring commits. Consider adding refactoring detection to filter candidates.",
		)
	}

	if (topKeywords.some((k) => k.keyword === "confidence" && k.percentage > 15)) {
		suggestions.push("Frequent mentions of 'confidence' in rejections. Review confidence scoring algorithm.")
	}

	if (totalRejections === 0) {
		suggestions.push("No rejection data available. Complete more investigations to generate insights.")
	}

	return {
		reasons,
		totalRejections,
		topKeywords,
		suggestions,
	}
}

/**
 * Normalizes rejection reasons by grouping similar patterns.
 */
function normalizeRejectionReason(reason: string): string {
	const lower = reason.toLowerCase()

	// Group common patterns
	if (lower.includes("unrelated") || lower.includes("not related") || lower.includes("no relation")) {
		return "Unrelated changes"
	}
	if (lower.includes("temporal") || lower.includes("too old") || lower.includes("time")) {
		return "Temporal mismatch"
	}
	if (lower.includes("refactor") || lower.includes("cleanup") || lower.includes("reorgan")) {
		return "Refactoring/cleanup"
	}
	if (lower.includes("test") && (lower.includes("only") || lower.includes("just"))) {
		return "Test-only changes"
	}
	if (lower.includes("documentation") || lower.includes("comment") || lower.includes("readme")) {
		return "Documentation changes"
	}
	if (lower.includes("different") && (lower.includes("file") || lower.includes("component"))) {
		return "Different file/component"
	}
	if (lower.includes("coincidental") || lower.includes("coincidence")) {
		return "Coincidental overlap"
	}
	if (lower.includes("confidence") || lower.includes("low probability")) {
		return "Low confidence"
	}

	// Return original if no pattern matches, but truncate if too long
	return reason.length > 50 ? reason.slice(0, 47) + "..." : reason
}

// ============================================================================
// Verification Metrics Functions
// ============================================================================

/**
 * Gets comprehensive verification metrics including overall stats, breakdown by method, and trends.
 */
export async function getVerificationMetrics(
	filters?: DateFilter,
	db: DatabaseOrTransaction = getDb(),
): Promise<VerificationMetrics> {
	// Build conditions
	const conditions: ReturnType<typeof gte | typeof lte>[] = []
	if (filters?.since) {
		conditions.push(gte(bugCausality.createdAt, filters.since))
	}
	if (filters?.until) {
		conditions.push(lte(bugCausality.createdAt, filters.until))
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined

	// Get overall metrics
	const totalResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(whereClause)

	const verifiedResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(
			whereClause ? and(whereClause, eq(bugCausality.humanVerified, true)) : eq(bugCausality.humanVerified, true),
		)

	const correctResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(
			whereClause
				? and(whereClause, eq(bugCausality.humanVerified, true), eq(bugCausality.automationWasCorrect, true))
				: and(eq(bugCausality.humanVerified, true), eq(bugCausality.automationWasCorrect, true)),
		)

	const incorrectResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(bugCausality)
		.where(
			whereClause
				? and(whereClause, eq(bugCausality.humanVerified, true), eq(bugCausality.automationWasCorrect, false))
				: and(eq(bugCausality.humanVerified, true), eq(bugCausality.automationWasCorrect, false)),
		)

	const total = totalResult[0]?.count ?? 0
	const verified = verifiedResult[0]?.count ?? 0
	const correct = correctResult[0]?.count ?? 0
	const incorrect = incorrectResult[0]?.count ?? 0

	// Get metrics by analysis method
	const methodResults = await db
		.select({
			method: bugCausality.analysisMethod,
			count: sql<number>`count(*)`,
			verifiedCount: sql<number>`sum(case when ${bugCausality.humanVerified} = 1 then 1 else 0 end)`,
			correctCount: sql<number>`sum(case when ${bugCausality.automationWasCorrect} = 1 then 1 else 0 end)`,
			avgConfidence: sql<number>`avg(${bugCausality.confidence})`,
			avgHumanConfidence: sql<number>`avg(case when ${bugCausality.humanConfidence} is not null then ${bugCausality.humanConfidence} end)`,
		})
		.from(bugCausality)
		.where(whereClause)
		.groupBy(bugCausality.analysisMethod)
		.orderBy(desc(sql`count(*)`))

	const byMethod: MethodMetrics[] = methodResults.map((r) => ({
		method: r.method || "unknown",
		count: r.count,
		verifiedCount: r.verifiedCount ?? 0,
		correctCount: r.correctCount ?? 0,
		accuracyRate: r.verifiedCount ? (r.correctCount ?? 0) / r.verifiedCount : 0,
		avgConfidence: r.avgConfidence ?? 0,
		avgHumanConfidence: r.avgHumanConfidence,
	}))

	// Get metrics by relationship type
	const relationshipResults = await db
		.select({
			relationshipType: bugCausality.relationshipType,
			count: sql<number>`count(*)`,
			verifiedCount: sql<number>`sum(case when ${bugCausality.humanVerified} = 1 then 1 else 0 end)`,
			correctCount: sql<number>`sum(case when ${bugCausality.automationWasCorrect} = 1 then 1 else 0 end)`,
		})
		.from(bugCausality)
		.where(whereClause)
		.groupBy(bugCausality.relationshipType)
		.orderBy(desc(sql`count(*)`))

	const byRelationshipType: RelationshipMetrics[] = relationshipResults.map((r) => ({
		relationshipType: r.relationshipType,
		count: r.count,
		verifiedCount: r.verifiedCount ?? 0,
		correctCount: r.correctCount ?? 0,
		accuracyRate: r.verifiedCount ? (r.correctCount ?? 0) / r.verifiedCount : 0,
	}))

	// Get trend data (by month)
	const trendResults = await db
		.select({
			period: sql<string>`strftime('%Y-%m', datetime(${causalityInvestigations.completedAt}, 'unixepoch'))`,
			investigationCount: sql<number>`count(*)`,
		})
		.from(causalityInvestigations)
		.where(
			filters?.since || filters?.until
				? and(
						...[
							filters?.since ? gte(causalityInvestigations.completedAt, filters.since) : undefined,
							filters?.until ? lte(causalityInvestigations.completedAt, filters.until) : undefined,
						].filter(Boolean),
					)
				: isNotNull(causalityInvestigations.completedAt),
		)
		.groupBy(sql`strftime('%Y-%m', datetime(${causalityInvestigations.completedAt}, 'unixepoch'))`)
		.orderBy(sql`strftime('%Y-%m', datetime(${causalityInvestigations.completedAt}, 'unixepoch'))`)

	const trends: TrendData[] = trendResults
		.filter((r) => r.period !== null)
		.map((r) => ({
			period: r.period,
			investigationCount: r.investigationCount,
			accuracyRate: 0, // Would need more complex query to calculate per-period accuracy
			avgConfidenceDelta: 0,
		}))

	return {
		overall: {
			totalCausalityRecords: total,
			humanVerifiedCount: verified,
			verificationRate: total > 0 ? verified / total : 0,
			correctCount: correct,
			incorrectCount: incorrect,
			accuracyRate: verified > 0 ? correct / verified : 0,
		},
		byMethod,
		byRelationshipType,
		trends,
	}
}
