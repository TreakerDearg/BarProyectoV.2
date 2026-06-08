/* =========================================================
   ROBOTS.TXT GENERATOR
========================================================= */
export const generateRobotsTxt = (baseUrl) => {
  return `User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1
`;
};
