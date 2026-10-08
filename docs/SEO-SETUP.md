# MovieBox SEO setup

The frontend now has:
- SEO titles and meta descriptions for public pages.
- Canonical URLs that strip `from`, `source`, and other navigation query parameters.
- Dynamic Movie / TVSeries title, description, Open Graph and Schema.org metadata after the detail API loads.
- `robots.txt` with admin/internal pages excluded.
- A sitemap generator at `frontend/tools/generate-sitemap.js`.

## Generate the production sitemap

After the real domain is known, run from `frontend/`:

```bash
SITE_URL=https://example.com node tools/generate-sitemap.js
```

This creates `frontend/sitemap.xml` with stable public entry pages. Do not publish a sitemap containing a placeholder domain.

## Google

1. Verify the production domain in Google Search Console.
2. Submit `https://YOUR-DOMAIN/sitemap.xml` under Sitemaps.
3. Inspect the homepage and important public pages with URL Inspection.
4. Request indexing where appropriate.

## Bing

1. Verify the production domain in Bing Webmaster Tools.
2. Submit the same XML sitemap.
3. Enable IndexNow after the domain is live for faster update notifications.

Sitemaps help discovery but do not guarantee indexing. Pages still need to be crawlable, accessible, canonical, and useful.
