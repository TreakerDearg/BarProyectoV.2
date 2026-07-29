import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import "../styles/cliente-tokens-v3.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
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
    <html lang="es" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
