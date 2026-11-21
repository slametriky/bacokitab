/**
 * Service Helper untuk Integrasi Turath (app.turath.io / api.turath.io)
 * Mengakses ribuan kitab Arab klasik secara langsung (teks murni digital).
 */

const API_PROXY_URL = '/api/turath-proxy';

// Kategori & Kitab Rekomendasi Populer untuk Quick Search
export const POPULAR_RECOMMENDATIONS = [
  {
    category: "Nahwu & Shorof (Tata Bahasa)",
    books: [
      { name: "الآجرومية", query: "الآجرومية", desc: "Matan dasar ilmu Nahwu paling populer" },
      { name: "قطر الندى وبل الصدى", query: "قطر الندى", desc: "Karya Ibnu Hisyam Al-Anshari" },
      { name: "ألفية ابن مالك", query: "ألفية ابن مالك", desc: "Nadzam 1000 bait kaidah Nahwu & Shorof" },
      { name: "شذور الذهب", query: "شذور الذهب", desc: "Kaidah gramatika lanjutan Ibnu Hisyam" }
    ]
  },
  {
    category: "Fiqih & Ushul Fiqih",
    books: [
      { name: "متن أبي شجاع (غاية الاختصار)", query: "متن أبي شجاع", desc: "Rujukan dasar fiqih Syafi'i" },
      { name: "فتح القريب المجيب", query: "فتح القريب المجيب", desc: "Syarah Matan Abi Syuja' karya Ibnu Qasim" },
      { name: "عمدة السالك وعدة الناسك", query: "عمدة السالك", desc: "Fiqih Syafi'i karya Ibnu An-Naqib Al-Mishri" },
      { name: "بداية المجتهد ونهاية المقتصد", query: "بداية المجتهد", desc: "Fiqih perbandingan madzhab Ibnu Rusyd" }
    ]
  },
  {
    category: "Hadits & Riyadhus Shalihin",
    books: [
      { name: "رياض الصالحين", query: "رياض الصالحين", desc: "Kumpulan hadits akhlak & adab Imam Nawawi" },
      { name: "الأربعون النووية", query: "الأربعون النووية", desc: "40 Hadits pokok ajaran Islam" },
      { name: "بلوغ المرام من أدلة الأحكام", query: "بلوغ المرام", desc: "Hadits-hadits hukum karya Ibnu Hajar" }
    ]
  },
  {
    category: "Tafsir Al-Qur'an",
    books: [
      { name: "تفسير الجلالين", query: "تفسير الجلالين", desc: "Tafsir ringkas karya Jalaluddin Al-Mahalli & As-Suyuthi" },
      { name: "تفسير ابن كثير", query: "تفسير القرآن العظيم لابن كثير", desc: "Tafsir bil ma'tsur paling masyhur" },
      { name: "تفسir السعدي (تيسير الكريم الرحمن)", query: "تيسير الكريم الرحمن في تفسير كلام المنان", desc: "Tafsir mudah & menyejukkan hati Syaikh As-Sa'di" }
    ]
  }
];

/**
 * Menormalkan karakter Arab untuk pencocokan yang toleran terhadap harakat dan variasi alif/hamzah
 */
export function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[ً-ْۖ-ٰۜ]/g, '') // Hapus harakat / tanda baca
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

/**
 * Membersihkan tag markup internal Turath seperti <s0>, <s1>, <span ...>, <em>
 */
export function cleanTurathText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/<s\d+>/gi, '')
    .replace(/<\/s\d+>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<em>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .trim();
}

// Cache lokal untuk seluruh katalog 8.609 kitab Turath
let cachedCatalog = null;

/**
 * Memuat katalog lengkap 8.609 kitab Turath dari file statis publik
 */
export async function loadTurathCatalog() {
  if (cachedCatalog) return cachedCatalog;
  try {
    const res = await fetch('/data/turath_catalog.json');
    if (!res.ok) throw new Error('Gagal memuat file katalog lokal');
    cachedCatalog = await res.json();
    return cachedCatalog;
  } catch (err) {
    console.error('Gagal memuat katalog Turath lokal:', err);
    return [];
  }
}

/**
 * Mencari kitab di katalog lokal 8.609 judul buku (Instan & Sangat Akurat)
 * Format data: [id, name, author_name, category_name]
 */
export async function searchLocalCatalog(query) {
  if (!query || !query.trim()) return [];
  const catalog = await loadTurathCatalog();
  const normalizedQuery = normalizeArabic(query.trim());

  const titleMatches = [];
  const authorMatches = [];
  const categoryMatches = [];

  for (const [id, name, author, cat] of catalog) {
    const normTitle = normalizeArabic(name);
    const normAuthor = normalizeArabic(author);
    const normCat = normalizeArabic(cat);

    const item = {
      bookId: id,
      bookName: name,
      authorName: author || 'Penulis Tidak Diketahui',
      category: cat || 'Umum',
      vol: '1',
      page: 1,
      pageId: 1,
      headings: [],
      snip: `Kitab bidang ${cat || 'klasik'} karya ${author || 'ulama'}.`,
      matchType: 'title',
      relevanceScore: 3
    };

    if (normTitle.includes(normalizedQuery)) {
      item.matchType = 'title';
      item.relevanceScore = 3;
      titleMatches.push(item);
    } else if (normAuthor.includes(normalizedQuery)) {
      item.matchType = 'author';
      item.relevanceScore = 2;
      authorMatches.push(item);
    } else if (normCat.includes(normalizedQuery)) {
      item.matchType = 'category';
      item.relevanceScore = 1;
      categoryMatches.push(item);
    }
  }

  return [...titleMatches, ...authorMatches, ...categoryMatches];
}

