"use client"

import { useState, useEffect, useCallback } from "react"
import { InvestigationDetail, type InvestigationWithDetails } from "./InvestigationDetail"
import { StartInvestigationForm, AddCandidateForm, CompleteInvestigationForm } from "./InvestigationForms"

interface InvestigationPanelProps {
	bugFixSha: string
	hasCausality: boolean
	humanVerified?: boolean
}

export function InvestigationPanel({ bugFixSha, hasCausality, humanVerified }: InvestigationPanelProps) {
	const [investigations, setInvestigations] = useState<InvestigationWithDetails[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showStartForm, setShowStartForm] = useState(false)
	const [activeInvestigationId, setActiveInvestigationId] = useState<number | null>(null)

	const fetchInvestigations = useCallback(async () => {
		try {
			setIsLoading(true)
			const response = await fetch(`/api/investigations?bugFixSha=${bugFixSha}`)
			if (!response.ok) {
				throw new Error("Failed to fetch investigations")
			}
			const data = await response.json()

			// Fetch full details for each investigation
			const detailedInvestigations = await Promise.all(
				data.map(async (inv: { id: number }) => {
					const detailResponse = await fetch(`/api/investigations/${inv.id}`)
					if (detailResponse.ok) {
						return detailResponse.json()
					}
					return null
				}),
			)

			setInvestigations(detailedInvestigations.filter(Boolean))

			// Set active investigation if there's an incomplete one
			const incomplete = detailedInvestigations.find(
				(inv: InvestigationWithDetails | null) => inv && !inv.completedAt,
			)
			if (incomplete) {
				setActiveInvestigationId(incomplete.id)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred")
		} finally {
			setIsLoading(false)
		}
	}, [bugFixSha])

	useEffect(() => {
		fetchInvestigations()
	}, [fetchInvestigations])

	const handleInvestigationCreated = async (investigationId: number) => {
		setShowStartForm(false)
		setActiveInvestigationId(investigationId)
		await fetchInvestigations()
	}

	const handleRefresh = async () => {
		await fetchInvestigations()
	}

	const activeInvestigation = investigations.find((inv) => inv.id === activeInvestigationId)
	const showStartButton = hasCausality && !humanVerified && !activeInvestigation && investigations.length === 0

	if (isLoading) {
		return (
			<div className="border rounded-lg p-4">
				<p className="text-muted-foreground">Loading investigations...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="border rounded-lg p-4">
				<p className="text-red-600">{error}</p>
				<button onClick={handleRefresh} className="mt-2 text-primary underline text-sm">
					Retry
				</button>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">Causality Investigation</h3>
				{!showStartForm && !activeInvestigation && (
					<button
						onClick={() => setShowStartForm(true)}
						className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
						{showStartButton ? "Start Investigation" : "New Investigation"}
					</button>
				)}
			</div>

			{showStartForm && (
				<div className="border rounded-lg p-4">
					<StartInvestigationForm
						bugFixSha={bugFixSha}
						onInvestigationCreated={handleInvestigationCreated}
						onCancel={() => setShowStartForm(false)}
					/>
				</div>
			)}

			{activeInvestigation && !activeInvestigation.completedAt && (
				<div className="space-y-4">
					<InvestigationDetail investigation={activeInvestigation} />
					<AddCandidateForm investigationId={activeInvestigation.id} onCandidateAdded={handleRefresh} />
					<CompleteInvestigationForm investigationId={activeInvestigation.id} onCompleted={handleRefresh} />
				</div>
			)}

			{investigations.length > 0 && (
				<div className="space-y-2">
					{activeInvestigation?.completedAt && <InvestigationDetail investigation={activeInvestigation} />}
					{investigations
						.filter((inv) => inv.id !== activeInvestigationId)
						.map((inv) => (
							<InvestigationDetail key={inv.id} investigation={inv} />
						))}
				</div>
			)}

			{!showStartForm && investigations.length === 0 && !activeInvestigation && (
				<div className="border rounded-lg p-4 text-center">
					<p className="text-muted-foreground text-sm">
						{hasCausality
							? "No investigations yet. Start one to verify automated causality analysis."
							: "No automated causality data available for this commit."}
					</p>
				</div>
			)}
		</div>
	)
}
