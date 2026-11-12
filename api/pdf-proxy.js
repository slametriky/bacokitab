import { Readable } from 'node:stream';

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
    return `https://drive.google.com/uc?export=download&confirm=t&id=${driveFileMatch[1]}`;
  }

  // Google Drive ?id=ID
  if (clean.includes('drive.google.com')) {
    try {
      const u = new URL(clean);
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&confirm=t&id=${id}`;
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
  // Timeout only applies to initial connection + headers
  const connectTimeout = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/pdf,*/*;q=0.8',
      },
    });

    clearTimeout(connectTimeout);

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
        message: 'Tautan mengembalikan halaman web (bukan file PDF langsung). Pastikan akses link publik.',
      });
    }

    const contentLength = Number(upstream.headers.get('content-length') || 0);
    if (contentLength > MAX_PDF_BYTES) {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: 'Ukuran PDF melebihi batas 50 MB.',
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (contentLength > 0) {
      res.setHeader('Content-Length', String(contentLength));
    }

    if (!upstream.body) {
      return res.status(502).json({ error: 'EMPTY_BODY', message: 'Respon PDF kosong.' });
    }

    const nodeStream = Readable.fromWeb(upstream.body);
    let totalBytes = 0;

    nodeStream.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_PDF_BYTES) {
        nodeStream.destroy(new Error('FILE_TOO_LARGE'));
      }
    });

    nodeStream.on('error', (err) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) {
        res.status(err.message === 'FILE_TOO_LARGE' ? 413 : 502).json({
          error: err.message === 'FILE_TOO_LARGE' ? 'FILE_TOO_LARGE' : 'STREAM_ERROR',
          message: err.message === 'FILE_TOO_LARGE' ? 'Ukuran PDF melebihi batas 50 MB.' : 'Gagal mengalirkan data PDF.',
        });
      } else {
        res.end();
      }
    });

    nodeStream.pipe(res);
  } catch (err) {
    clearTimeout(connectTimeout);
    const isAbort = err?.name === 'AbortError';
    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'TIMEOUT' : 'PROXY_FETCH_FAILED',
      message: isAbort ? 'Waktu tunggu koneksi ke sumber PDF habis.' : 'Gagal terhubung ke sumber PDF.',
    });
  }
}
