"use client";

import { useCallback, useRef, useState } from "react";

type Axis = "vertical" | "horizontal";

// Hook genérico de arraste: converte o deslocamento do ponteiro (mouse ou
// toque, via Pointer Events) num valor entre min/max. Vertical inverte
// (arrastar pra cima aumenta). `sensitivity` é o nº de pixels pra percorrer
// o intervalo inteiro.
export function useDragValue({
  min,
  max,
  value,
  onChange,
  sensitivity = 180,
  axis = "vertical",
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  sensitivity?: number;
  axis?: Axis;
}) {
  const [dragging, setDragging] = useState(false);
  const startPos = useRef(0);
  const startValue = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      startPos.current = axis === "vertical" ? e.clientY : e.clientX;
      startValue.current = value;
    },
    [axis, value]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const range = max - min;
      const current = axis === "vertical" ? e.clientY : e.clientX;
      const delta = axis === "vertical" ? startPos.current - current : current - startPos.current;
      const next = startValue.current + (delta / sensitivity) * range;
      onChange(Math.min(max, Math.max(min, next)));
    },
    [dragging, axis, max, min, onChange, sensitivity]
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  return { dragging, onPointerDown, onPointerMove, onPointerUp };
}
