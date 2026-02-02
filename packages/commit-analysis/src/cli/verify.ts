import { command, option, string } from "cmd-ts"
import * as readline from "readline"

/**
 * Simple readline-based prompt for interactive CLI input.
 */
function prompt(rl: readline.Interface, question: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim())
		})
	})
}

export const verifyCommand = command({
	name: "verify",
	description: "Quickly verify automated causality for a bug fix commit",
	args: {
		commit: option({
			type: string,
			long: "commit",
			short: "c",
			description: "SHA of the bug fix commit to verify",
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, { getCommitBySha }, causalityModule] = await Promise.all([
			import("../db/db"),
			import("../db/queries/commits"),
			import("../db/queries/causality"),
		])

		const { getCausesForBugFix, recordHumanFeedback, createBugCausality } = causalityModule

		const db = getDb()

		// Validate the commit exists
		const commit = await getCommitBySha(args.commit, db)
		if (!commit) {
			console.error(`Error: Commit ${args.commit} not found in database`)
			console.log("Run 'pnpm cli analyze' first to import commits")
			process.exit(1)
		}

		console.log("")
		console.log("╔══════════════════════════════════════════════════════════════╗")
		console.log("║              QUICK CAUSALITY VERIFICATION                    ║")
		console.log("╚══════════════════════════════════════════════════════════════╝")
		console.log("")
		console.log(`Bug Fix: ${commit.shortSha}`)
		console.log(`Message: ${commit.message}`)
		console.log(`Author: ${commit.author}`)
		console.log(`Date: ${commit.date.toLocaleDateString()}`)
		console.log("")

		// Get existing causality
		const causes = await getCausesForBugFix(commit.sha, db)

		if (causes.length === 0) {
			console.log("No automated causality found for this bug fix.")
			console.log("Use 'pnpm cli deep-analyze' to run causality analysis first,")
			console.log("or 'pnpm cli investigate --commit <sha>' for manual investigation.")
			process.exit(0)
		}

		// Create readline interface
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		try {
			console.log("Automated Causality:")
			console.log("─".repeat(50))

			let verifiedCount = 0
			let correctCount = 0
			let incorrectCount = 0
			let uncertainCount = 0

			for (const causality of causes) {
				if (!causality.cause) continue

				console.log("")
				const alreadyVerified = causality.humanVerified ? " (already verified)" : ""
				console.log(`Cause: ${causality.cause.shortSha} [${causality.relationshipType}]${alreadyVerified}`)
				console.log(`  Message: ${causality.cause.message.slice(0, 60)}...`)
				console.log(`  Confidence: ${(causality.confidence * 100).toFixed(0)}%`)
				console.log(`  Method: ${causality.analysisMethod}`)
				if (causality.bugAge) {
					console.log(`  Bug age: ${causality.bugAge} days`)
				}
				console.log("")

				const response = await prompt(rl, "Is this causality correct? (yes/no/uncertain/skip): ")
				const normalizedResponse = response.toLowerCase()

				if (normalizedResponse === "skip" || normalizedResponse === "s") {
					console.log("  → Skipped")
					continue
				}

				const humanVerified = true
				let automationWasCorrect: boolean | undefined

				if (normalizedResponse === "yes" || normalizedResponse === "y") {
					automationWasCorrect = true
					correctCount++
					console.log("  ✓ Marked as correct")
				} else if (normalizedResponse === "no" || normalizedResponse === "n") {
					automationWasCorrect = false
					incorrectCount++
					console.log("  ✗ Marked as incorrect")

					// Prompt for correct cause
					const correctCauseInput = await prompt(rl, "  Enter correct cause SHA (or press Enter to skip): ")

					if (correctCauseInput) {
						const correctCauseCommit = await getCommitBySha(correctCauseInput, db)
						if (correctCauseCommit) {
							console.log(
								`    Found: ${correctCauseCommit.shortSha} - ${correctCauseCommit.message.slice(0, 40)}...`,
							)

							// Create new causality record for the correct cause
							const confInput = await prompt(rl, "    Your confidence for this cause (0-100): ")
							const humanConfidence = confInput
								? Math.min(100, Math.max(0, parseInt(confInput, 10))) / 100
								: 0.8

							await createBugCausality({
								bugFixSha: commit.sha,
								causeSha: correctCauseCommit.sha,
								relationshipType: "root_cause",
								confidence: humanConfidence,
								analysisMethod: "human_verified",
								notes: `Human correction: replaced ${causality.cause.shortSha}`,
							})

							// Mark the new causality as human verified
							await recordHumanFeedback(
								{
									bugFixSha: commit.sha,
									causeSha: correctCauseCommit.sha,
									humanVerified: true,
									humanConfidence,
									automationWasCorrect: true, // This is the correct answer
								},
								db,
							)

							console.log("    ✓ New causality recorded")
						} else {
							console.log(`    Warning: Commit ${correctCauseInput} not found in database`)
						}
					}
				} else if (normalizedResponse === "uncertain" || normalizedResponse === "u") {
					automationWasCorrect = undefined
					uncertainCount++
					console.log("  ? Marked as uncertain")
				} else {
					console.log("  → Invalid response, skipping")
					continue
				}

				// Get optional confidence override
				let humanConfidence: number | undefined
				const confInput = await prompt(rl, "  Your confidence (0-100, press Enter to skip): ")
				if (confInput) {
					const conf = parseInt(confInput, 10)
					if (conf >= 0 && conf <= 100) {
						humanConfidence = conf / 100
					}
				}

				// Record feedback
				await recordHumanFeedback(
					{
						bugFixSha: causality.bugFixSha,
						causeSha: causality.causeSha,
						humanVerified,
						humanConfidence,
						automationWasCorrect,
					},
					db,
				)

				verifiedCount++
				console.log("  ✓ Feedback recorded")
			}

			console.log("")
			console.log("═".repeat(50))
			console.log("Verification Summary")
			console.log("═".repeat(50))
			console.log(`Total causality records: ${causes.length}`)
			console.log(`Verified this session: ${verifiedCount}`)
			console.log(`  - Correct: ${correctCount}`)
			console.log(`  - Incorrect: ${incorrectCount}`)
			console.log(`  - Uncertain: ${uncertainCount}`)
			console.log("═".repeat(50))
		} finally {
			rl.close()
		}
	},
})
