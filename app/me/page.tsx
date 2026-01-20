export default function MePage() {
  const socialLinks = [
    { name: "blog", url: "https://demelia.substack.com" },
    { name: "instagram", url: "https://instagram.com/parker.demelia" },
    { name: "youtube", url: "https://youtube.com/@parker.demelia" },
    { name: "github", url: "https://github.com/parkerdemelia" },
    { name: "email", url: "mailto:parker.demelia@gmail.com" }
  ]

  const gear = [
    { name: "cotopaxi alipa 28l", url: "https://amzn.to/cotopaxi-alipa" },
    { name: "sony a7r v", url: "https://amzn.to/sony-a7rv" },
    { name: "garmin fenix 7", url: "https://amzn.to/garmin-fenix7" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-16 space-y-12">

        

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
                  [{social.name}]
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
                  [{item.name}]
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