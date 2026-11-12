const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB

const isPrivateOrLocalHost = (hostname) => {
  const h = (hostname || '').toLowerCase();
  if (!h) return true;
  if (h === 'localhost' || h === '::1' || h === '[::1]') return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^0\./.test(h)) return true;
  if (/^192\.168\./.test(h) || /^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  return false;
};

const resolveDownloadUrl = (rawUrl) => {
  const clean = rawUrl.trim();

  // Google Drive /file/d/ID/...
  const driveFileMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveFileMatch[1]}`;
  }

  // Google Drive ?id=ID
  if (clean.includes('drive.google.com')) {
    try {
      const u = new URL(clean);
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    } catch {
      // fall through
    }
  }

  // Dropbox share link
  if (clean.includes('dropbox.com')) {
    return clean
      .replace(/[?&]dl=0/, (m) => m[0] + 'raw=1')
      .replace(/[?&]dl=1/, (m) => m[0] + 'raw=1');
  }

  return clean;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  const rawUrl = req.query?.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'MISSING_URL', message: 'Parameter url wajib diisi.' });
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'INVALID_URL', message: 'Format URL tidak valid.' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'INVALID_PROTOCOL', message: 'Hanya protokol http/https yang didukung.' });
  }

  if (isPrivateOrLocalHost(parsed.hostname)) {
    return res.status(403).json({ error: 'FORBIDDEN_HOST', message: 'Host tidak diizinkan.' });
  }

  const targetUrl = resolveDownloadUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BacoKitabPDFProxy/1.0)',
        Accept: 'application/pdf,*/*;q=0.8',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'UPSTREAM_ERROR',
        message: `Gagal mengambil PDF (HTTP ${upstream.status}).`,
      });
    }

    const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      return res.status(422).json({
        error: 'HTML_RESPONSE',
        message: 'Tautan mengembalikan halaman web (bukan file PDF langsung).',
      });
    }

    const contentLength = Number(upstream.headers.get('content-length') || 0);
    if (contentLength > MAX_PDF_BYTES) {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: 'Ukuran PDF melebihi batas 50 MB.',
      });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: 'Ukuran PDF melebihi batas 50 MB.',
      });
    }

    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(buffer);
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'TIMEOUT' : 'PROXY_FETCH_FAILED',
      message: isAbort ? 'Waktu tunggu mengunduh PDF habis.' : 'Gagal terhubung ke sumber PDF.',
    });
  } finally {
    clearTimeout(timeout);
  }
}
