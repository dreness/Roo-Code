import { execa } from "execa"

export interface BlameResult {
	sha: string
	author: string
	date: Date
	lineNumber: number
	content: string
}

export interface BlameRange {
	startLine: number
	endLine: number
	sha: string
	author: string
	date: Date
}

export async function blameFile(
	filePath: string,
	options: {
		startLine?: number
		endLine?: number
		ref?: string
		repoPath?: string
	} = {},
): Promise<BlameResult[]> {
	const args = ["blame", "--porcelain"]

	if (options.startLine && options.endLine) {
		args.push(`-L${options.startLine},${options.endLine}`)
	}

	if (options.ref) {
		args.push(options.ref)
	}

	args.push("--", filePath)

	try {
		const { stdout } = await execa("git", args, {
			cwd: options.repoPath || process.cwd(),
		})

		return parsePorcelainBlame(stdout)
	} catch {
		// File might not exist at this ref
		return []
	}
}

function parsePorcelainBlame(output: string): BlameResult[] {
	const results: BlameResult[] = []
	const lines = output.split("\n")

	let currentSha = ""
	let currentAuthor = ""
	let currentDate: Date | null = null
	let currentLineNumber = 0

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		if (!line) continue

		// SHA line: <sha> <orig-line> <final-line> [<count>]
		const shaMatch = line.match(/^([a-f0-9]{40})\s+(\d+)\s+(\d+)/)
		if (shaMatch && shaMatch[1] && shaMatch[3]) {
			currentSha = shaMatch[1]
			currentLineNumber = parseInt(shaMatch[3], 10)
			continue
		}

		// Author line
		if (line.startsWith("author ")) {
			currentAuthor = line.slice(7)
			continue
		}

		// Author time
		if (line.startsWith("author-time ")) {
			const timestamp = parseInt(line.slice(12), 10)
			currentDate = new Date(timestamp * 1000)
			continue
		}

		// Content line (starts with tab)
		if (line.startsWith("\t")) {
			if (currentSha && currentDate) {
				results.push({
					sha: currentSha,
					author: currentAuthor,
					date: currentDate,
					lineNumber: currentLineNumber,
					content: line.slice(1),
				})
			}
		}
	}

	return results
}

export async function blameFileRanges(
	filePath: string,
	options: {
		ref?: string
		repoPath?: string
	} = {},
): Promise<BlameRange[]> {
	const results = await blameFile(filePath, options)

	if (results.length === 0) return []

	// Group consecutive lines by SHA
	const ranges: BlameRange[] = []
	let currentRange: BlameRange | null = null

	for (const result of results) {
		if (!currentRange || currentRange.sha !== result.sha || currentRange.endLine !== result.lineNumber - 1) {
			// Start new range
			if (currentRange) {
				ranges.push(currentRange)
			}
			currentRange = {
				startLine: result.lineNumber,
				endLine: result.lineNumber,
				sha: result.sha,
				author: result.author,
				date: result.date,
			}
		} else {
			// Extend current range
			currentRange.endLine = result.lineNumber
		}
	}

	if (currentRange) {
		ranges.push(currentRange)
	}

	return ranges
}

export async function getCommitsForLines(
	filePath: string,
	lines: number[],
	options: {
		ref?: string
		repoPath?: string
	} = {},
): Promise<Map<number, string>> {
	if (lines.length === 0) return new Map()

	const minLine = Math.min(...lines)
	const maxLine = Math.max(...lines)

	const blameResults = await blameFile(filePath, {
		startLine: minLine,
		endLine: maxLine,
		...options,
	})

	const lineToSha = new Map<number, string>()
	const lineSet = new Set(lines)

	for (const result of blameResults) {
		if (lineSet.has(result.lineNumber)) {
			lineToSha.set(result.lineNumber, result.sha)
		}
	}

	return lineToSha
}

export async function getUniqueBlameShas(
	filePath: string,
	options: {
		startLine?: number
		endLine?: number
		ref?: string
		repoPath?: string
	} = {},
): Promise<string[]> {
	const results = await blameFile(filePath, options)
	const shas = new Set(results.map((r) => r.sha))

	// Filter out the "not committed yet" SHA
	shas.delete("0".repeat(40))

	return [...shas]
}
