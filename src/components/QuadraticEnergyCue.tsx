import { useAnimatedNumber } from "../hooks/useAnimatedNumber";

interface QuadraticEnergyCueProps {
  speedKmh: number;
}

const MAX_SPEED_KMH = 140;

export function QuadraticEnergyCue({ speedKmh }: QuadraticEnergyCueProps) {
  const animatedSpeed = useAnimatedNumber(speedKmh, 0.1);
  const speedRatio = Math.min(1, Math.max(0, animatedSpeed / MAX_SPEED_KMH));
  const energyRatio = speedRatio * speedRatio;
  const markerX = 20 + speedRatio * 180;
  const markerY = 92 - energyRatio * 72;

  return (
    <section className="x2-cue" aria-label="Energy rises with speed squared">
      <div className="x2-cue__header">
        <span>Speed</span>
        <strong>x²</strong>
        <span>Energy</span>
      </div>
      <svg viewBox="0 0 220 104" role="img" aria-label="Quadratic energy curve">
        <path className="x2-cue__axis" d="M 20 18 V 92 H 204" />
        <path className="x2-cue__curve" d="M 20 92 C 78 90 135 72 202 18" />
        <line className="x2-cue__marker-line" x1={markerX} y1={markerY} x2={markerX} y2="92" />
        <circle className="x2-cue__marker" cx={markerX} cy={markerY} r="6" />
      </svg>
      <div className="x2-bars">
        <div>
          <span>Speed</span>
          <i style={{ width: `${speedRatio * 100}%` }} />
        </div>
        <div>
          <span>Energy x²</span>
          <i style={{ width: `${energyRatio * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
