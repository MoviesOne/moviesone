/*
 * MovieBox sitemap generator.
 * Usage:
 *   SITE_URL=https://moviesone.sbs node tools/generate-sitemap.js
 *
 * This intentionally includes only stable public entry pages. Movie/series
 * detail URLs use query parameters in the current frontend and should be
 * added only after the production domain and content inventory are known.
 */
const fs = require('fs');
const path = require('path');

const siteUrl = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');
if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
    console.error('Missing SITE_URL. Example: SITE_URL=https://moviesone.sbs node tools/generate-sitemap.js');
    process.exit(1);
}

const urls = [
    '/',
    '/popular.html',
    '/new-releases.html',
    '/trending-tv.html',
    '/featured-list.html',
    '/series.html'
];

const today = new Date().toISOString().slice(0, 10);
const body = urls.map((url) => `  <url>\n    <loc>${siteUrl}${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xml, 'utf8');
console.log(`Generated ${urls.length} URLs in frontend/sitemap.xml for ${siteUrl}`);
