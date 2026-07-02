"use client";

import { memo } from "react";

interface Props {
  currentStep: number;
  totalSteps: number;
  completed?: boolean;
}

function WizardStepperComponent({ currentStep, totalSteps, completed }: Props) {
  return (
    <div
      className="wiz-stepper"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        flexWrap: "nowrap",
      }}
    >
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isFuture = stepNum > currentStep;

        const bgColor = isCompleted
          ? "rgba(34, 197, 94, 0.1)"
          : isActive
            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))"
            : "var(--bg-card)";

        const borderColor = isCompleted
          ? "rgba(34, 197, 94, 0.4)"
          : isActive
            ? "#a855f7"
            : "var(--border-soft)";

        const textColor = isCompleted
          ? "var(--green)"
          : isActive
            ? "#a855f7"
            : "var(--text-3)";

        const boxShadow = isActive
          ? "0 0 20px rgba(168, 85, 247, 0.25)"
          : "none";

        return (
          <div key={stepNum} style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                background: bgColor,
                border: `1.5px solid ${borderColor}`,
                color: textColor,
                borderRadius: "100px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                boxShadow,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: isCompleted
                    ? "var(--green)"
                    : isActive
                      ? "linear-gradient(135deg, #a855f7, #ec4899)"
                      : "var(--bg-card-2)",
                  color: isCompleted || isActive ? "var(--white)" : textColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {isCompleted ? "✓" : stepNum}
              </span>
              ETAPA {String(stepNum).padStart(2, "0")}
            </div>

            {stepNum < totalSteps && (
              <span style={{ color: "var(--text-4)", fontSize: 18, margin: "0 8px", flexShrink: 0 }}>
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const WizardStepper = memo(WizardStepperComponent);
