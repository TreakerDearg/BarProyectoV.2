import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nebula_salon_tutorial_v1";

interface Prefs {
  completed: boolean;
  dismissedAuto: boolean;
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: false, dismissedAuto: false };
    const p = JSON.parse(raw) as Prefs;
    return {
      completed: Boolean(p.completed),
      dismissedAuto: Boolean(p.dismissedAuto),
    };
  } catch {
    return { completed: false, dismissedAuto: false };
  }
}

function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function useSalonTutorial(autoOpenOnMount = false) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);

  useEffect(() => {
    if (
      autoOpenOnMount &&
      !prefs.completed &&
      !prefs.dismissedAuto &&
      !isOpen
    ) {
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [autoOpenOnMount, prefs.completed, prefs.dismissedAuto, isOpen]);

  const openTutorial = useCallback(() => setIsOpen(true), []);

  const closeTutorial = useCallback(() => {
    setIsOpen(false);
    const next = { ...prefs, dismissedAuto: true };
    setPrefs(next);
    writePrefs(next);
  }, [prefs]);

  const completeTutorial = useCallback(() => {
    const next = { completed: true, dismissedAuto: true };
    setPrefs(next);
    writePrefs(next);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
    hasCompleted: prefs.completed,
  };
}
