import { eq, desc } from "drizzle-orm"
import type { DatabaseOrTransaction } from "../db"
import { getDb } from "../db"
import {
	causalityInvestigations,
	investigationCandidates,
	investigationEvidence,
	type CausalityInvestigation,
	type InvestigationCandidate,
	type InvestigationEvidence,
	type ConclusionType,
	type CandidateVerdict,
	type EvidenceType,
} from "../schema"

// ============================================================================
// Parameter Types
// ============================================================================

export interface CreateInvestigationParams {
	bugFixSha: string
	investigator: string
}

export interface CompleteInvestigationParams {
	investigationId: number
	conclusionType: ConclusionType
	finalCauseSha?: string
	confidenceOverride?: number
	summary?: string
}

export interface AddCandidateParams {
	investigationId: number
	candidateSha: string
	verdict: CandidateVerdict
	rejectionReason?: string
	reasoning?: string
	orderExamined?: number
}

export interface AddEvidenceParams {
	investigationId: number
	evidenceType: EvidenceType
	filePath?: string
	contentHash?: string
	contentPreview?: string
}

// ============================================================================
// Investigation Lifecycle Functions
// ============================================================================

/**
 * Creates a new investigation record for a bug fix commit.
 * @param params - The investigation parameters
 * @param db - Database or transaction instance
 * @returns The ID of the created investigation
 */
export async function createInvestigation(
	params: CreateInvestigationParams,
	db: DatabaseOrTransaction = getDb(),
): Promise<number> {
	const { bugFixSha, investigator } = params

	const result = await db
		.insert(causalityInvestigations)
		.values({
			bugFixSha,
			investigator,
			startedAt: new Date(),
		})
		.returning({ id: causalityInvestigations.id })

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to create investigation for bug fix ${bugFixSha}`)
	}

	return record.id
}

/**
 * Completes an investigation with conclusion details.
 * @param params - The completion parameters
 * @param db - Database or transaction instance
 * @returns The updated investigation record
 */
export async function completeInvestigation(
	params: CompleteInvestigationParams,
	db: DatabaseOrTransaction = getDb(),
): Promise<CausalityInvestigation> {
	const { investigationId, conclusionType, finalCauseSha, confidenceOverride, summary } = params

	const result = await db
		.update(causalityInvestigations)
		.set({
			completedAt: new Date(),
			conclusionType,
			finalCauseSha,
			confidenceOverride,
			summary,
		})
		.where(eq(causalityInvestigations.id, investigationId))
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to complete investigation with ID ${investigationId}`)
	}

	return record
}

// ============================================================================
// Candidate Management Functions
// ============================================================================

/**
 * Adds a candidate commit to an investigation.
 * @param params - The candidate parameters
 * @param db - Database or transaction instance
 * @returns The created candidate record
 */
export async function addCandidate(
	params: AddCandidateParams,
	db: DatabaseOrTransaction = getDb(),
): Promise<InvestigationCandidate> {
	const { investigationId, candidateSha, verdict, rejectionReason, reasoning, orderExamined } = params

	const result = await db
		.insert(investigationCandidates)
		.values({
			investigationId,
			candidateSha,
			verdict,
			rejectionReason,
			reasoning,
			orderExamined,
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to add candidate ${candidateSha} to investigation ${investigationId}`)
	}

	return record
}

// ============================================================================
// Evidence Management Functions
// ============================================================================

/**
 * Records an evidence artifact for an investigation.
 * @param params - The evidence parameters
 * @param db - Database or transaction instance
 * @returns The created evidence record
 */
export async function addEvidence(
	params: AddEvidenceParams,
	db: DatabaseOrTransaction = getDb(),
): Promise<InvestigationEvidence> {
	const { investigationId, evidenceType, filePath, contentHash, contentPreview } = params

	const result = await db
		.insert(investigationEvidence)
		.values({
			investigationId,
			evidenceType,
			filePath,
			contentHash,
			contentPreview,
			capturedAt: new Date(),
		})
		.returning()

	const record = result[0]
	if (!record) {
		throw new Error(`Failed to add evidence to investigation ${investigationId}`)
	}

	return record
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Gets all investigations for a given bug fix commit.
 * @param bugFixSha - The SHA of the bug fix commit
 * @param db - Database or transaction instance
 * @returns List of investigations for the bug fix
 */
export async function getInvestigationsForBugFix(
	bugFixSha: string,
	db: DatabaseOrTransaction = getDb(),
): Promise<CausalityInvestigation[]> {
	return db.query.causalityInvestigations.findMany({
		where: eq(causalityInvestigations.bugFixSha, bugFixSha),
		orderBy: desc(causalityInvestigations.startedAt),
	})
}

/**
 * Investigation with all related details (candidates and evidence).
 */
export interface InvestigationWithDetails extends CausalityInvestigation {
	candidates: InvestigationCandidate[]
	evidence: InvestigationEvidence[]
}

/**
 * Gets a full investigation with related candidates and evidence.
 * Uses Drizzle relations to fetch nested data.
 * @param investigationId - The ID of the investigation
 * @param db - Database or transaction instance
 * @returns The investigation with all related data, or null if not found
 */
export async function getInvestigationWithDetails(
	investigationId: number,
	db: DatabaseOrTransaction = getDb(),
): Promise<InvestigationWithDetails | null> {
	const result = await db.query.causalityInvestigations.findFirst({
		where: eq(causalityInvestigations.id, investigationId),
		with: {
			candidates: {
				orderBy: desc(investigationCandidates.orderExamined),
			},
			evidence: {
				orderBy: desc(investigationEvidence.capturedAt),
			},
		},
	})

	if (!result) {
		return null
	}

	return result as InvestigationWithDetails
}
