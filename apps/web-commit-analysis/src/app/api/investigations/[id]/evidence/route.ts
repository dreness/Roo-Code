import { NextRequest, NextResponse } from "next/server"
import { addEvidence, type AddEvidenceParams } from "@roo-code/commit-analysis"

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * POST /api/investigations/[id]/evidence
 * Adds evidence to an investigation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params
		const investigationId = parseInt(id, 10)

		if (isNaN(investigationId)) {
			return NextResponse.json({ error: "Invalid investigation ID" }, { status: 400 })
		}

		const body = (await request.json()) as Omit<AddEvidenceParams, "investigationId">

		if (!body.evidenceType) {
			return NextResponse.json({ error: "Missing required field: evidenceType" }, { status: 400 })
		}

		const validEvidenceTypes = ["blame", "diff", "bisect", "log", "manual_note"]
		if (!validEvidenceTypes.includes(body.evidenceType)) {
			return NextResponse.json(
				{ error: `Invalid evidenceType. Must be one of: ${validEvidenceTypes.join(", ")}` },
				{ status: 400 },
			)
		}

		const evidence = await addEvidence({
			investigationId,
			evidenceType: body.evidenceType,
			filePath: body.filePath,
			contentHash: body.contentHash,
			contentPreview: body.contentPreview,
		})

		return NextResponse.json(evidence, { status: 201 })
	} catch (error) {
		console.error("Error adding evidence:", error)
		return NextResponse.json({ error: "Failed to add evidence" }, { status: 500 })
	}
}
