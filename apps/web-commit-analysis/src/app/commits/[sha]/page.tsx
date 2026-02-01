import { getCommit } from "@roo-code/commit-analysis"
import { getCausalityData } from "@/actions/causality"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Props {
	params: Promise<{ sha: string }>
}

export default async function CommitDetailPage({ params }: Props) {
	const { sha } = await params
	const commit = await getCommit(sha)

	if (!commit) {
		return (
			<div className="text-center py-12">
				<h2 className="text-xl font-semibold">Commit not found</h2>
				<p className="text-muted-foreground mt-2">The commit {sha} was not found in the database.</p>
				<Link href="/" className="text-primary underline mt-4 inline-block">
					Back to timeline
				</Link>
			</div>
		)
	}

	const classification = commit.classification
	const { causes, causedBugs } = await getCausalityData(sha)

	const riskScore = classification?.riskScore ?? 0

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link href="/" className="text-muted-foreground hover:text-foreground">
					&larr; Back
				</Link>
				<h2 className="text-2xl font-semibold">{commit.shortSha}</h2>
				<RiskBadge score={riskScore} />
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="border rounded-lg p-4 space-y-4">
					<h3 className="font-semibold">Commit Info</h3>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">SHA</span>
							<span className="font-mono">{commit.sha}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Author</span>
							<span>{commit.author}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Date</span>
							<span>{commit.date.toLocaleString()}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Type</span>
							<span>{commit.messageType || "unknown"}</span>
						</div>
						{commit.messageScope && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">Scope</span>
								<span>{commit.messageScope}</span>
							</div>
						)}
						{commit.prNumber && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">PR</span>
								<span>#{commit.prNumber}</span>
							</div>
						)}
					</div>

					<div className="pt-2 border-t">
						<p className="text-sm whitespace-pre-wrap">{commit.message}</p>
					</div>
				</div>

				<div className="border rounded-lg p-4 space-y-4">
					<h3 className="font-semibold">Classification</h3>

					{classification ? (
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Category</span>
								<span className="capitalize">{classification.category}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Confidence</span>
								<span>{(classification.confidence * 100).toFixed(0)}%</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-muted-foreground">Risk Score</span>
								<div className="flex items-center gap-2">
									<RiskBar score={riskScore} />
									<span>{riskScore.toFixed(0)}</span>
								</div>
							</div>
							{classification.flags && classification.flags.length > 0 && (
								<div className="pt-2">
									<span className="text-muted-foreground block mb-1">Flags</span>
									<div className="flex flex-wrap gap-1">
										{classification.flags.map((flag, i) => (
											<span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">
												{flag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">Not classified</p>
					)}
				</div>
			</div>

			{commit.fileChanges && commit.fileChanges.length > 0 && (
				<div className="border rounded-lg p-4 space-y-4">
					<h3 className="font-semibold">Files Changed ({commit.fileChanges.length})</h3>
					<div className="space-y-1 text-sm font-mono">
						{commit.fileChanges.map((fc, i) => (
							<div key={i} className="flex items-center gap-2">
								<span
									className={`w-5 text-center ${
										fc.changeType === "A"
											? "text-green-600"
											: fc.changeType === "D"
												? "text-red-600"
												: fc.changeType === "R"
													? "text-yellow-600"
													: "text-blue-600"
									}`}>
									{fc.changeType}
								</span>
								<span className="flex-1 truncate">{fc.filePath}</span>
								<span className="text-green-600">+{fc.insertions}</span>
								<span className="text-red-600">-{fc.deletions}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{(causes.length > 0 || causedBugs.length > 0) && (
				<div className="grid gap-6 md:grid-cols-2">
					{causes.length > 0 && (
						<div className="border rounded-lg p-4 space-y-4">
							<h3 className="font-semibold">Possible Causes</h3>
							<div className="space-y-2">
								{causes.map((c) => (
									<Link
										key={c.causeSha}
										href={`/commits/${c.causeSha}`}
										className="block p-2 rounded hover:bg-muted">
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm">{c.cause?.shortSha}</span>
											<span
												className={`text-xs px-1 rounded ${
													c.relationshipType === "root_cause"
														? "bg-red-100 text-red-800"
														: "bg-yellow-100 text-yellow-800"
												}`}>
												{c.relationshipType}
											</span>
											<span className="text-xs text-muted-foreground">
												{(c.confidence * 100).toFixed(0)}% confidence
											</span>
										</div>
										{c.cause && (
											<p className="text-sm text-muted-foreground truncate mt-1">
												{c.cause.message.split("\n")[0]}
											</p>
										)}
									</Link>
								))}
							</div>
						</div>
					)}

					{causedBugs.length > 0 && (
						<div className="border rounded-lg p-4 space-y-4">
							<h3 className="font-semibold">Bugs Caused</h3>
							<div className="space-y-2">
								{causedBugs.map((b) => (
									<Link
										key={b.bugFixSha}
										href={`/commits/${b.bugFixSha}`}
										className="block p-2 rounded hover:bg-muted">
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm">{b.bugFix?.shortSha}</span>
											<span className="text-xs text-muted-foreground">
												Fixed {b.bugAge} days later
											</span>
										</div>
										{b.bugFix && (
											<p className="text-sm text-muted-foreground truncate mt-1">
												{b.bugFix.message.split("\n")[0]}
											</p>
										)}
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

function RiskBadge({ score }: { score: number }) {
	const color =
		score < 25
			? "bg-green-100 text-green-800"
			: score < 50
				? "bg-yellow-100 text-yellow-800"
				: score < 75
					? "bg-orange-100 text-orange-800"
					: "bg-red-100 text-red-800"

	return <span className={`px-2 py-1 rounded text-sm font-medium ${color}`}>Risk: {score.toFixed(0)}</span>
}

function RiskBar({ score }: { score: number }) {
	const filled = Math.ceil(score / 20)
	const color =
		score < 25 ? "bg-green-500" : score < 50 ? "bg-yellow-500" : score < 75 ? "bg-orange-500" : "bg-red-500"

	return (
		<div className="flex gap-0.5">
			{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className={`w-2 h-4 rounded-sm ${i <= filled ? color : "bg-muted"}`} />
			))}
		</div>
	)
}
