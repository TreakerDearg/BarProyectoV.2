import type { Metadata } from "next";
import { Manrope, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import "../styles/golden-night.css";

// ── UI / Funcional — todo el sistema ────────────────────────────
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ── Display / Editorial — títulos premium ────────────────────────
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nebula - Experiencia Gastronómica Premium",
    template: "%s · Nebula",
  },
  description:
    "Descubre Nebula, una experiencia gastronómica donde los sabores cruzan la galaxia. Coctelería de autor, platos exclusivos y un ambiente único inspirado en lo cósmico.",
  keywords: ["restaurante", "coctelería", "gastronomía", "bar", "experiencia", "Nebula"],
  authors: [{ name: "Nebula Food & Beverage" }],
  creator: "Nebula Food & Beverage",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://nebula.com",
    title: "Nebula - Experiencia Gastronómica Premium",
    description: "Descubre Nebula, una experiencia gastronómica donde los sabores cruzan la galaxia.",
    siteName: "Nebula",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nebula - Experiencia Gastronómica Premium",
    description: "Descubre Nebula, una experiencia gastronómica donde los sabores cruzan la galaxia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${dmSerifDisplay.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
