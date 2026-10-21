import { redirect } from "next/navigation"

// The about page is now the home page.
export default function AboutPage() {
  redirect("/")
}
