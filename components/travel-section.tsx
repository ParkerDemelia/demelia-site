import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, ExternalLink } from "lucide-react"

// Mock travel updates
const travelUpdates = [
  {
    location: "Antigua, Guatemala",
    date: "June 2025",
    image: "/antigua.jpg",
    description:
      "Antigua, Guatemala is a beautiful city with a lot of history and culture. ",
    highlights: ["Antigua", "Local coworking spaces", "Traditional markets"],
  },
  {
    location: "Medellin, Colombia",
    date: "August 2025",
    image: "/medellin.jpg",
    description:
      "Medellin, Colombia is a very large city, can spend a lot of time exploring the city and the surrounding area.",
    highlights: ["Medellin", "Comuna 13", "Traditional markets"],
  },
  /* {
    location: "Tokyo, Japan",
    date: "November 2023",
    image: "/tokyo-japan-neon-lights-city-night.jpg",
    description:
      "Immersing in the intersection of tradition and technology. Tokyo's efficiency and innovation continue to inspire.",
    highlights: ["Shibuya crossing", "Tech district tours", "Traditional temples"],
  } */,
]

export function TravelSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Travel Updates</h2>
        <p className="text-muted-foreground">Adventures from around the world</p>
      </div>

      <div className="space-y-8">
        {travelUpdates.map((update, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={update.image || "/placeholder.svg"}
                  alt={`${update.location} travel photo`}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {update.location}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {update.date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{update.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Highlights:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {update.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" asChild>
          <a href="https://instagram.com/parker.demelia" target="_blank" rel="noopener noreferrer">
            Follow My Journey <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  )
}
