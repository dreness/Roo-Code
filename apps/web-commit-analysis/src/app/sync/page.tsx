import { getSyncData } from "@/actions/sync"

export const dynamic = "force-dynamic"

interface Props {
	searchParams: Promise<{ upstream?: string; local?: string; maxRisk?: string }>
}

export default async function SyncPage({ searchParams }: Props) {
	const params = await searchParams
	const upstream = params.upstream || "origin/main"
	const local = params.local || "HEAD"
	const maxRisk = parseInt(params.maxRisk || "60", 10)

	const { summary, recommendation } = await getSyncData(upstream, local, maxRisk)

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Sync Advisor</h2>
			</div>

			<div className="border rounded-lg p-4 space-y-4">
				<h3 className="font-semibold">Configuration</h3>
				<form className="grid gap-4 md:grid-cols-4">
					<div>
						<label className="text-sm text-muted-foreground block mb-1">Upstream</label>
						<input
							type="text"
							name="upstream"
							defaultValue={upstream}
							className="w-full border rounded px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label className="text-sm text-muted-foreground block mb-1">Local</label>
						<input
							type="text"
							name="local"
							defaultValue={local}
							className="w-full border rounded px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label className="text-sm text-muted-foreground block mb-1">Max Risk</label>
						<input
							type="number"
							name="maxRisk"
							defaultValue={maxRisk}
							className="w-full border rounded px-3 py-2 text-sm"
						/>
					</div>
					<div className="flex items-end">
						<button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
							Analyze
						</button>
					</div>
				</form>
			</div>

			{summary && (
				<div className="grid gap-6 md:grid-cols-3">
					<div className="border rounded-lg p-4">
						<div className="text-3xl font-bold">{summary.behind}</div>
						<div className="text-sm text-muted-foreground">Commits behind</div>
					</div>
					<div className="border rounded-lg p-4">
						<div className="text-3xl font-bold">{summary.ahead}</div>
						<div className="text-sm text-muted-foreground">Commits ahead</div>
					</div>
					<div className="border rounded-lg p-4">
						<div className="text-3xl font-bold">
							{summary.lastSyncDate ? summary.lastSyncDate.toLocaleDateString() : "N/A"}
						</div>
						<div className="text-sm text-muted-foreground">Last sync</div>
					</div>
				</div>
			)}

			{recommendation && (
				<div className="border rounded-lg p-4 space-y-4">
					<h3 className="font-semibold">Recommendation</h3>

					<div
						className={`p-4 rounded-lg ${
							recommendation.safeToSync
								? "bg-green-50 border border-green-200"
								: "bg-yellow-50 border border-yellow-200"
						}`}>
						{recommendation.safeToSync ? (
							<div className="flex items-center gap-2">
								<span className="text-green-600 text-xl">&#10003;</span>
								<span className="font-medium">Safe to sync to {upstream}</span>
							</div>
						) : (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="text-yellow-600 text-xl">&#9888;</span>
									<span className="font-medium">
										Consider syncing to {recommendation.recommendedCommit.slice(0, 8)}
									</span>
								</div>
								<p className="text-sm text-muted-foreground">This limits risk to acceptable levels.</p>
							</div>
						)}
					</div>

					<div className="grid gap-4 md:grid-cols-4">
						<div>
							<div className="text-2xl font-bold">{recommendation.commitCount}</div>
							<div className="text-sm text-muted-foreground">Total commits</div>
						</div>
						<div>
							<div className="text-2xl font-bold">{recommendation.breakdown.features}</div>
							<div className="text-sm text-muted-foreground">Features</div>
						</div>
						<div>
							<div className="text-2xl font-bold">{recommendation.breakdown.fixes}</div>
							<div className="text-sm text-muted-foreground">Fixes</div>
						</div>
						<div>
							<div className="text-2xl font-bold">{recommendation.totalRisk.toFixed(1)}</div>
							<div className="text-sm text-muted-foreground">Aggregate risk</div>
						</div>
					</div>

					{recommendation.warnings.length > 0 && (
						<div className="space-y-2">
							<h4 className="font-medium text-sm">Warnings</h4>
							<ul className="space-y-1">
								{recommendation.warnings.map((warning, i) => (
									<li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
										<span className="text-yellow-600">&#9888;</span>
										{warning}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}

			{!summary && !recommendation && (
				<div className="text-center py-12 text-muted-foreground">
					<p>Unable to analyze sync status.</p>
					<p className="mt-2 text-sm">
						Make sure you have analyzed commits first and the repository is accessible.
					</p>
				</div>
			)}
		</div>
	)
}
