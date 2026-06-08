import Menu from "../models/Menu.js";

/* =========================================================
   SITEMAP GENERATOR
========================================================= */
export const generateSitemap = async (baseUrl) => {
  try {
    const menus = await Menu.find({ active: true, isPublic: true })
      .select('slug updatedAt')
      .lean();

    const staticUrls = [
      {
        url: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/menus`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9
      }
    ];

    const menuUrls = menus.map(menu => ({
      url: `${baseUrl}/menu/${menu.slug}`,
      lastmod: menu.updatedAt || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }));

    const allUrls = [...staticUrls, ...menuUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};
