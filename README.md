# Fishing Scam — Event Invite

Static invite page + a tiny live "Catch List" (RSVP board) backed by Vercel KV.

## What's inside
- `public/index.html` — the whole site (dark mode, photos embedded, RSVP form)
- `api/rsvp.js` — serverless function, saves a submission
- `api/list.js` — serverless function, returns all submissions
- `package.json` — one dependency: `@vercel/kv`

## Deploy (5 min)

1. **Push this folder to a GitHub repo** (or drag-and-drop deploy via the Vercel dashboard / `vercel` CLI — either works).

2. **Import the repo into Vercel** at vercel.com → New Project → pick the repo → Deploy.
   Framework preset: "Other" (no build step needed, it's static + API routes).

3. **Add a KV database** (this is what makes the Catch List live/shared):
   - In your Vercel project → **Storage** tab → **Create Database** → **KV** (Upstash-backed).
   - Connect it to this project. Vercel auto-injects the required env vars
     (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) — no manual config needed.

4. **Redeploy** (Vercel usually prompts you to redeploy after connecting storage;
   if not, go to Deployments → ⋯ → Redeploy).

5. Visit your live URL (something like `fishing-scam-invite.vercel.app`) and send
   that link out. Anyone who opens it can see the site and RSVP; everyone who
   RSVPs shows up in the live Catch List for everyone else viewing the page.

## Notes
- No auth, no rate limiting — it's a friends-outing invite, not a production app.
  If you want to hide contact numbers from the public list later, that's a
  one-line change in `public/index.html`'s `renderBoard()` function.
- Free tier of Vercel KV is more than enough for this use case.
