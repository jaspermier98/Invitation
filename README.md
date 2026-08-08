# Fishing Scam — Event Invite

Static invite page + a live "Catch List" (RSVP board) backed by Upstash Redis,
plus a password-gated admin panel for managing entries.

## What's inside
- `public/index.html` — the whole site (dark mode, photos embedded, RSVP form,
  image lightbox, admin panel)
- `api/rsvp.js` — saves a submission (blocks duplicate contact numbers)
- `api/list.js` — public endpoint, returns entries WITHOUT contact numbers
- `api/admin.js` — password-gated endpoint: full entry list (with contact info),
  bulk delete
- `package.json` — one dependency: `@upstash/redis`

## Deploy (5 min)

1. **Push this folder to a GitHub repo** (or drag-and-drop deploy via the Vercel
   dashboard / `vercel` CLI).

2. **Import the repo into Vercel** — framework preset "Other" (static + API routes,
   no build step).

3. **Add an Upstash Redis database**: Storage tab → Marketplace → **Upstash** →
   **Redis** → connect to this project. Vercel injects the env vars automatically
   (`KV_REST_API_URL`/`TOKEN` or `UPSTASH_REDIS_REST_URL`/`TOKEN` — the code
   checks both via `Redis.fromEnv()`).

4. **Set an admin password**: Project → **Settings** → **Environment Variables** →
   add `ADMIN_PASSWORD` with whatever password you want to use to access the
   admin panel. Apply it to Production (and Preview/Development if you want).

5. **Redeploy** — env vars only apply to deployments made *after* you add them,
   so redeploy once you've set both the database and `ADMIN_PASSWORD`
   (Deployments → ⋯ → Redeploy).

6. Visit your live URL and send the link out.

## Using the admin panel
- A small ⚙ icon sits in the bottom-right corner of the site (visible to anyone,
  but does nothing without the password).
- Click it, enter the `ADMIN_PASSWORD` you set in step 4.
- From there you can see everyone's name, contact number, pledge, and submission
  time, see a quick pledge-split chart, select and delete entries in bulk, and
  export everything as a CSV.
- The public site (and the `/api/list` endpoint) never expose contact numbers —
  only the admin panel does.

## Notes
- **Duplicate prevention**: submissions are deduped by phone number (normalized —
  ignores spaces, dashes, and +63 vs 0 prefixes), not by IP. IP-based blocking
  was skipped on purpose: people at the same house/office/wifi would share an IP,
  which would incorrectly block friends from RSVPing together. A browser also
  remembers locally after a successful submit and shows a reminder if you try
  again on the same device — easy to bypass (incognito, another device) but
  enough for casual accidental double-submits.
- No general-purpose auth beyond the one shared admin password — fine for a
  friends outing, not meant for anything more sensitive.
- Free tier of Upstash Redis is more than enough for this use case.

## Troubleshooting
- Confirm button does nothing / Catch List doesn't update → check DevTools →
  Network tab → the `rsvp` or `list` request's status and response body (error
  messages are shown directly in the UI now too).
- Admin login says "ADMIN_PASSWORD is not set" → you deployed before adding the
  env var, or added it to the wrong environment — redeploy after setting it.
