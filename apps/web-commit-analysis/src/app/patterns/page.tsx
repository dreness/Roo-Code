import { getPatternsData } from "@/actions/patterns"

export const dynamic = "force-dynamic"

export default async function PatternsPage() {
	const { patterns, stats } = await getPatternsData()

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Regression Patterns</h2>
				{stats && (
					<div className="flex gap-4 text-sm text-muted-foreground">
						<span>{stats.total} patterns detected</span>
						<span>{stats.active} active</span>
					</div>
				)}
			</div>

			{patterns.length === 0 ? (
				<div className="text-center py-12 text-muted-foreground">
					<p>No regression patterns detected yet.</p>
					<p className="mt-2 text-sm">Run the analyze command to detect patterns:</p>
					<pre className="mt-2 bg-muted p-4 rounded-md inline-block text-left">
						pnpm commit-analysis analyze --since HEAD~200
					</pre>
				</div>
			) : (
				<div className="space-y-4">
					{patterns.map((pattern) => (
						<PatternCard key={pattern.id} pattern={pattern} />
					))}
				</div>
			)}
		</div>
	)
}

function PatternCard({ pattern }: { pattern: Awaited<ReturnType<typeof getPatternsData>>["patterns"][0] }) {
	const severityColors = {
		low: "bg-green-100 text-green-800",
		medium: "bg-yellow-100 text-yellow-800",
		high: "bg-red-100 text-red-800",
	}

	return (
		<div className="border rounded-lg p-4">
			<div className="flex items-center gap-3">
				<span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[pattern.severity ?? "low"]}`}>
					{pattern.severity}
				</span>
				<span className="font-medium">{pattern.subsystem}</span>
				<span className="text-muted-foreground text-sm">{pattern.occurrenceCount} occurrences</span>
				<span
					className={`ml-auto px-2 py-1 rounded text-xs ${
						pattern.status === "active" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"
					}`}>
					{pattern.status}
				</span>
			</div>

			{pattern.keywords && pattern.keywords.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-1">
					{pattern.keywords.map((keyword, i) => (
						<span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">
							{keyword}
						</span>
					))}
				</div>
			)}

			{pattern.filePatterns && pattern.filePatterns.length > 0 && (
				<div className="mt-2 text-xs text-muted-foreground font-mono">{pattern.filePatterns.join(", ")}</div>
			)}
		</div>
	)
}
