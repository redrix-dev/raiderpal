"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  touchBehavior?: "none" | "pan-y";
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaValueText?: string;
};

export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  className,
  touchBehavior = "none",
  ariaLabel,
  ariaLabelledBy,
  ariaValueText,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const trackRectRef = useRef<DOMRect | null>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  const applyValue = (next: number) => {
    const stepped = Math.round((next - min) / step) * step + min;
    onChange(clamp(stepped));
  };

  const getTrackRect = () =>
    trackRectRef.current ?? trackRef.current?.getBoundingClientRect() ?? null;

  const updateValue = (clientX: number) => {
    const rect = getTrackRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newValue = min + ratio * (max - min);
    applyValue(newValue);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    draggingRef.current = true;
    trackRectRef.current = trackRef.current?.getBoundingClientRect() ?? null;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateValue(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateValue(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    trackRectRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const base = Math.round((value - min) / step) * step + min;
    let next = base;
    const bigStep = step * 10;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = base + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = base - step;
        break;
      case "PageUp":
        next = base + bigStep;
        break;
      case "PageDown":
        next = base - bigStep;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }

    event.preventDefault();
    applyValue(next);
  };

  return (
    <div
      className={cn(
        "relative h-10 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan",
        touchBehavior === "pan-y" ? "touch-pan-y" : "touch-none",
        className
      )}
      role="slider"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={ariaValueText ?? String(value)}
      aria-orientation="horizontal"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={trackRef}
        className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-primary-invert rounded-full cursor-pointer"
      >
        <div
          className="h-full bg-brand-cyan rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-cyan rounded-full cursor-pointer"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}
