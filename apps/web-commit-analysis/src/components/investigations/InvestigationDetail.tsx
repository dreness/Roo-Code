"use client"

import Link from "next/link"
import type {
	CausalityInvestigation,
	InvestigationCandidate,
	InvestigationEvidence,
	ConclusionType,
	CandidateVerdict,
} from "@roo-code/commit-analysis"

export interface InvestigationWithDetails extends CausalityInvestigation {
	candidates: InvestigationCandidate[]
	evidence: InvestigationEvidence[]
}

interface InvestigationDetailProps {
	investigation: InvestigationWithDetails
}

export function InvestigationDetail({ investigation }: InvestigationDetailProps) {
	const isComplete = !!investigation.completedAt

	return (
		<div className="border rounded-lg p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">Investigation #{investigation.id}</h3>
				<StatusBadge isComplete={isComplete} conclusionType={investigation.conclusionType} />
			</div>

			<div className="space-y-2 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Investigator</span>
					<span>{investigation.investigator}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Started</span>
					<span>{investigation.startedAt?.toLocaleString?.() ?? "N/A"}</span>
				</div>
				{investigation.completedAt && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">Completed</span>
						<span>{investigation.completedAt?.toLocaleString?.() ?? "N/A"}</span>
					</div>
				)}
				{investigation.finalCauseSha && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">Final Cause</span>
						<Link
							href={`/commits/${investigation.finalCauseSha}`}
							className="font-mono text-primary underline">
							{investigation.finalCauseSha.slice(0, 7)}
						</Link>
					</div>
				)}
				{investigation.confidenceOverride !== null && investigation.confidenceOverride !== undefined && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">Confidence</span>
						<span>{(investigation.confidenceOverride * 100).toFixed(0)}%</span>
					</div>
				)}
			</div>

			{investigation.summary && (
				<div className="pt-2 border-t">
					<span className="text-muted-foreground text-sm block mb-1">Summary</span>
					<p className="text-sm whitespace-pre-wrap">{investigation.summary}</p>
				</div>
			)}

			{investigation.candidates && investigation.candidates.length > 0 && (
				<div className="pt-2 border-t">
					<h4 className="font-medium text-sm mb-2">
						Candidates Examined ({investigation.candidates.length})
					</h4>
					<div className="space-y-2">
						{investigation.candidates.map((candidate) => (
							<CandidateRow key={candidate.id} candidate={candidate} />
						))}
					</div>
				</div>
			)}

			{investigation.evidence && investigation.evidence.length > 0 && (
				<div className="pt-2 border-t">
					<h4 className="font-medium text-sm mb-2">Evidence ({investigation.evidence.length})</h4>
					<div className="space-y-2">
						{investigation.evidence.map((ev) => (
							<EvidenceRow key={ev.id} evidence={ev} />
						))}
					</div>
				</div>
			)}
		</div>
	)
}

function StatusBadge({ isComplete, conclusionType }: { isComplete: boolean; conclusionType: ConclusionType | null }) {
	if (!isComplete) {
		return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">In Progress</span>
	}

	const conclusionStyles: Record<ConclusionType, string> = {
		confirmed: "bg-green-100 text-green-800",
		rejected: "bg-red-100 text-red-800",
		inconclusive: "bg-gray-100 text-gray-800",
		new_cause_found: "bg-blue-100 text-blue-800",
	}

	const conclusionLabels: Record<ConclusionType, string> = {
		confirmed: "Confirmed",
		rejected: "Rejected",
		inconclusive: "Inconclusive",
		new_cause_found: "New Cause Found",
	}

	const style = conclusionType ? conclusionStyles[conclusionType] : "bg-gray-100 text-gray-800"
	const label = conclusionType ? conclusionLabels[conclusionType] : "Unknown"

	return <span className={`px-2 py-0.5 rounded text-xs ${style}`}>{label}</span>
}

function CandidateRow({ candidate }: { candidate: InvestigationCandidate }) {
	const verdictStyles: Record<CandidateVerdict, string> = {
		root_cause: "bg-red-100 text-red-800",
		contributing: "bg-orange-100 text-orange-800",
		ruled_out: "bg-gray-100 text-gray-800",
		uncertain: "bg-yellow-100 text-yellow-800",
	}

	const verdictLabels: Record<CandidateVerdict, string> = {
		root_cause: "Root Cause",
		contributing: "Contributing",
		ruled_out: "Ruled Out",
		uncertain: "Uncertain",
	}

	return (
		<div className="p-2 bg-muted/50 rounded text-sm">
			<div className="flex items-center gap-2">
				<Link href={`/commits/${candidate.candidateSha}`} className="font-mono text-primary underline">
					{candidate.candidateSha.slice(0, 7)}
				</Link>
				<span className={`px-1.5 py-0.5 rounded text-xs ${verdictStyles[candidate.verdict]}`}>
					{verdictLabels[candidate.verdict]}
				</span>
				{candidate.orderExamined !== null && candidate.orderExamined !== undefined && (
					<span className="text-xs text-muted-foreground">#{candidate.orderExamined}</span>
				)}
			</div>
			{candidate.reasoning && <p className="mt-1 text-muted-foreground">{candidate.reasoning}</p>}
			{candidate.rejectionReason && (
				<p className="mt-1 text-muted-foreground italic">Rejection: {candidate.rejectionReason}</p>
			)}
		</div>
	)
}

function EvidenceRow({ evidence }: { evidence: InvestigationEvidence }) {
	const typeLabels: Record<string, string> = {
		blame: "Git Blame",
		diff: "Git Diff",
		bisect: "Git Bisect",
		log: "Git Log",
		manual_note: "Note",
	}

	return (
		<div className="p-2 bg-muted/50 rounded text-sm">
			<div className="flex items-center gap-2">
				<span className="bg-muted px-1.5 py-0.5 rounded text-xs">
					{typeLabels[evidence.evidenceType] || evidence.evidenceType}
				</span>
				{evidence.filePath && <span className="font-mono text-xs truncate">{evidence.filePath}</span>}
				{evidence.capturedAt && (
					<span className="text-xs text-muted-foreground">
						{evidence.capturedAt.toLocaleString?.() ?? ""}
					</span>
				)}
			</div>
			{evidence.contentPreview && (
				<pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">{evidence.contentPreview}</pre>
			)}
		</div>
	)
}
