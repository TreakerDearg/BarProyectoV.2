"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-3xl neon-text">
        🍸 BARTENDER SYSTEM
      </h1>

      <p className="text-sm text-zinc-400">
        Select mode
      </p>

      <div className="flex gap-4">

        <button
          onClick={() => router.push("/menu")}
          className="px-6 py-2 rounded-lg bg-[var(--neon-purple)] hover:shadow-[var(--glow-purple)]"
        >
          CLIENT
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 rounded-lg bg-[var(--neon-cyan)] hover:shadow-[var(--glow-cyan)]"
        >
          ADMIN
        </button>

      </div>
    </div>
  );
}