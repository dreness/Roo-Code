import { NextRequest, NextResponse } from "next/server"
import { completeInvestigation, type CompleteInvestigationParams } from "@roo-code/commit-analysis"

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * PATCH /api/investigations/[id]/complete
 * Completes an investigation with conclusion details
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params
		const investigationId = parseInt(id, 10)

		if (isNaN(investigationId)) {
			return NextResponse.json({ error: "Invalid investigation ID" }, { status: 400 })
		}

		const body = (await request.json()) as Omit<CompleteInvestigationParams, "investigationId">

		if (!body.conclusionType) {
			return NextResponse.json({ error: "Missing required field: conclusionType" }, { status: 400 })
		}

		const validConclusions = ["confirmed", "rejected", "inconclusive", "new_cause_found"]
		if (!validConclusions.includes(body.conclusionType)) {
			return NextResponse.json(
				{ error: `Invalid conclusionType. Must be one of: ${validConclusions.join(", ")}` },
				{ status: 400 },
			)
		}

		const investigation = await completeInvestigation({
			investigationId,
			conclusionType: body.conclusionType,
			finalCauseSha: body.finalCauseSha,
			confidenceOverride: body.confidenceOverride,
			summary: body.summary,
		})

		return NextResponse.json(investigation)
	} catch (error) {
		console.error("Error completing investigation:", error)
		return NextResponse.json({ error: "Failed to complete investigation" }, { status: 500 })
	}
}
