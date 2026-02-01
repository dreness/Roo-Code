import { execa } from "execa"
import type { GitCommitRaw, GitFileChange } from "../types"

// Git format string: SHA, short SHA, author name, author email, date (ISO), body
// Note: LOG_FORMAT ends without a null - RECORD_SEPARATOR_FORMAT provides the separator
const LOG_FORMAT = "%H%x00%h%x00%an%x00%ae%x00%aI%x00%B"
const FIELD_SEPARATOR = "\x00"
// Git format placeholder for use in --format argument (3 nulls between records)
const RECORD_SEPARATOR_FORMAT = "%x00%x00%x00"
// Literal null bytes for parsing git output
const RECORD_SEPARATOR = "\x00\x00\x00"

export interface ExtractOptions {
	since?: string // Commit ref or date
	until?: string // Commit ref or date
	limit?: number
	repoPath?: string
}

export async function extractCommits(options: ExtractOptions = {}): Promise<GitCommitRaw[]> {
	// Note: We don't use --numstat here because it complicates parsing.
	// File changes are fetched separately via extractFileChanges()
	const args = ["log", `--format=${LOG_FORMAT}${RECORD_SEPARATOR_FORMAT}`]

	if (options.since) {
		args.push(`${options.since}..${options.until || "HEAD"}`)
	} else if (options.until) {
		args.push(options.until)
	}

	if (options.limit) {
		args.push(`-n`, String(options.limit))
	}

	const { stdout } = await execa("git", args, {
		cwd: options.repoPath || process.cwd(),
		maxBuffer: 100 * 1024 * 1024, // 100MB buffer for large histories
	})

	return parseGitLog(stdout)
}

function parseGitLog(output: string): GitCommitRaw[] {
	const records = output
		.split(RECORD_SEPARATOR)
		.map((r) => r.trim())
		.filter(Boolean)
	const commits: GitCommitRaw[] = []

	for (const record of records) {
		const parts = record.split(FIELD_SEPARATOR)
		if (parts.length < 6) continue

		const sha = parts[0]!
		const shortSha = parts[1]!
		const author = parts[2]!
		const authorEmail = parts[3]!
		const dateStr = parts[4]!
		const message = parts[5]!

		// Extract PR number from message
		const prMatch = message.match(/#(\d+)/)
		const prNumber = prMatch?.[1] ? parseInt(prMatch[1], 10) : undefined

		commits.push({
			sha,
			shortSha,
			author,
			authorEmail,
			date: new Date(dateStr),
			message: message.trim(),
			prNumber,
			// File stats are fetched separately via extractFileChanges()
			filesChanged: 0,
			insertions: 0,
			deletions: 0,
		})
	}

	return commits
}

export async function extractFileChanges(sha: string, repoPath?: string): Promise<GitFileChange[]> {
	const { stdout } = await execa("git", ["diff-tree", "--no-commit-id", "--name-status", "-r", sha], {
		cwd: repoPath || process.cwd(),
	})

	const changes: GitFileChange[] = []
	const lines = stdout.trim().split("\n").filter(Boolean)

	// Get numstat for insertions/deletions
	const { stdout: numstat } = await execa("git", ["diff-tree", "--no-commit-id", "--numstat", "-r", sha], {
		cwd: repoPath || process.cwd(),
	})

	const numstatMap = new Map<string, { insertions: number; deletions: number }>()
	for (const line of numstat.trim().split("\n").filter(Boolean)) {
		const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/)
		if (match && match[1] && match[2] && match[3]) {
			numstatMap.set(match[3], {
				insertions: match[1] === "-" ? 0 : parseInt(match[1], 10),
				deletions: match[2] === "-" ? 0 : parseInt(match[2], 10),
			})
		}
	}

	for (const line of lines) {
		const parts = line.split("\t")
		if (parts.length < 2) continue

		const changeTypeRaw = parts[0]!
		const filePath = parts[parts.length - 1]! // Handle renames (R100\told\tnew)

		let changeType: GitFileChange["changeType"] = "M"
		if (changeTypeRaw.startsWith("A")) changeType = "A"
		else if (changeTypeRaw.startsWith("D")) changeType = "D"
		else if (changeTypeRaw.startsWith("R")) changeType = "R"

		const stats = numstatMap.get(filePath) || { insertions: 0, deletions: 0 }

		changes.push({
			filePath,
			changeType,
			insertions: stats.insertions,
			deletions: stats.deletions,
		})
	}

	return changes
}

export async function getGitCommitCount(since?: string, until?: string, repoPath?: string): Promise<number> {
	const args = ["rev-list", "--count"]

	if (since && until) {
		args.push(`${since}..${until}`)
	} else if (until) {
		args.push(until)
	} else {
		args.push("HEAD")
	}

	const { stdout } = await execa("git", args, {
		cwd: repoPath || process.cwd(),
	})

	return parseInt(stdout.trim(), 10)
}

export async function getLatestTag(repoPath?: string): Promise<string | null> {
	try {
		const { stdout } = await execa("git", ["describe", "--tags", "--abbrev=0"], {
			cwd: repoPath || process.cwd(),
		})
		return stdout.trim()
	} catch {
		return null
	}
}

export async function getTags(repoPath?: string): Promise<{ name: string; sha: string; date: Date }[]> {
	const { stdout } = await execa(
		"git",
		[
			"for-each-ref",
			"--sort=-creatordate",
			"--format=%(refname:short)%00%(objectname)%00%(creatordate:iso)",
			"refs/tags",
		],
		{
			cwd: repoPath || process.cwd(),
		},
	)

	const tags: { name: string; sha: string; date: Date }[] = []

	for (const line of stdout.trim().split("\n").filter(Boolean)) {
		const [name, sha, dateStr] = line.split("\x00")
		if (name && sha && dateStr) {
			tags.push({
				name,
				sha,
				date: new Date(dateStr),
			})
		}
	}

	return tags
}

export async function getHeadSha(repoPath?: string): Promise<string> {
	const { stdout } = await execa("git", ["rev-parse", "HEAD"], {
		cwd: repoPath || process.cwd(),
	})
	return stdout.trim()
}

export async function resolveRef(ref: string, repoPath?: string): Promise<string> {
	const { stdout } = await execa("git", ["rev-parse", ref], {
		cwd: repoPath || process.cwd(),
	})
	return stdout.trim()
}

export async function getCommitsBetween(since: string, until: string, repoPath?: string): Promise<string[]> {
	const { stdout } = await execa("git", ["rev-list", `${since}..${until}`], {
		cwd: repoPath || process.cwd(),
	})
	return stdout.trim().split("\n").filter(Boolean)
}