/**
 * Mencari kitab di katalog Turath
 * Menggabungkan pencarian Judul Katalog Resmi (8.600+ Kitab) dan API Turath
 * @param {string} query Kata kunci pencarian (judul kitab atau topik)
 * @param {number} page Halaman pencarian
 */
export async function searchTurath(query, page = 1) {
  if (!query || !query.trim()) return { count: 0, data: [], uniqueBooks: [] };

  const cleanQuery = query.trim();
  const normalizedQuery = normalizeArabic(cleanQuery);

  // 1. Cari dulu di katalog judul lokal 8.600+ kitab
  const localResults = await searchLocalCatalog(cleanQuery);

  // 2. Ambil juga dari API Turath untuk mencari teks / kitab tambahan
  const fetchPage = async (p) => {
    const params = new URLSearchParams({
      action: 'search',
      q: cleanQuery,
      page: String(p)
    });
    const res = await fetch(`${API_PROXY_URL}?${params.toString()}`);
    if (!res.ok) return { count: 0, data: [] };
    return res.json();
  };

  let apiList = [];
  let apiCount = 0;
  try {
    const resApi = await fetchPage(page);
    apiCount = resApi.count || 0;
    if (Array.isArray(resApi.data)) {
      apiList = resApi.data;
    }
  } catch (err) {
    console.warn('API search Turath error, using local catalog only:', err);
  }

  // Gabungkan hasil katalog dan hasil API
  const bookMap = new Map();

  // Masukkan hasil judul lokal terlebih dahulu (Prioritas #1)
  for (const item of localResults) {
    bookMap.set(item.bookId, item);
  }

  // Masukkan hasil dari API
  for (const item of apiList) {
    let meta = {};
    if (typeof item.meta === 'string') {
      try {
        meta = JSON.parse(item.meta);
      } catch {
        meta = {};
      }
    } else if (item.meta && typeof item.meta === 'object') {
      meta = item.meta;
    }

    const bId = item.book_id || meta.book_id;
    const bookName = meta.book_name || item.book_name || 'Kitab Tanpa Judul';
    const authorName = meta.author_name || item.author_name || 'Penulis Tidak Diketahui';
    const snip = cleanTurathText(item.snip || item.text || '');

    const normTitle = normalizeArabic(bookName);
    const normAuthor = normalizeArabic(authorName);

    let matchType = 'content';
    let relevanceScore = 1;

    if (normTitle.includes(normalizedQuery)) {
      matchType = 'title';
      relevanceScore = 3;
    } else if (normAuthor.includes(normalizedQuery)) {
      matchType = 'author';
      relevanceScore = 2;
    }

    if (!bookMap.has(bId)) {
      bookMap.set(bId, {
        bookId: bId,
        bookName,
        authorName,
        vol: meta.vol || '1',
        page: meta.page || 1,
        pageId: meta.page_id || 1,
        headings: meta.headings || [],
        snip,
        matchType,
        relevanceScore,
        raw: item
      });
    } else {
      // Jika sudah ada dari katalog lokal, lengkapi snippet teksnya
      const existing = bookMap.get(bId);
      if (snip && (!existing.snip || existing.snip.startsWith('Kitab bidang'))) {
        existing.snip = snip;
      }
      if (meta.page) existing.page = meta.page;
      if (meta.vol) existing.vol = meta.vol;
    }
  }

  // Urutkan buku: Judul cocok paling atas, lalu pengarang, lalu isi teks
  const uniqueBooks = Array.from(bookMap.values()).sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return 0;
  });

  return {
    count: Math.max(localResults.length, apiCount),
    data: uniqueBooks,
    uniqueBooks
  };
}

/**
 * Mengambil informasi lengkap kitab beserta daftar isi / index
 * @param {number|string} bookId ID unik kitab
 */
export async function getTurathBook(bookId) {
  if (!bookId) throw new Error('bookId diperlukan.');

  const params = new URLSearchParams({
    action: 'book',
    id: String(bookId),
    include: 'indexes'
  });

  const res = await fetch(`${API_PROXY_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Gagal memuat detail kitab (HTTP ${res.status})`);
  }

  const json = await res.json();
  const meta = json.meta || {};
  const indexes = json.indexes || [];

  return {
    id: meta.id || bookId,
    name: meta.name || 'Kitab',
    author: meta.author_name || meta.author || 'Penulis',
    info: meta.info || meta.info_long || '',
    infoLong: meta.info_long || meta.info || '',
    totalPages: meta.pages_count || meta.pages || 100,
    indexes: Array.isArray(indexes) ? indexes : [],
    raw: json
  };
}

/**
 * Mengambil teks satu halaman dari kitab
 * @param {number|string} bookId ID kitab
 * @param {number} page Nomor halaman
 */
export async function getTurathPage(bookId, page = 1) {
  if (!bookId) throw new Error('bookId diperlukan.');

  const params = new URLSearchParams({
    action: 'page',
    book_id: String(bookId),
    pg: String(page)
  });

  const res = await fetch(`${API_PROXY_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Gagal memuat halaman ${page} (HTTP ${res.status})`);
  }

  const json = await res.json();
  let meta = {};
  if (typeof json.meta === 'string') {
    try {
      meta = JSON.parse(json.meta);
    } catch {
      meta = {};
    }
  } else if (json.meta && typeof json.meta === 'object') {
    meta = json.meta;
  }

  const cleanedText = cleanTurathText(json.text || '');

  return {
    bookId,
    page: meta.page || page,
    pageId: meta.page_id || page,
    vol: meta.vol || '1',
    bookName: meta.book_name || '',
    authorName: meta.author_name || '',
    headings: meta.headings || [],
    text: cleanedText,
    rawText: json.text || ''
  };
}
