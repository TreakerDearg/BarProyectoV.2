import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nebula_menu_tutorial_v1";

interface TutorialPrefs {
  completed: boolean;
  dismissedAuto: boolean;
}

function readPrefs(): TutorialPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: false, dismissedAuto: false };
    const parsed = JSON.parse(raw) as TutorialPrefs;
    return {
      completed: Boolean(parsed.completed),
      dismissedAuto: Boolean(parsed.dismissedAuto),
    };
  } catch {
    return { completed: false, dismissedAuto: false };
  }
}

function writePrefs(prefs: TutorialPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function useMenuTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<TutorialPrefs>(readPrefs);

  const shouldAutoOpen =
    !prefs.completed && !prefs.dismissedAuto && !isOpen;

  useEffect(() => {
    if (shouldAutoOpen) {
      const t = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [shouldAutoOpen]);

  const openTutorial = useCallback(() => setIsOpen(true), []);

  const closeTutorial = useCallback((markCompleted = false) => {
    setIsOpen(false);
    const next: TutorialPrefs = {
      completed: markCompleted || prefs.completed,
      dismissedAuto: true,
    };
    setPrefs(next);
    writePrefs(next);
  }, [prefs.completed]);

  const completeTutorial = useCallback(() => {
    const next: TutorialPrefs = { completed: true, dismissedAuto: true };
    setPrefs(next);
    writePrefs(next);
    setIsOpen(false);
  }, []);

  const resetTutorial = useCallback(() => {
    const next: TutorialPrefs = { completed: false, dismissedAuto: false };
    setPrefs(next);
    writePrefs(next);
  }, []);

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    hasCompleted: prefs.completed,
  };
}