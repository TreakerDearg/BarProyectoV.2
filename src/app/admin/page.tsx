import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel administrador",
};

export default function AdminPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al inicio
      </Link>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Panel administrador
      </h1>
      <p className="mt-4 text-muted">
        Aquí montaremos el back-office web (dashboard, empleados, mesas,
        inventario, etc.) conectado al backend como en el escritorio.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-surface/50 p-8 text-center text-sm text-muted">
        Contenido pendiente · estructura lista para módulos
      </div>
    </div>
  );
}
