// layout.tsx (SIN use client)
import type { Metadata } from "next";
import { ClienteShell } from "./ClienteShell";

export const metadata: Metadata = {
  title: "Nebula · Cliente",
  description: "Experiencia Nebula",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClienteShell>{children}</ClienteShell>;
}