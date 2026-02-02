import { NextRequest, NextResponse } from "next/server"
import { getInvestigationWithDetails } from "@roo-code/commit-analysis"

interface RouteParams {
	params: Promise<{ id: string }>
}

/**
 * GET /api/investigations/[id]
 * Gets full investigation details including candidates and evidence
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params
		const investigationId = parseInt(id, 10)

		if (isNaN(investigationId)) {
			return NextResponse.json({ error: "Invalid investigation ID" }, { status: 400 })
		}

		const investigation = await getInvestigationWithDetails(investigationId)

		if (!investigation) {
			return NextResponse.json({ error: "Investigation not found" }, { status: 404 })
		}

		return NextResponse.json(investigation)
	} catch (error) {
		console.error("Error fetching investigation:", error)
		return NextResponse.json({ error: "Failed to fetch investigation" }, { status: 500 })
	}
}
