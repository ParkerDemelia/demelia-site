---
# Drives the "Projects" mesh on /about.
#   kind  → small label on the card (App, Podcast, Series, Site, ...)
#   size  → wide (2 columns) | tall (2 rows) | leave off for a normal tile
#   image → optional cover, e.g. /projects/purity.png (put files in public/)
#   link  → optional; tiles without one aren't clickable

items:
  - name: Maine Purity Test
    kind: App
    desc: How Maine are you? A viral purity test for Mainers.
    link: https://mainepuritytest.vercel.app/
    size: wide

  - name: The Podcast
    kind: Podcast
    desc: My podcast, on YouTube.
    link: https://youtube.com/playlist?list=PLH74yqZlYCjDiLGSItWfetG7WkguSH3sf
    size: tall

  - name: LogoX
    kind: App
    desc: Browser-based logo editor with real-time preview.
    link: https://logox-phi.vercel.app/editor?logo=tech-cube

  - name: Reels series
    kind: Series
    desc: My Instagram reels series.
    link: https://www.instagram.com/parker.demelia/reels/

  - name: Pathfinder
    kind: App
    desc: Interactive pathfinding algorithm visualizer.
    link: https://pathfinder-beta-three.vercel.app/

  - name: Receipt Photo Booth
    kind: Build
    desc: Web-hosted photobooth for memorable photos.
    size: wide
---
