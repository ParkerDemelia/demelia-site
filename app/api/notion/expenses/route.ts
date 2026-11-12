import { getNotionExpenses } from "@/lib/notion-expenses"

// Ensure this route is never statically cached (so Notion updates show on Vercel)
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const expenses = await getNotionExpenses()
    return Response.json({ expenses }, {
      // Short cache so Notion updates appear within ~1 min; remove or increase if you prefer less load on Notion
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("Error fetching Notion expenses:", error)
    return Response.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}
