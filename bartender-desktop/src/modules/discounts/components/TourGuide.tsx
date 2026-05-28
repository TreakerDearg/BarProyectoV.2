import { useState, useEffect, useCallback } from "react";
import TourGuideTooltip from "./TourGuideTooltip";

export type TourStep = {
  target: string; // CSS selector
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

type Props = {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  storageKey?: string; // localStorage key to remember if tour was completed
};

export default function TourGuide({
  steps,
  isOpen,
  onClose,
  onComplete,
  storageKey,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check if tour was previously completed
  useEffect(() => {
    if (storageKey) {
      try {
        const completed = localStorage.getItem(storageKey) === "done";
        if (completed && isOpen) {
          onClose();
        }
      } catch {
        // ignore localStorage errors
      }
    }
  }, [storageKey, isOpen, onClose]);

  // Find and highlight target element
  const updateTargetRect = useCallback(() => {
    if (!isOpen || currentStep >= steps.length) {
      setTargetRect(null);
      return;
    }

    const step = steps[currentStep];
    const target = document.querySelector(step.target);
    
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      // Scroll element into view if needed
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      console.warn(`Tour target not found: ${step.target}`);
      // Skip to next step if target not found
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onClose();
      }
    }
  }, [isOpen, currentStep, steps, onClose]);

  useEffect(() => {
    updateTargetRect();
    
    // Update on window resize
    const handleResize = () => updateTargetRect();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, "done");
        } catch {
          // ignore localStorage errors
        }
      }
      onComplete?.();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "done");
      } catch {
        // ignore localStorage errors
      }
    }
    onClose();
  };

  if (!isOpen || !targetRect || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <TourGuideTooltip
      title={step.title}
      content={step.content}
      position={step.position}
      step={currentStep + 1}
      totalSteps={steps.length}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      onClose={handleSkip}
      targetRect={targetRect}
    />
  );
}
