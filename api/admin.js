const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

function checkAuth(req) {
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) return { ok: false, reason: 'no-password-set' };
  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== adminPass) return { ok: false, reason: 'wrong-password' };
  return { ok: true };
}

function normalizeContact(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.slice(-10);
}

module.exports = async (req, res) => {
  const auth = checkAuth(req);
  if (!auth.ok) {
    if (auth.reason === 'no-password-set') {
      res.status(500).json({ error: 'ADMIN_PASSWORD is not set on the server. Add it in Vercel project settings > Environment Variables.' });
    } else {
      res.status(401).json({ error: 'Invalid admin password.' });
    }
    return;
  }

  const action = (req.query && req.query.action) || 'list';

  try {
    if (action === 'list' && req.method === 'GET') {
      const ids = (await redis.get('rsvp:index')) || [];
      const entries = [];
      for (const id of ids) {
        const rec = await redis.get(`rsvp:${id}`);
        if (rec) entries.push(rec); // full record, contact included — admin only
      }
      entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      res.status(200).json({ entries });
      return;
    }

    if (action === 'delete' && req.method === 'POST') {
      const body = req.body || {};
      const idsToDelete = Array.isArray(body.ids) ? body.ids : [];
      if (idsToDelete.length === 0) {
        res.status(400).json({ error: 'No ids provided.' });
        return;
      }

      const existingIds = (await redis.get('rsvp:index')) || [];
      const idSet = new Set(idsToDelete);

      for (const id of idsToDelete) {
        const rec = await redis.get(`rsvp:${id}`);
        if (rec && rec.contact) {
          const normalized = normalizeContact(rec.contact);
          if (normalized.length >= 7) {
            await redis.hdel('rsvp:contact-index', normalized);
          }
        }
        await redis.del(`rsvp:${id}`);
      }

      const remainingIds = existingIds.filter((id) => !idSet.has(id));
      await redis.set('rsvp:index', remainingIds);

      res.status(200).json({ ok: true, deleted: idsToDelete.length });
      return;
    }

    res.status(404).json({ error: 'Unknown admin action.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Admin operation failed', detail: String((err && err.message) || err) });
  }
};
