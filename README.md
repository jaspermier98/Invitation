# Fishing Scam — Event Invite

Static invite page + a tiny live "Catch List" (RSVP board) backed by Upstash Redis.

## What's inside
- `public/index.html` — the whole site (dark mode, photos embedded, RSVP form)
- `api/rsvp.js` — serverless function, saves a submission
- `api/list.js` — serverless function, returns all submissions
- `package.json` — one dependency: `@upstash/redis`

(Note: Vercel's native "KV" product was retired — storage now runs through the
Upstash integration instead. That's what these files use.)

## Deploy (5 min)

1. **Push this folder to a GitHub repo** (or drag-and-drop deploy via the Vercel
   dashboard / `vercel` CLI — either works).

2. **Import the repo into Vercel** at vercel.com → New Project → pick the repo → Deploy.
   Framework preset: "Other" (no build step needed, it's static + API routes).

3. **Add an Upstash Redis database** (this is what makes the Catch List live/shared):
   - In your Vercel project → **Storage** tab → **Create Database** (or **Marketplace**
     → search **Upstash**) → choose **Redis**.
   - Connect/link it to this project. Vercel auto-injects the required env vars
     (`KV_REST_API_URL` / `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` /
     `UPSTASH_REDIS_REST_TOKEN` depending on how it's provisioned — the code
     checks for both automatically via `Redis.fromEnv()`).

4. **Redeploy** — env vars only apply to deployments made *after* you link the
   database, so if you already deployed once, go to Deployments → ⋯ on the
   latest one → **Redeploy**.

5. Visit your live URL (something like `fishing-scam-invite.vercel.app`) and send
   that link out. Anyone who opens it can see the site and RSVP; everyone who
   RSVPs shows up in the live Catch List for everyone else viewing the page.

## Troubleshooting
If clicking Confirm does nothing / the Catch List never updates:
- Open DevTools → Network tab → click Confirm → check the `rsvp` request's status.
  A `500` means the database isn't connected yet (see step 3) or the deployment
  needs a redeploy after linking it. The error message shown on the page will
  now include the actual server error detail to make this easier to diagnose.
- Check Vercel dashboard → your project → **Logs** for the `rsvp`/`list`
  function errors.

## Notes
- No auth, no rate limiting — it's a friends-outing invite, not a production app.
  If you want to hide contact numbers from the public list later, that's a
  one-line change in `public/index.html`'s `renderBoard()` function.
- Free tier of Upstash Redis is more than enough for this use case.
