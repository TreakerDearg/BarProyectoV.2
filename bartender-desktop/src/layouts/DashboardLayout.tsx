import type { ReactNode } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}