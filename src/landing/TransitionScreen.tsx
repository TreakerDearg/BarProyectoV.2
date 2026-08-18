"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TransitionScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to cliente home after a brief transition
    const timer = setTimeout(() => {
      router.push("/cliente");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="transition-screen">
      <div className="transition-spinner">
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
      </div>
    </div>
  );
}
