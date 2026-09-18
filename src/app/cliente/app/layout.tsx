import type { Metadata, Viewport } from "next";
import { AppShell } from "./AppShell";

export const metadata: Metadata = {
  title: "Nebula App",
  description: "Pide, reserva y disfruta Nebula desde tu móvil",
  applicationName: "Nebula App",

  appleWebApp: {
    capable: true,
    title: "Nebula",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/brand/nebula-mark.png",
    shortcut: "/brand/nebula-mark.png",
    apple: "/brand/nebula-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090C",
  colorScheme: "dark",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
