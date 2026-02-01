import type { CommitCategory } from "../db/schema"
import type { RiskBreakdown } from "../types"
import { touchesCriticalPath, hasTestFiles, getSubsystemsAffected } from "../classifiers/subsystem"
import { isBreakingChange } from "../git/parser"

// Weight factors for risk calculation
const RISK_WEIGHTS = {
	filesChanged: 2, // Per file up to cap
	linesChanged: 0.1, // Per line up to cap
	subsystemsAffected: 10, // Per subsystem
	breakingChange: 25,
	criticalPath: 15,
	noTests: 10,
	lowAuthorExperience: 5,
	recentRegressions: 8, // Per regression
}

const CAPS = {
	filesChanged: 20, // Cap at 20 files
	linesChanged: 500, // Cap at 500 lines
	subsystemsAffected: 5,
	recentRegressions: 3,
}

// Category base risk scores
const CATEGORY_BASE_RISK: Record<CommitCategory, number> = {
	bugfix: 20, // Bug fixes can introduce new bugs
	feature: 30, // New features are risky
	refactor: 25, // Refactoring can break things
	performance: 20,
	revert: 15, // Reverts are usually safe
	documentation: 5,
	test: 5,
	build: 15,
	ci: 10,
	style: 5,
	chore: 10,
	unknown: 20,
}

export function calculateRiskScore(
	category: CommitCategory,
	message: string,
	filePaths: string[],
	insertions: number,
	deletions: number,
	authorCommitsInArea: number = 0,
	recentRegressions: number = 0,
): RiskBreakdown {
	const factors: Record<string, number> = {}

	// Base score from category
	const baseScore = CATEGORY_BASE_RISK[category] || CATEGORY_BASE_RISK.unknown
	factors.category = baseScore

	// Files changed factor
	const filesChangedFactor = Math.min(filePaths.length, CAPS.filesChanged) * RISK_WEIGHTS.filesChanged
	factors.filesChanged = filesChangedFactor

	// Lines changed factor
	const linesChanged = insertions + deletions
	const linesChangedFactor = Math.min(linesChanged, CAPS.linesChanged) * RISK_WEIGHTS.linesChanged
	factors.linesChanged = linesChangedFactor

	// Subsystems affected factor
	const subsystems = getSubsystemsAffected(filePaths)
	const subsystemsFactor = Math.min(subsystems.length, CAPS.subsystemsAffected) * RISK_WEIGHTS.subsystemsAffected
	factors.subsystemsAffected = subsystemsFactor

	// Breaking change factor
	if (isBreakingChange(message)) {
		factors.breakingChange = RISK_WEIGHTS.breakingChange
	}

	// Critical path factor
	if (touchesCriticalPath(filePaths)) {
		factors.criticalPath = RISK_WEIGHTS.criticalPath
	}

	// Test coverage factor (penalty for no tests)
	if (!hasTestFiles(filePaths) && filePaths.length > 2 && category !== "documentation") {
		factors.noTests = RISK_WEIGHTS.noTests
	}

	// Author experience factor
	if (authorCommitsInArea < 5) {
		factors.lowAuthorExperience = RISK_WEIGHTS.lowAuthorExperience
	}

	// Recent regressions factor
	if (recentRegressions > 0) {
		const regressionFactor = Math.min(recentRegressions, CAPS.recentRegressions) * RISK_WEIGHTS.recentRegressions
		factors.recentRegressions = regressionFactor
	}

	// Calculate final score
	const totalFactors = Object.values(factors).reduce((sum, val) => sum + val, 0)

	// Normalize to 0-100 range
	const finalScore = Math.min(100, Math.max(0, totalFactors))

	return {
		baseScore,
		factors,
		finalScore,
	}
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
	if (score < 25) return "low"
	if (score < 50) return "medium"
	if (score < 75) return "high"
	return "critical"
}

export function getRiskColor(score: number): string {
	if (score < 25) return "green"
	if (score < 50) return "yellow"
	if (score < 75) return "orange"
	return "red"
}

export function aggregateRisk(scores: number[]): number {
	if (scores.length === 0) return 0

	// Use weighted average with emphasis on higher risks
	const sortedScores = [...scores].sort((a, b) => b - a)
	let totalWeight = 0
	let weightedSum = 0

	for (let i = 0; i < sortedScores.length; i++) {
		// Higher weight for higher risk scores
		const weight = Math.pow(0.8, i) // Exponential decay
		const score = sortedScores[i]
		if (score !== undefined) {
			weightedSum += score * weight
			totalWeight += weight
		}
	}

	return weightedSum / totalWeight
}
