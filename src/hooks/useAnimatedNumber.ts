import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(target: number, stiffness = 0.12): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const delta = target - valueRef.current;
      valueRef.current += delta * stiffness;

      if (Math.abs(delta) < 0.02) {
        valueRef.current = target;
      }

      setValue(valueRef.current);

      if (valueRef.current !== target) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [stiffness, target]);

  return value;
}
