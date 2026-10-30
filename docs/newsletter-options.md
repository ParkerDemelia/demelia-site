# Newsletter / subscribe options

Undecided — notes from figuring out how to get a custom-styled email signup on the site (Oct 2026).

## Where things stand

- `/blog` pulls posts from the Substack feed (`lib/posts.ts`) and shows them in full at `/blog/<slug>`.
- The subscribe form is **Supascribe** (`components/subscribe-form.tsx`, styled by `.subscribe-embed` in `app/globals.css`).
- Supascribe's free tier caps out at **1,000 views and 100 subscribers**.

## What doesn't work

- **A custom form posting straight to Substack.** Substack's signup API sits behind a bot check, so requests from our server or a plain form are blocked.
- **Rebuilding Supascribe.** Its script sends emails to its own server, which then signs people up on Substack. Doing that ourselves means getting around Substack's bot protection. Not doing that: it's against the rules and could get the publication flagged.
- **Auto-importing into Substack.** There's no public API for adding subscribers. Automating the dashboard's Import button would mean storing a Substack login on the server: it breaks when the cookie expires and risks the account.

## Options

### Staying on Substack

1. **Own list + manual import.** Our own form saves emails to a database (Neon free tier). A weekly job emails me a CSV of new signups (needs a sender like Resend), or a password-protected download page instead. Import it at Substack → Settings → Subscribers → Import (~30s/week). Unlimited, my look, I own the list. Catch: new readers wait until the next import for their first post. Add "or subscribe on Substack directly →" under the form.
2. **Styled "Subscribe on Substack" button.** No email field, just a button in the site's style that opens the Substack subscribe page. Unlimited, can't break, one extra click.
3. **Stay on Supascribe.** Free until the limits, then their paid plan. Third party in the middle of every signup.
4. **Substack's official embed** (`demelia.substack.com/embed`). Unlimited and reliable, but the white card / orange button look.

### Leaving Substack (own the whole thing)

How a lot of people who care about design and owning their audience do it:

- Posts live on the site as markdown in the repo (already writing in Obsidian).
- A newsletter service holds the list and sends emails. These are built for custom signup forms, so the form connects to them officially.
- **RSS-to-email:** the service watches the site's RSS feed and sends new posts automatically. Publishing on the site = newsletter goes out.
- Substack lets you export subscribers as a CSV, which imports into the new service.

Services to look at (check current pricing, free limits may have changed):

- **Buttondown** — small, developer-friendly, markdown-based, RSS-to-email. Closest fit to how I already write.
- **Kit** (formerly ConvertKit) — popular with creators, generous free tier, RSS-to-email.
- **Beehiiv** — closest to Substack's feature set, free tier.

What I'd lose: Substack's app, recommendations and Notes (discovery), likes and comments, and paid subscriptions unless the new service does them. Middle ground: keep Substack as a mirror and cross-post there for discovery, while the site and the list are the real home.

Work if I go this way:

- Me: make the newsletter account, export the subscriber CSV from Substack.
- Code: `/blog` reads markdown posts from the repo instead of the Substack feed, an RSS feed, a styled signup form connected to the service, and a one-time move of existing posts into the repo.

## Leaning

Leaving Substack, with Buttondown or Kit, a site-styled form, and RSS-to-email. If staying, option 1 with the "subscribe on Substack directly" link.
