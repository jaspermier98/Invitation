const { kv } = require('@vercel/kv');

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

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const record = {
      id,
      name: name.slice(0, 100),
      contact: contact.slice(0, 40),
      pledge,
      item: item.slice(0, 200),
      ts: Date.now(),
    };

    await kv.set(`rsvp:${id}`, record);

    const ids = (await kv.get('rsvp:index')) || [];
    ids.push(id);
    await kv.set('rsvp:index', ids);

    res.status(200).json({ ok: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save RSVP' });
  }
};
