const ALLOWED_ACTIONS = ['search', 'book', 'page', 'author'];
const API_BASE_URL = 'https://api.turath.io';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const action = req.query.action || 'search';
    if (!ALLOWED_ACTIONS.includes(action)) {
      return res.status(400).json({ error: `Aksi '${action}' tidak valid.` });
    }

    const upstreamUrl = new URL(`/${action}`, API_BASE_URL);
    upstreamUrl.searchParams.set('ver', '3');

    // Salin parameter query selain action
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'action' && value !== undefined && value !== null) {
        upstreamUrl.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; BacoKitab/1.0; +https://bacokitab.com)'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: `Turath API responded with status ${upstreamRes.status}`
      });
    }

    const data = await upstreamRes.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Turath proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(502).json({
      error: 'Gagal menghubungi server Turath.',
      details: error.message
    });
  }
}
