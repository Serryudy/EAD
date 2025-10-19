import React from 'react';

interface StepIndicatorProps {
  step: number;
  label: string;
  currentStep: number;
  isComplete: boolean;
  onClick: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  label,
  currentStep,
  isComplete,
  onClick
}) => {
  return (
    <div
      className={`px-3 py-2 rounded ${
        currentStep === step
          ? 'bg-primary text-white'
          : isComplete
          ? 'bg-light text-dark'
          : 'bg-light text-muted'
      }`}
      style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onClick(step)}
    >
      {step}. {label}
    </div>
  );
};

export default StepIndicator;
