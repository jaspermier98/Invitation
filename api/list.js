const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ids = (await redis.get('rsvp:index')) || [];
    const entries = [];

    for (const id of ids) {
      const rec = await redis.get(`rsvp:${id}`);
      if (rec) {
        // Public list: never expose contact numbers.
        const { contact, ...publicRec } = rec;
        entries.push(publicRec);
      }
    }

    entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    res.status(200).json({ entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load list', detail: String((err && err.message) || err) });
  }
};
