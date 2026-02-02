"use client"

import { useState } from "react"
import type { ConclusionType, CandidateVerdict } from "@roo-code/commit-analysis"

interface InvestigationFormProps {
	bugFixSha: string
	investigator?: string
	onInvestigationCreated: (investigationId: number) => void
	onCancel?: () => void
}

export function StartInvestigationForm({
	bugFixSha,
	investigator = "anonymous",
	onInvestigationCreated,
	onCancel,
}: InvestigationFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [investigatorName, setInvestigatorName] = useState(investigator)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)

		try {
			const response = await fetch("/api/investigations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					bugFixSha,
					investigator: investigatorName,
				}),
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error || "Failed to create investigation")
			}

			const { id } = await response.json()
			onInvestigationCreated(id)
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="investigator" className="block text-sm font-medium mb-1">
					Investigator Name
				</label>
				<input
					type="text"
					id="investigator"
					value={investigatorName}
					onChange={(e) => setInvestigatorName(e.target.value)}
					className="w-full px-3 py-2 border rounded-md bg-background"
					placeholder="Your name"
					required
				/>
			</div>

			{error && <p className="text-red-600 text-sm">{error}</p>}

			<div className="flex gap-2">
				<button
					type="submit"
					disabled={isSubmitting}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
					{isSubmitting ? "Starting..." : "Start Investigation"}
				</button>
				{onCancel && (
					<button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-muted">
						Cancel
					</button>
				)}
			</div>
		</form>
	)
}

interface AddCandidateFormProps {
	investigationId: number
	onCandidateAdded: () => void
}

export function AddCandidateForm({ investigationId, onCandidateAdded }: AddCandidateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [candidateSha, setCandidateSha] = useState("")
	const [verdict, setVerdict] = useState<CandidateVerdict>("uncertain")
	const [reasoning, setReasoning] = useState("")
	const [rejectionReason, setRejectionReason] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)

		try {
			const response = await fetch(`/api/investigations/${investigationId}/candidates`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					candidateSha,
					verdict,
					reasoning: reasoning || undefined,
					rejectionReason: verdict === "ruled_out" ? rejectionReason || undefined : undefined,
				}),
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error || "Failed to add candidate")
			}

			// Reset form
			setCandidateSha("")
			setVerdict("uncertain")
			setReasoning("")
			setRejectionReason("")
			onCandidateAdded()
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
			<h4 className="font-medium">Add Candidate Commit</h4>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<label htmlFor="candidateSha" className="block text-sm font-medium mb-1">
						Commit SHA
					</label>
					<input
						type="text"
						id="candidateSha"
						value={candidateSha}
						onChange={(e) => setCandidateSha(e.target.value)}
						className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
						placeholder="abc1234..."
						required
					/>
				</div>

				<div>
					<label htmlFor="verdict" className="block text-sm font-medium mb-1">
						Verdict
					</label>
					<select
						id="verdict"
						value={verdict}
						onChange={(e) => setVerdict(e.target.value as CandidateVerdict)}
						className="w-full px-3 py-2 border rounded-md bg-background">
						<option value="root_cause">Root Cause</option>
						<option value="contributing">Contributing</option>
						<option value="ruled_out">Ruled Out</option>
						<option value="uncertain">Uncertain</option>
					</select>
				</div>
			</div>

			<div>
				<label htmlFor="reasoning" className="block text-sm font-medium mb-1">
					Reasoning
				</label>
				<textarea
					id="reasoning"
					value={reasoning}
					onChange={(e) => setReasoning(e.target.value)}
					className="w-full px-3 py-2 border rounded-md bg-background text-sm"
					placeholder="Why this verdict?"
					rows={2}
				/>
			</div>

			{verdict === "ruled_out" && (
				<div>
					<label htmlFor="rejectionReason" className="block text-sm font-medium mb-1">
						Rejection Reason
					</label>
					<input
						type="text"
						id="rejectionReason"
						value={rejectionReason}
						onChange={(e) => setRejectionReason(e.target.value)}
						className="w-full px-3 py-2 border rounded-md bg-background text-sm"
						placeholder="Why ruled out?"
					/>
				</div>
			)}

			{error && <p className="text-red-600 text-sm">{error}</p>}

			<button
				type="submit"
				disabled={isSubmitting}
				className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
				{isSubmitting ? "Adding..." : "Add Candidate"}
			</button>
		</form>
	)
}

interface CompleteInvestigationFormProps {
	investigationId: number
	onCompleted: () => void
}

export function CompleteInvestigationForm({ investigationId, onCompleted }: CompleteInvestigationFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [conclusionType, setConclusionType] = useState<ConclusionType>("confirmed")
	const [finalCauseSha, setFinalCauseSha] = useState("")
	const [confidenceOverride, setConfidenceOverride] = useState("")
	const [summary, setSummary] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)

		try {
			const response = await fetch(`/api/investigations/${investigationId}/complete`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					conclusionType,
					finalCauseSha: finalCauseSha || undefined,
					confidenceOverride: confidenceOverride ? parseFloat(confidenceOverride) / 100 : undefined,
					summary: summary || undefined,
				}),
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error || "Failed to complete investigation")
			}

			onCompleted()
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg border-green-200 bg-green-50/50">
			<h4 className="font-medium">Complete Investigation</h4>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<label htmlFor="conclusionType" className="block text-sm font-medium mb-1">
						Conclusion
					</label>
					<select
						id="conclusionType"
						value={conclusionType}
						onChange={(e) => setConclusionType(e.target.value as ConclusionType)}
						className="w-full px-3 py-2 border rounded-md bg-background">
						<option value="confirmed">Confirmed - Automated causality was correct</option>
						<option value="rejected">Rejected - Automated causality was wrong</option>
						<option value="inconclusive">Inconclusive - Could not determine</option>
						<option value="new_cause_found">New Cause Found - Different root cause identified</option>
					</select>
				</div>

				<div>
					<label htmlFor="confidenceOverride" className="block text-sm font-medium mb-1">
						Confidence Override (%)
					</label>
					<input
						type="number"
						id="confidenceOverride"
						value={confidenceOverride}
						onChange={(e) => setConfidenceOverride(e.target.value)}
						className="w-full px-3 py-2 border rounded-md bg-background"
						placeholder="e.g., 85"
						min="0"
						max="100"
					/>
				</div>
			</div>

			{(conclusionType === "new_cause_found" || conclusionType === "confirmed") && (
				<div>
					<label htmlFor="finalCauseSha" className="block text-sm font-medium mb-1">
						Final Cause Commit SHA
					</label>
					<input
						type="text"
						id="finalCauseSha"
						value={finalCauseSha}
						onChange={(e) => setFinalCauseSha(e.target.value)}
						className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
						placeholder="abc1234..."
					/>
				</div>
			)}

			<div>
				<label htmlFor="summary" className="block text-sm font-medium mb-1">
					Summary
				</label>
				<textarea
					id="summary"
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
					className="w-full px-3 py-2 border rounded-md bg-background text-sm"
					placeholder="Summary of findings..."
					rows={3}
				/>
			</div>

			{error && <p className="text-red-600 text-sm">{error}</p>}

			<button
				type="submit"
				disabled={isSubmitting}
				className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
				{isSubmitting ? "Completing..." : "Complete Investigation"}
			</button>
		</form>
	)
}
