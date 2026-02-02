import priorVerdicts from "./prior-verdicts"
import highRiskNearby from "./high-risk-nearby"
import recentInFiles from "./recent-in-files"
import knownCauses from "./known-causes"
import byAuthorInSubsystem from "./by-author-in-subsystem"
import withFlags from "./with-flags"
import unanalyzedInRange from "./unanalyzed-in-range"

export const candidateQueries = [
	priorVerdicts,
	highRiskNearby,
	recentInFiles,
	knownCauses,
	byAuthorInSubsystem,
	withFlags,
	unanalyzedInRange,
]

export { priorVerdicts, highRiskNearby, recentInFiles, knownCauses, byAuthorInSubsystem, withFlags, unanalyzedInRange }
