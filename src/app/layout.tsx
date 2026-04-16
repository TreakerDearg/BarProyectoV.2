import "../styles/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bartender System",
  description: "Sistema de gestión para bares",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className="
          bg-[var(--bg-main)]
          text-[var(--text-main)]
          antialiased
        "
      >
        {children}
      </body>
    </html>
  );
}