import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Laptop, Plane } from "lucide-react"

// Mock affiliate links - replace with actual Amazon affiliate links
const techStack = [
  {
    category: "Development",
    items: [
      {
        name: 'M4 MacBook Air 13"',
        description: "M4 and slim design",
        link: "https://amzn.to/3JUYuix",
      },
      {
        name: "iPhone 16 Pro",
        description: 'Great camera and battery life',
        link: "https://amzn.to/3VhfTnY",
      },
      { name: "Crutial 2TB SSD", description: "Fast and reliable storage", link: "https://amzn.to/42suMre" },
      ,
    ],
  },
  {
    category: "Travel",
    items: [
      {
        name: "Peak Design Travel Backpack",
        description: "45L carry-on optimized for gear",
        link: "https://amazon.com/peak-design-backpack",
      },
      {
        name: "Anker PowerCore 26800",
        description: "High-capacity portable charger",
        link: "https://amazon.com/anker-powercore",
      },
      {
        name: "Sony WH-1000XM5",
        description: "Noise-canceling headphones for flights",
        link: "https://amazon.com/sony-wh1000xm5",
      },
      ,
    ],
  },
]

export function TechStackSection() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Tech & Travel Stack</h2>
        <p className="text-muted-foreground">Tools and gear that power my remote work lifestyle</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {techStack.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                {category.category === "Development" ? (
                  <Laptop className="h-5 w-5 text-primary" />
                ) : (
                  <Plane className="h-5 w-5 text-primary" />
                )}
                {category.category}
              </CardTitle>
              <CardDescription>
                {category.category === "Development"
                  ? "Essential tools for coding and productivity"
                  : "Gear for working from anywhere"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {item.name}
                        </a>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">Links may contain affiliate codes that help support this site</p>
      </div>
    </section>
  )
}
