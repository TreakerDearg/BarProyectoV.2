import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nebula App",
    short_name: "Nebula",
    description: "Pide, reserva y disfruta Nebula desde tu móvil",
    start_url: "/cliente/app",
    scope: "/cliente/app",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08090C",
    theme_color: "#08090C",
    categories: ["food", "shopping"],
    icons: [
      { src: "/brand/nebula-mark.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}
