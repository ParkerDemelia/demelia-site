import { Instagram, Rss, Mail, Github, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">PARKER DEMELIA</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            I'm a cs grad looking to create something cool while i travel the world. 
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center items-center gap-4 pt-2">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://instagram.com/parker.demelia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://x.com/parkerdemelia" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/parkerdemelia" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://youtube.com/@parker.demelia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://demelia.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Substack Blog"
              >
                <Rss className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="mailto:parker.demelia@gmail.com" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
