import { useAnimatedNumber } from "../hooks/useAnimatedNumber";

interface QuadraticEnergyCueProps {
  speedKmh: number;
}

const MAX_SPEED_KMH = 140;

export function QuadraticEnergyCue({ speedKmh }: QuadraticEnergyCueProps) {
  const animatedSpeed = useAnimatedNumber(speedKmh, 0.1);
  const speedRatio = Math.min(1, Math.max(0, animatedSpeed / MAX_SPEED_KMH));
  const energyRatio = speedRatio * speedRatio;
  const currentSpeed = Math.round(animatedSpeed);
  const halfSpeed = Math.round(animatedSpeed / 2);
  const energyPercent = Math.round(energyRatio * 100);
  const currentSide = speedRatio > 0.01 ? Math.min(76, Math.max(24, speedRatio * 88)) : 0;
  const halfSide = currentSide / 2;

  return (
    <section className="x2-cue" aria-label="Energy rises with speed squared">
      <div className="x2-cue__header">
        <span>Energy Footprint</span>
        <strong>speed²</strong>
        <span>{currentSpeed} km/h</span>
      </div>

      <div className="x2-footprint" aria-label="Double speed creates four times the energy area">
        <div className="x2-footprint__item x2-footprint__item--half">
          <span>{halfSpeed} km/h</span>
          <div className="x2-footprint__stage">
            <i style={{ width: `${halfSide}%`, height: `${halfSide}%` }} />
          </div>
          <small>1x energy</small>
        </div>

        <div className="x2-footprint__arrow" aria-hidden="true">
          <strong>2x</strong>
          <span>speed</span>
        </div>

        <div className="x2-footprint__item x2-footprint__item--now">
          <span>{currentSpeed} km/h</span>
          <div className="x2-footprint__stage">
            <i style={{ width: `${currentSide}%`, height: `${currentSide}%` }} />
          </div>
          <small>4x energy</small>
        </div>
      </div>

      <div className="x2-consequence">
        <div>
          <span>Braking and impact energy</span>
          <strong>{energyPercent}%</strong>
        </div>
        <i style={{ width: `${energyRatio * 100}%` }} />
      </div>
    </section>
  );
}
