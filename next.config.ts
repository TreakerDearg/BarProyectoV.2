/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Cloudinary — imágenes subidas desde el backend (products, recipes, menus)
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Unsplash CDN alternativo
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
    // Formatos modernos para mejor rendimiento
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
