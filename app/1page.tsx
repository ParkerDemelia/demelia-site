import { Header } from "@/components/header"
import { BlogSection } from "@/components/blog-section"
import { PodcastSection } from "@/components/podcast-section"
import { SocialSection } from "@/components/social-section"
import { TravelSection } from "@/components/travel-section"
import { TechStackSection } from "@/components/tech-stack-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-16">
        <BlogSection />
        <PodcastSection />
        <SocialSection />
        <TravelSection />
        <TechStackSection />
      </main>
      <Footer />
    </div>
  )
}
