import { NextRequest, NextResponse } from "next/server"
import {
	createInvestigation,
	getInvestigationsForBugFix,
	type CreateInvestigationParams,
} from "@roo-code/commit-analysis"

/**
 * POST /api/investigations
 * Creates a new investigation for a bug fix commit
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as CreateInvestigationParams

		if (!body.bugFixSha || !body.investigator) {
			return NextResponse.json({ error: "Missing required fields: bugFixSha, investigator" }, { status: 400 })
		}

		const investigationId = await createInvestigation({
			bugFixSha: body.bugFixSha,
			investigator: body.investigator,
		})

		return NextResponse.json({ id: investigationId }, { status: 201 })
	} catch (error) {
		console.error("Error creating investigation:", error)
		return NextResponse.json({ error: "Failed to create investigation" }, { status: 500 })
	}
}

/**
 * GET /api/investigations?bugFixSha=<sha>
 * Gets all investigations for a given bug fix commit
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const bugFixSha = searchParams.get("bugFixSha")

		if (!bugFixSha) {
			return NextResponse.json({ error: "Missing required query parameter: bugFixSha" }, { status: 400 })
		}

		const investigations = await getInvestigationsForBugFix(bugFixSha)

		return NextResponse.json(investigations)
	} catch (error) {
		console.error("Error fetching investigations:", error)
		return NextResponse.json({ error: "Failed to fetch investigations" }, { status: 500 })
	}
}
