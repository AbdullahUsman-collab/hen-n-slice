'use client';

import type { OrderStatus, OrderType } from '@hen-n-slice/types';

interface Step {
  key: OrderStatus;
  label: string;
}

const DELIVERY_STEPS: Step[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'On the way' },
  { key: 'completed', label: 'Completed' },
];

const PICKUP_STEPS: Step[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'completed', label: 'Ready' },
];

interface OrderStepperProps {
  currentStatus: OrderStatus;
  orderType: OrderType;
}

export default function OrderStepper({
  currentStatus,
  orderType,
}: OrderStepperProps) {
  const steps = orderType === 'delivery' ? DELIVERY_STEPS : PICKUP_STEPS;
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  if (currentStatus === 'cancelled') {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
        <p className="font-semibold text-red-600">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted ? 'bg-brand-purple' : 'bg-border-light'
                  }`}
                />
              )}
              {/* Dot */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isCompleted
                    ? 'bg-brand-purple text-text-on-brand'
                    : isCurrent
                      ? 'border-2 border-brand-purple bg-brand-purple/10 text-brand-purple'
                      : 'border-2 border-border-light bg-surface-card text-text-muted'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted ? 'bg-brand-purple' : 'bg-border-light'
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                isCurrent
                  ? 'text-brand-purple'
                  : isCompleted
                    ? 'text-text-primary'
                    : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
