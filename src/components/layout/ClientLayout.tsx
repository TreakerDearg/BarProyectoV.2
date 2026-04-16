"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import ClientNavbar from "./ClientNavbar";
import ClientFooter from "./ClientFooter";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* NAVBAR */}
      <ClientNavbar />

      {/* MAIN */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6"
      >
        {children}
      </motion.main>

      {/* FOOTER */}
<ClientFooter />
    </div>
  );
}