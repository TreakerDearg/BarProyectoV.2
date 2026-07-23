import { useEffect } from "react";
import { useDashboardUiStore } from "../store/dashboardUiStore";

export function useKeyboardShortcuts() {
  const { setMode, toggleMode } = useDashboardUiStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mode shortcuts: 1, 2, 3
      if (e.key === "1") {
        setMode("simple");
      } else if (e.key === "2") {
        setMode("medium");
      } else if (e.key === "3") {
        setMode("advanced");
      }
      // Toggle mode with M
      else if (e.key === "m" || e.key === "M") {
        toggleMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMode, toggleMode]);
}
