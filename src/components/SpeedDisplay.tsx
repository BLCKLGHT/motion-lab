import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatSpeed } from "../utils/format";

interface SpeedDisplayProps {
  speedKmh: number;
}

export function SpeedDisplay({ speedKmh }: SpeedDisplayProps) {
  const animatedSpeed = useAnimatedNumber(speedKmh, 0.1);

  return (
    <section className="speed-display" aria-label="Current speed">
      <div className="speed-display__arc" />
      <p className="speed-display__eyebrow">Current Speed</p>
      <strong className="speed-display__number">{formatSpeed(animatedSpeed)}</strong>
      <span className="speed-display__unit">km/h</span>
    </section>
  );
}
