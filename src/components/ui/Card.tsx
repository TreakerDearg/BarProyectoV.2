import { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="
      bg-[var(--bg-panel)]
      border border-[var(--border-color)]
      rounded-xl
      p-4
      shadow-[var(--glow-purple)]
      transition
      hover:shadow-[0_0_20px_#7c3aed]
    ">
      {children}
    </div>
  );
}