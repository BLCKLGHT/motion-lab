import { useMemo } from "react";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatEnergy, kineticEnergyJoules } from "../utils/physics";

interface EnergyGraphProps {
  speedKmh: number;
  massKg: number;
}

const MAX_SPEED = 140;
const VIEW_BOX_WIDTH = 360;
const VIEW_BOX_HEIGHT = 190;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 18;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;

export function EnergyGraph({ speedKmh, massKg }: EnergyGraphProps) {
  const animatedSpeed = useAnimatedNumber(speedKmh, 0.08);
  const maxEnergy = kineticEnergyJoules(MAX_SPEED, massKg);
  const currentEnergy = kineticEnergyJoules(animatedSpeed, massKg);

  const curvePath = useMemo(() => {
    const points = Array.from({ length: 57 }, (_, index) => {
      const speed = (index / 56) * MAX_SPEED;
      const x = PADDING_LEFT + (speed / MAX_SPEED) * (VIEW_BOX_WIDTH - PADDING_LEFT - PADDING_RIGHT);
      const y =
        VIEW_BOX_HEIGHT -
        PADDING_BOTTOM -
        (kineticEnergyJoules(speed, massKg) / maxEnergy) * (VIEW_BOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });

    return points.join(" ");
  }, [massKg, maxEnergy]);

  const markerX = PADDING_LEFT + (Math.min(animatedSpeed, MAX_SPEED) / MAX_SPEED) * (VIEW_BOX_WIDTH - PADDING_LEFT - PADDING_RIGHT);
  const markerY =
    VIEW_BOX_HEIGHT -
    PADDING_BOTTOM -
    (Math.min(currentEnergy, maxEnergy) / maxEnergy) * (VIEW_BOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM);

  return (
    <section className="energy-graph">
      <div className="section-heading">
        <span>x² Visualisation</span>
        <strong>{formatEnergy(currentEnergy)}</strong>
      </div>
      <svg viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`} role="img" aria-label="Kinetic energy rises quadratically with speed">
        <defs>
          <filter id="markerGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="curveGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="42%" stopColor="#facc15" />
            <stop offset="68%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path className="energy-graph__grid" d={`M ${PADDING_LEFT} ${PADDING_TOP} V ${VIEW_BOX_HEIGHT - PADDING_BOTTOM} H ${VIEW_BOX_WIDTH - PADDING_RIGHT}`} />
        <path className="energy-graph__quad-guide" d={`M ${PADDING_LEFT + 110} ${VIEW_BOX_HEIGHT - PADDING_BOTTOM} V ${PADDING_TOP + 88}`} />
        <path className="energy-graph__quad-guide" d={`M ${PADDING_LEFT + 220} ${VIEW_BOX_HEIGHT - PADDING_BOTTOM} V ${PADDING_TOP + 20}`} />
        <path className="energy-graph__curve" d={curvePath} />
        <line className="energy-graph__marker-line" x1={markerX} y1={markerY} x2={markerX} y2={VIEW_BOX_HEIGHT - PADDING_BOTTOM} />
        <circle className="energy-graph__marker" cx={markerX} cy={markerY} r="7" filter="url(#markerGlow)" />
        <text x={PADDING_LEFT} y={VIEW_BOX_HEIGHT - 8}>0</text>
        <text x={VIEW_BOX_WIDTH - 48} y={VIEW_BOX_HEIGHT - 8}>140 km/h</text>
        <text x={PADDING_LEFT + 102} y={PADDING_TOP + 82}>2x speed</text>
        <text x={PADDING_LEFT + 214} y={PADDING_TOP + 18}>4x energy</text>
      </svg>
      <p>Energy increases with the square of speed.</p>
    </section>
  );
}
