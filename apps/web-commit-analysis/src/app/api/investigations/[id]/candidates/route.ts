import { NextRequest, NextResponse } from "next/server"
import { addCandidate, type AddCandidateParams } from "@roo-code/commit-analysis"

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * POST /api/investigations/[id]/candidates
 * Adds a candidate commit to an investigation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params
		const investigationId = parseInt(id, 10)

		if (isNaN(investigationId)) {
			return NextResponse.json({ error: "Invalid investigation ID" }, { status: 400 })
		}

		const body = (await request.json()) as Omit<AddCandidateParams, "investigationId">

		if (!body.candidateSha || !body.verdict) {
			return NextResponse.json({ error: "Missing required fields: candidateSha, verdict" }, { status: 400 })
		}

		const validVerdicts = ["root_cause", "contributing", "ruled_out", "uncertain"]
		if (!validVerdicts.includes(body.verdict)) {
			return NextResponse.json(
				{ error: `Invalid verdict. Must be one of: ${validVerdicts.join(", ")}` },
				{ status: 400 },
			)
		}

		const candidate = await addCandidate({
			investigationId,
			candidateSha: body.candidateSha,
			verdict: body.verdict,
			rejectionReason: body.rejectionReason,
			reasoning: body.reasoning,
			orderExamined: body.orderExamined,
		})

		return NextResponse.json(candidate, { status: 201 })
	} catch (error) {
		console.error("Error adding candidate:", error)
		return NextResponse.json({ error: "Failed to add candidate" }, { status: 500 })
	}
}
