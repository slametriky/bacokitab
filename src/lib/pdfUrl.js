/**
 * Validate that a string is a safe http/https URL.
 */
export const isValidPdfUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extract Google Drive file ID from common share/view/open/uc URLs.
 */
export const extractGoogleDriveId = (url) => {
  if (!url) return null;
  // /file/d/FILE_ID/...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // ?id=FILE_ID or &id=FILE_ID
  if (url.includes('drive.google.com')) {
    try {
      const parsed = new URL(url);
      const id = parsed.searchParams.get('id');
      if (id) return id;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Build the iframe src URL for a given PDF URL and viewer mode.
 * @param {string} rawUrl - Original PDF link entered by user.
 * @param {'google' | 'direct'} mode - Viewer mode ('google' uses Google Docs Viewer for non-Drive links, 'direct' embeds directly).
 * @returns {{ src: string, isDrive: boolean }}
 */
export const getPdfEmbedInfo = (rawUrl, mode = 'google') => {
  const cleanUrl = (rawUrl || '').trim();
  if (!isValidPdfUrl(cleanUrl)) {
    return { src: '', isDrive: false };
  }

  const driveId = extractGoogleDriveId(cleanUrl);
  if (driveId) {
    return {
      src: `https://drive.google.com/file/d/${driveId}/preview`,
      isDrive: true,
    };
  }

  // Normalize Dropbox share link for direct access
  let normalizedUrl = cleanUrl;
  if (normalizedUrl.includes('dropbox.com')) {
    normalizedUrl = normalizedUrl
      .replace(/[?&]dl=0/, (m) => m[0] + 'raw=1')
      .replace(/[?&]dl=1/, (m) => m[0] + 'raw=1');
  }

  if (mode === 'direct') {
    return { src: normalizedUrl, isDrive: false };
  }

  return {
    src: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(normalizedUrl)}`,
    isDrive: false,
  };
};
