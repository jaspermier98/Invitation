const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ids = (await kv.get('rsvp:index')) || [];
    const entries = [];

    for (const id of ids) {
      const rec = await kv.get(`rsvp:${id}`);
      if (rec) entries.push(rec);
    }

    entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    res.status(200).json({ entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load list' });
  }
};
