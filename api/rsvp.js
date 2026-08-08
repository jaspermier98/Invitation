const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

function normalizeContact(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.slice(-10); // last 10 digits, normalizes 0917... vs +63917... etc.
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};
    const name = (body.name || '').toString().trim();
    const contact = (body.contact || '').toString().trim();
    const pledge = body.pledge === 'yes' ? 'yes' : 'body';
    const item = (body.item || '').toString().trim();

    if (!name || !contact) {
      res.status(400).json({ error: 'Name and contact are required' });
      return;
    }

    const normalizedContact = normalizeContact(contact);
    if (normalizedContact.length >= 7) {
      const existingId = await redis.hget('rsvp:contact-index', normalizedContact);
      if (existingId) {
        res.status(409).json({ error: "This contact number is already on the list." });
        return;
      }
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const record = {
      id,
      name: name.slice(0, 100),
      contact: contact.slice(0, 40),
      pledge,
      item: item.slice(0, 200),
      ts: Date.now(),
    };

    await redis.set(`rsvp:${id}`, record);

    const ids = (await redis.get('rsvp:index')) || [];
    ids.push(id);
    await redis.set('rsvp:index', ids);

    if (normalizedContact.length >= 7) {
      await redis.hset('rsvp:contact-index', { [normalizedContact]: id });
    }

    res.status(200).json({ ok: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save RSVP', detail: String((err && err.message) || err) });
  }
};
