import type { Subsystem } from "../types"

// File path patterns for subsystem detection
interface SubsystemPattern {
	patterns: RegExp[]
	subsystem: Subsystem
}

const SUBSYSTEM_PATTERNS: SubsystemPattern[] = [
	// Provider patterns (API integrations)
	{
		patterns: [
			/src\/api\/providers?\//i,
			/providers?\/.*\.(ts|js)$/i,
			/anthropic|openai|gemini|bedrock|vertex|ollama|azure|openrouter/i,
			/src\/core\/.*provider/i,
		],
		subsystem: "provider",
	},

	// Tool patterns (MCP, tool execution)
	{
		patterns: [
			/src\/services\/mcp/i,
			/tools?\//i,
			/tool[-_]?(use|call|result|block)/i,
			/mcp[-_]?(server|client|tool)/i,
			/execute[-_]?tool/i,
		],
		subsystem: "tool",
	},

	// UI patterns
	{
		patterns: [
			/webview[-_]?ui\//i,
			/src\/webviews?\//i,
			/components?\//i,
			/\.tsx$/i,
			/\.css$/i,
			/\.scss$/i,
			/styles?\//i,
		],
		subsystem: "ui",
	},

	// API patterns (extension API, handlers)
	{
		patterns: [/src\/api\//i, /handlers?\//i, /api[-_]?client/i, /routes?\//i],
		subsystem: "api",
	},

	// Core patterns (main logic)
	{
		patterns: [/src\/core\//i, /src\/services?\//i, /src\/agent\//i, /roo\.ts$/i, /cline\.ts$/i],
		subsystem: "core",
	},

	// Test patterns
	{
		patterns: [/\.test\.(ts|js|tsx|jsx)$/i, /\.spec\.(ts|js|tsx|jsx)$/i, /__tests__\//i, /test\//i, /tests\//i],
		subsystem: "test",
	},

	// Build patterns
	{
		patterns: [
			/package\.json$/i,
			/tsconfig.*\.json$/i,
			/webpack/i,
			/vite/i,
			/esbuild/i,
			/rollup/i,
			/turbo\.json$/i,
			/pnpm-workspace/i,
		],
		subsystem: "build",
	},

	// Documentation patterns
	{
		patterns: [/\.md$/i, /readme/i, /changelog/i, /docs?\//i, /documentation\//i],
		subsystem: "docs",
	},

	// Config patterns
	{
		patterns: [
			/\.config\.(ts|js|mjs|cjs)$/i,
			/eslint/i,
			/prettier/i,
			/\.env/i,
			/\.gitignore$/i,
			/settings\.json$/i,
		],
		subsystem: "config",
	},
]

export function detectSubsystem(filePath: string): Subsystem {
	for (const { patterns, subsystem } of SUBSYSTEM_PATTERNS) {
		for (const pattern of patterns) {
			if (pattern.test(filePath)) {
				return subsystem
			}
		}
	}

	return "unknown"
}

export function detectSubsystems(filePaths: string[]): Map<Subsystem, number> {
	const counts = new Map<Subsystem, number>()

	for (const filePath of filePaths) {
		const subsystem = detectSubsystem(filePath)
		counts.set(subsystem, (counts.get(subsystem) || 0) + 1)
	}

	return counts
}

export function getPrimarySubsystem(filePaths: string[]): Subsystem {
	const counts = detectSubsystems(filePaths)

	let maxCount = 0
	let primary: Subsystem = "unknown"

	for (const [subsystem, count] of counts) {
		if (count > maxCount) {
			maxCount = count
			primary = subsystem
		}
	}

	return primary
}

export function getSubsystemsAffected(filePaths: string[]): Subsystem[] {
	const subsystems = new Set<Subsystem>()

	for (const filePath of filePaths) {
		subsystems.add(detectSubsystem(filePath))
	}

	return [...subsystems].filter((s) => s !== "unknown")
}

// Critical paths that indicate higher risk
const CRITICAL_PATHS = [
	/src\/core\/.*\.(ts|js)$/i,
	/src\/api\/providers?\//i,
	/src\/services\/mcp/i,
	/src\/agent\//i,
	/package\.json$/i,
]

export function touchesCriticalPath(filePaths: string[]): boolean {
	for (const filePath of filePaths) {
		for (const pattern of CRITICAL_PATHS) {
			if (pattern.test(filePath)) {
				return true
			}
		}
	}
	return false
}

export function hasTestFiles(filePaths: string[]): boolean {
	return filePaths.some(
		(fp) =>
			fp.includes(".test.") ||
			fp.includes(".spec.") ||
			fp.includes("__tests__") ||
			fp.includes("/test/") ||
			fp.includes("/tests/"),
	)
}
