import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY_GENERAL = "nebula_menu_tutorial_v2";
const STORAGE_KEY_BUILDER = "nebula_menu_builder_tutorial_v1";

interface TutorialPrefs {
  completed: boolean;
  dismissedAuto: boolean;
  currentStep: number;
}

function readPrefs(key: string): TutorialPrefs {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { completed: false, dismissedAuto: false, currentStep: 0 };
    const parsed = JSON.parse(raw) as TutorialPrefs;
    return {
      completed: Boolean(parsed.completed),
      dismissedAuto: Boolean(parsed.dismissedAuto),
      currentStep: parsed.currentStep || 0,
    };
  } catch {
    return { completed: false, dismissedAuto: false, currentStep: 0 };
  }
}

function writePrefs(key: string, prefs: TutorialPrefs) {
  try {
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function useMenuTutorial(mode: "general" | "builder" = "general") {
  const storageKey = mode === "builder" ? STORAGE_KEY_BUILDER : STORAGE_KEY_GENERAL;
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<TutorialPrefs>(() => readPrefs(storageKey));

  const shouldAutoOpen =
    !prefs.completed && !prefs.dismissedAuto && !isOpen;

  useEffect(() => {
    if (shouldAutoOpen) {
      const t = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [shouldAutoOpen]);

  const openTutorial = useCallback((step = 0) => {
    setCurrentStep(step);
    setIsOpen(true);
  }, []);

  const closeTutorial = useCallback((markCompleted = false) => {
    setIsOpen(false);
    const next: TutorialPrefs = {
      completed: markCompleted || prefs.completed,
      dismissedAuto: true,
      currentStep: prefs.currentStep,
    };
    setPrefs(next);
    writePrefs(storageKey, next);
  }, [prefs.completed, prefs.currentStep, storageKey]);

  const completeTutorial = useCallback(() => {
    const next: TutorialPrefs = { completed: true, dismissedAuto: true, currentStep: 0 };
    setPrefs(next);
    writePrefs(storageKey, next);
    setIsOpen(false);
  }, [storageKey]);

  const resetTutorial = useCallback(() => {
    const next: TutorialPrefs = { completed: false, dismissedAuto: false, currentStep: 0 };
    setPrefs(next);
    writePrefs(storageKey, next);
  }, [storageKey]);

  const setCurrentStep = useCallback((step: number) => {
    const next: TutorialPrefs = { ...prefs, currentStep: step };
    setPrefs(next);
    writePrefs(storageKey, next);
  }, [prefs, storageKey]);

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    hasCompleted: prefs.completed,
    currentStep: prefs.currentStep,
    setCurrentStep,
  };
}