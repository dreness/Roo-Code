import Link from "next/link"
import type { ReleaseWithCommits } from "@/actions/timeline"

interface TimelineProps {
	releases: ReleaseWithCommits[]
}

export function Timeline({ releases }: TimelineProps) {
	if (releases.length === 0) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p>No releases found.</p>
				<p className="mt-2 text-sm">Run the analyze command to populate commit data:</p>
				<pre className="mt-2 bg-muted p-4 rounded-md inline-block text-left">
					pnpm commit-analysis analyze --since HEAD~100
				</pre>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{releases.map((releaseData) => (
				<ReleaseGroup key={releaseData.release.version} data={releaseData} />
			))}
		</div>
	)
}

function ReleaseGroup({ data }: { data: ReleaseWithCommits }) {
	const { release, commits } = data

	return (
		<div className="border rounded-lg p-4">
			<div className="flex items-center gap-4 mb-4">
				<div className="w-3 h-3 bg-primary rounded-full" />
				<h3 className="text-lg font-semibold">v{release.version}</h3>
				<span className="text-muted-foreground text-sm">{release.date.toLocaleDateString()}</span>
				<div className="flex gap-2 ml-auto text-sm">
					<span className="text-green-600">{release.featureCount} features</span>
					<span className="text-blue-600">{release.fixCount} fixes</span>
				</div>
			</div>

			<div className="ml-6 border-l pl-4 space-y-2">
				{commits.map((commit) => (
					<CommitRow key={commit.sha} commit={commit} />
				))}
			</div>
		</div>
	)
}

function CommitRow({ commit }: { commit: ReleaseWithCommits["commits"][0] }) {
	const riskScore = commit.classification?.riskScore ?? 0
	const riskColor = getRiskColor(riskScore)

	return (
		<Link
			href={`/commits/${commit.sha}`}
			className="flex items-center gap-3 py-1 hover:bg-muted rounded px-2 -mx-2">
			<span className="font-mono text-sm text-muted-foreground">{commit.shortSha}</span>
			<span className="flex-1 truncate">{commit.message.split("\n")[0]}</span>
			<RiskBar score={riskScore} />
			<span className={`text-sm font-medium ${riskColor}`}>{riskScore.toFixed(0)}</span>
		</Link>
	)
}

function RiskBar({ score }: { score: number }) {
	const filled = Math.ceil(score / 20)

	return (
		<div className="flex gap-0.5">
			{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className={`w-2 h-4 rounded-sm ${i <= filled ? getRiskBgColor(score) : "bg-muted"}`} />
			))}
		</div>
	)
}

function getRiskColor(score: number): string {
	if (score < 25) return "text-green-600"
	if (score < 50) return "text-yellow-600"
	if (score < 75) return "text-orange-600"
	return "text-red-600"
}

function getRiskBgColor(score: number): string {
	if (score < 25) return "bg-green-500"
	if (score < 50) return "bg-yellow-500"
	if (score < 75) return "bg-orange-500"
	return "bg-red-500"
}
