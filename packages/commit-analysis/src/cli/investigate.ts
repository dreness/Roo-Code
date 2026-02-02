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

/**
 * Prompts user to select from a list of options.
 */
async function selectOption<T extends string>(
	rl: readline.Interface,
	question: string,
	options: readonly T[],
): Promise<T> {
	console.log(question)
	options.forEach((opt, idx) => {
		console.log(`  ${idx + 1}. ${opt}`)
	})

	while (true) {
		const answer = await prompt(rl, "Enter number: ")
		const num = parseInt(answer, 10)
		if (num >= 1 && num <= options.length) {
			return options[num - 1] as T
		}
		console.log(`Please enter a number between 1 and ${options.length}`)
	}
}

/**
 * Gets the git user name from git config.
 */
async function getGitUserName(repoPath?: string): Promise<string | null> {
	try {
		const { execa } = await import("execa")
		const { stdout } = await execa("git", ["config", "user.name"], {
			cwd: repoPath || process.cwd(),
		})
		return stdout.trim() || null
	} catch {
		return null
	}
}

export const investigateCommand = command({
	name: "investigate",
	description: "Interactively investigate bug causality for a commit",
	args: {
		commit: option({
			type: string,
			long: "commit",
			short: "c",
			description: "SHA of the bug fix commit to investigate",
		}),
		repoPath: option({
			type: string,
			long: "repo-path",
			short: "r",
			description: "Path to the git repository",
			defaultValue: () => process.cwd(),
		}),
	},
	handler: async (args) => {
		// Dynamic imports for faster CLI startup
		const [{ getDb }, { getCommitBySha }, causalityModule, investigationsModule] = await Promise.all([
			import("../db/db"),
			import("../db/queries/commits"),
			import("../db/queries/causality"),
			import("../db/queries/investigations"),
		])

		const { getCausesForBugFix, recordHumanFeedback, linkToInvestigation } = causalityModule
		const { createInvestigation, completeInvestigation, addCandidate, getInvestigationsForBugFix } =
			investigationsModule

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
		console.log("║           INTERACTIVE BUG CAUSALITY INVESTIGATION            ║")
		console.log("╚══════════════════════════════════════════════════════════════╝")
		console.log("")
		console.log(`Bug Fix Commit: ${commit.shortSha}`)
		console.log(`Message: ${commit.message}`)
		console.log(`Author: ${commit.author}`)
		console.log(`Date: ${commit.date.toLocaleDateString()}`)
		console.log("")

		// Create readline interface
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		try {
			// Get investigator name
			const gitUserName = await getGitUserName(args.repoPath)
			let investigator: string

			if (gitUserName) {
				const useGitName = await prompt(rl, `Investigator name [${gitUserName}]: `)
				investigator = useGitName || gitUserName
			} else {
				investigator = await prompt(rl, "Investigator name: ")
				if (!investigator) {
					console.error("Error: Investigator name is required")
					process.exit(1)
				}
			}

			// Check for existing investigations
			const existingInvestigations = await getInvestigationsForBugFix(commit.sha, db)
			if (existingInvestigations.length > 0) {
				console.log("")
				console.log(`Found ${existingInvestigations.length} existing investigation(s):`)
				for (const inv of existingInvestigations) {
					const status = inv.completedAt ? "completed" : "in progress"
					console.log(`  - ${inv.startedAt.toLocaleDateString()} by ${inv.investigator} (${status})`)
				}
				console.log("")
			}

			// Show existing automated causality
			const existingCauses = await getCausesForBugFix(commit.sha, db)
			if (existingCauses.length > 0) {
				console.log("")
				console.log("Existing Automated Causality:")
				console.log("─".repeat(50))
				for (const causality of existingCauses) {
					if (!causality.cause) continue
					const verified = causality.humanVerified ? " ✓ verified" : ""
					console.log(
						`  ${causality.cause.shortSha} [${causality.relationshipType}] confidence: ${(causality.confidence * 100).toFixed(0)}%${verified}`,
					)
					console.log(`    ${causality.cause.message.slice(0, 60)}...`)
					console.log(`    Method: ${causality.analysisMethod}`)
					if (causality.bugAge) {
						console.log(`    Bug age: ${causality.bugAge} days`)
					}
				}
				console.log("")
			} else {
				console.log("\nNo existing automated causality found for this bug fix.")
				console.log("")
			}

			// Create new investigation
			console.log("Creating new investigation...")
			const investigationId = await createInvestigation({ bugFixSha: commit.sha, investigator }, db)
			console.log(`Investigation #${investigationId} started`)
			console.log("")

			// Interactive loop to add candidates
			const verdictOptions = ["root_cause", "contributing", "ruled_out", "uncertain"] as const
			let candidateOrder = 0
			let _foundRootCause = false

			console.log("─".repeat(50))
			console.log("Add candidate commits to investigate.")
			console.log("Enter 'done' when finished adding candidates.")
			console.log("─".repeat(50))
			console.log("")

			while (true) {
				const candidateShaInput = await prompt(rl, "Candidate commit SHA (or 'done'): ")

				if (candidateShaInput.toLowerCase() === "done") {
					break
				}

				if (!candidateShaInput) {
					continue
				}

				// Validate candidate commit exists
				const candidateCommit = await getCommitBySha(candidateShaInput, db)
				if (!candidateCommit) {
					console.log(`  Warning: Commit ${candidateShaInput} not found in database`)
					const addAnyway = await prompt(rl, "  Add anyway? (y/n): ")
					if (addAnyway.toLowerCase() !== "y") {
						continue
					}
				} else {
					console.log(`  Found: ${candidateCommit.shortSha} - ${candidateCommit.message.slice(0, 50)}...`)
				}

				// Get verdict
				const verdict = await selectOption(rl, "\nVerdict for this candidate:", verdictOptions)

				// Get reasoning or rejection reason
				let reasoning: string | undefined
				let rejectionReason: string | undefined

				if (verdict === "ruled_out") {
					rejectionReason = await prompt(rl, "Rejection reason: ")
				} else {
					reasoning = await prompt(rl, "Reasoning (optional): ")
				}

				candidateOrder++
				await addCandidate(
					{
						investigationId,
						candidateSha: candidateCommit?.sha || candidateShaInput,
						verdict,
						reasoning: reasoning || undefined,
						rejectionReason: rejectionReason || undefined,
						orderExamined: candidateOrder,
					},
					db,
				)

				console.log(`  ✓ Candidate added (${verdict})`)
				console.log("")

				if (verdict === "root_cause") {
					_foundRootCause = true
				}
			}

			// Complete investigation
			console.log("")
			console.log("─".repeat(50))
			console.log("Complete the investigation")
			console.log("─".repeat(50))
			console.log("")

			const conclusionOptions = ["confirmed", "rejected", "inconclusive", "new_cause_found"] as const
			const conclusionType = await selectOption(rl, "Conclusion type:", conclusionOptions)

			let finalCauseSha: string | undefined
			let confidenceOverride: number | undefined

			if (conclusionType === "confirmed" || conclusionType === "new_cause_found") {
				const causeShaInput = await prompt(rl, "Final cause commit SHA: ")
				if (causeShaInput) {
					const causeCommit = await getCommitBySha(causeShaInput, db)
					if (causeCommit) {
						finalCauseSha = causeCommit.sha
						console.log(`  Found: ${causeCommit.shortSha} - ${causeCommit.message.slice(0, 50)}...`)
					} else {
						console.log(`  Warning: Commit ${causeShaInput} not in database`)
						finalCauseSha = causeShaInput
					}
				}

				const confidenceInput = await prompt(rl, "Confidence (0-100, optional): ")
				if (confidenceInput) {
					const conf = parseInt(confidenceInput, 10)
					if (conf >= 0 && conf <= 100) {
						confidenceOverride = conf / 100
					}
				}
			}

			const summary = await prompt(rl, "Summary (optional): ")

			// Complete the investigation
			await completeInvestigation(
				{
					investigationId,
					conclusionType,
					finalCauseSha,
					confidenceOverride,
					summary: summary || undefined,
				},
				db,
			)

			console.log("")
			console.log("✓ Investigation completed!")

			// Update human feedback on existing causality if applicable
			if (existingCauses.length > 0) {
				console.log("")
				const updateFeedback = await prompt(
					rl,
					"Update human feedback on existing automated causality? (y/n): ",
				)

				if (updateFeedback.toLowerCase() === "y") {
					for (const causality of existingCauses) {
						if (!causality.cause) continue

						console.log("")
						console.log(
							`  ${causality.cause.shortSha} [${causality.relationshipType}] - ${(causality.confidence * 100).toFixed(0)}%`,
						)
						const wasCorrect = await prompt(rl, "  Was this causality correct? (y/n/skip): ")

						if (wasCorrect.toLowerCase() === "skip") {
							continue
						}

						const humanVerified = true
						const automationWasCorrect = wasCorrect.toLowerCase() === "y"

						let humanConfidence: number | undefined
						const confInput = await prompt(rl, "  Your confidence (0-100, optional): ")
						if (confInput) {
							const conf = parseInt(confInput, 10)
							if (conf >= 0 && conf <= 100) {
								humanConfidence = conf / 100
							}
						}

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

						// Link to investigation
						await linkToInvestigation(
							{
								bugFixSha: causality.bugFixSha,
								causeSha: causality.causeSha,
								investigationId,
							},
							db,
						)

						console.log("  ✓ Feedback recorded")
					}
				}
			}

			console.log("")
			console.log("═".repeat(50))
			console.log("Investigation complete!")
			console.log(`Investigation ID: ${investigationId}`)
			console.log(`Candidates examined: ${candidateOrder}`)
			console.log(`Conclusion: ${conclusionType}`)
			if (finalCauseSha) {
				console.log(`Final cause: ${finalCauseSha.slice(0, 8)}`)
			}
			console.log("═".repeat(50))
		} finally {
			rl.close()
		}
	},
})
