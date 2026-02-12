import { Button } from "@/components/ui/button"
import { Mail, Instagram, Github, Youtube, Rss } from "lucide-react"
import { LinkedBlog } from "@/components/linked-blog"

export default function HomePage() {
  const socialLinks = [
    { name: "instagram", url: "https://instagram.com/parker.demelia" },
    { name: "youtube", url: "https://youtube.com/@parker.demelia" },
    { name: "blog", url: "https://demelia.substack.com" },
    { name: "tiktok", url: "https://www.tiktok.com/@parker.demelia" },
    { name: "email", url: "mailto:parker.demelia@gmail.com" }
  ]

  const gear = [
    
    { name: "cotopaxi allpa 28L", url: "https://amzn.to/49UnBvc" },
    { name: "altra lone peak 9+", url: "https://amzn.to/3ZrA2te" },
    { name: "eddie bauer cloud cap", url: "https://amzn.to/4r1xvBV" },
    { name: "dji osmo pocket 3", url: "https://amzn.to/45fO98E" },
    /*{ name: "m4 macbook air 13", url: "https://amzn.to/4qBMHG8" },*/
    /*{ name: "crucial 2TB ssd", url: "https://amzn.to/3YRO4Er" },*/
  ]
  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-16">
        <br/><br/><br/><br/>

    {/* <img src="/park.png" alt="Parker Demelia" className="w-100 h-auto mx-auto rounded-full" /> */}

      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">PARKER DEMELIA</h1>
          <p className="text-md text-muted-foreground max-w-2xl mx-auto text-balance">
          
It's actually really easy.<br/>   </p>

          {/* Social Media Icons */}
          {/*
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
          </div> */}
        </div>
      </div>

    </header>

  {/* <LinkedBlog /> */}

<p className="text-center text-sm text-muted-foreground">



  youtube video:{" "}
  <a
    href="https://www.youtube.com/watch?v=H2q33HVW5ck"
    className="text-primary font-semibold underline hover:brightness-125"
    target="_blank"
    rel="noopener noreferrer"
  >
    
to take the first steps
<br/>
  </a>


  latest blog post:{" "}
  <a
    href="https://open.substack.com/pub/demelia/p/dos-extranos?r=1ztyoa&utm_campaign=post&utm_medium=web"
    className="text-primary font-semibold underline hover:brightness-125"
    target="_blank"
    rel="noopener noreferrer"
  >
    dos extranos
  </a>


  {/*
  podcast episode:{" "}
  <a
    href="https://open.substack.com/pub/demelia/p/dos-extranos?r=1ztyoa&utm_campaign=post&utm_medium=web"
    className="text-primary font-semibold underline hover:brightness-125"
    target="_blank"
    rel="noopener noreferrer"
  >
    dos extranos
  </a>
  <br/>
  <br/>
  */}
  
  
</p>

  {/* Socials Section */}
  <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">socials</h2>
          <div className="space-y-2">
            {socialLinks.map((social) => (
              <div key={social.name}>
                <a
                  href={social.url}
                  target={social.url.startsWith('http') ? "_blank" : undefined}
                  rel={social.url.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="text-primary hover:underline"
                >
                  [ {social.name} ]
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Gear Section */}
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">gear</h2>
          <div className="space-y-2">
            {gear.map((item) => (
              <div key={item.name}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  [ {item.name} ]
                </a>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            links may contain affiliate codes
          </div>
        </section>

        
      </main>
    </div>
  )
}
