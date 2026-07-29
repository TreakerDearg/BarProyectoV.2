"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import ui from "../../cliente-ui.module.css";

interface Step {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ReservationStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export default function ReservationStepper({
  steps,
  currentStep,
  completedSteps,
}: ReservationStepperProps) {
  return (
    <div className={ui.reservationStepper}>
      <div className={ui.reservationStepperContainer}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className={ui.reservationStepperStep}>
              {/* Step Indicator */}
              <motion.div
                className={ui.reservationStepperIndicator}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`${ui.reservationStepperCircle} ${
                    isCompleted
                      ? ui.reservationStepperCircleCompleted
                      : isCurrent
                      ? ui.reservationStepperCircleCurrent
                      : ui.reservationStepperCircleUpcoming
                  }`}
                >
                  {isCompleted ? (
                    <Check className={ui.reservationStepperIcon} />
                  ) : (
                    <span className={ui.reservationStepperNumber}>{index + 1}</span>
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`${ui.reservationStepperLine} ${
                      isCompleted ? ui.reservationStepperLineCompleted : ui.reservationStepperLineUpcoming
                    }`}
                  />
                )}
              </motion.div>

              {/* Step Label */}
              <motion.div
                className={ui.reservationStepperLabel}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                <span
                  className={`${ui.reservationStepperLabelText} ${
                    isCompleted
                      ? ui.reservationStepperLabelTextCompleted
                      : isCurrent
                      ? ui.reservationStepperLabelTextCurrent
                      : ui.reservationStepperLabelTextUpcoming
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
