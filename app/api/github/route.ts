export async function GET() {
  try {
    console.log("[v0] Fetching GitHub repositories...")

    // Replace 'parkerdemelia' with actual GitHub username
    const username = process.env.GITHUB_USERNAME || "parkerdemelia"
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: {
        "User-Agent": "Parker-DeMelia-Website",
      },
    })

    if (!response.ok) {
      console.log("[v0] GitHub API fetch failed with status:", response.status)
      throw new Error(`HTTP ${response.status}`)
    }

    const repos = await response.json()
    console.log("[v0] Successfully fetched", repos.length, "repositories")

    // Transform the data to match our component needs
    const projects = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description available",
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      updated: repo.updated_at,
    }))

    return Response.json({ projects })
  } catch (error) {
    console.log("[v0] Error fetching GitHub repos:", error)

    // Return fallback data
    return Response.json({
      projects: [
        {
          id: 1,
          name: "personal-website",
          description: "My minimalistic personal website built with Next.js",
          url: "https://github.com/parkerdemelia/personal-website",
          language: "TypeScript",
          stars: 12,
          updated: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          name: "travel-tracker",
          description: "A React app to track and visualize travel destinations",
          url: "https://github.com/parkerdemelia/travel-tracker",
          language: "JavaScript",
          stars: 8,
          updated: "2024-01-10T14:20:00Z",
        },
        {
          id: 3,
          name: "api-wrapper",
          description: "Python wrapper for various travel and weather APIs",
          url: "https://github.com/parkerdemelia/api-wrapper",
          language: "Python",
          stars: 5,
          updated: "2024-01-05T09:15:00Z",
        },
      ],
    })
  }
}
