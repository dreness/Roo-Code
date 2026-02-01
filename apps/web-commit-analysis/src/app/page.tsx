import { Timeline } from "@/components/timeline/timeline"
import { getTimelineData, getDashboardStats } from "@/actions/timeline"

export const dynamic = "force-dynamic"

export default async function Page() {
	const [releases, stats] = await Promise.all([getTimelineData(), getDashboardStats()])

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Commit Timeline</h2>
				<div className="flex gap-4 text-sm">
					<span className="text-muted-foreground">{stats.totalCommits} commits analyzed</span>
					<span className="text-muted-foreground">Avg risk: {stats.avgRisk.toFixed(1)}</span>
				</div>
			</div>

			<Timeline releases={releases} />
		</div>
	)
}
