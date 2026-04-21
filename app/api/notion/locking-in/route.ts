import { Client } from "@notionhq/client"

export const dynamic = "force-dynamic"

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_LOCKING_IN_DB_ID!

function extractText(prop: any): string {
  if (!prop) return ""
  switch (prop.type) {
    case "title":
      return prop.title?.map((t: any) => t.plain_text).join("") ?? ""
    case "rich_text":
      return prop.rich_text?.map((t: any) => t.plain_text).join("") ?? ""
    case "number":
      return prop.number?.toString() ?? ""
    case "date":
      return prop.date?.start ?? ""
    case "select":
      return prop.select?.name ?? ""
    case "multi_select":
      return prop.multi_select?.map((s: any) => s.name).join(", ") ?? ""
    default:
      return ""
  }
}

export async function GET() {
  try {
    let allResults: any[] = []
    let cursor: string | undefined = undefined

    do {
      const response: any = await notion.dataSources.query({
        data_source_id: databaseId,
        sorts: [{ property: "Date", direction: "descending" }],
        start_cursor: cursor,
        page_size: 100,
      })
      allResults = allResults.concat(response.results)
      cursor = response.has_more ? response.next_cursor : undefined
    } while (cursor)

    const expenses = allResults
      .filter((page: any) =>
        page.properties["Amount"]?.number != null ||
        page.properties["Earned"]?.number != null
      )
      .map((page: any) => {
        const props = page.properties
        const dateProp = props["Date"]
        return {
          id: page.id,
          expense: extractText(props["Expense"]),
          date: dateProp?.date?.start ?? "",
          dateEnd: dateProp?.date?.end ?? "",
          category: extractText(props["Category"]),
          amount: props["Amount"]?.number ?? 0,
          earned: props["Earned"]?.number ?? 0,
          notes: extractText(props["Notes"]),
        }
      })

    return Response.json({ expenses }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("Error fetching Notion locking-in expenses:", error)
    return Response.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}
