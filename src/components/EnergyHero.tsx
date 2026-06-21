import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { energyUnit } from "../utils/physics";

interface EnergyHeroProps {
  energyJoules: number;
  speedKmh: number;
}

export function EnergyHero({ energyJoules, speedKmh }: EnergyHeroProps) {
  const animatedEnergy = useAnimatedNumber(energyJoules, 0.1);
  const animatedSpeed = useAnimatedNumber(speedKmh, 0.12);
  const energy = energyUnit(animatedEnergy);

  return (
    <section className="energy-hero" aria-label="Current kinetic energy">
      <span>Energy Awareness</span>
      <div className="energy-hero__readout">
        <strong>{energy.value}</strong>
        <em>{energy.unit}</em>
      </div>
      <div className="energy-hero__speed">
        <span>Speed</span>
        <strong>{Math.round(animatedSpeed)}</strong>
        <em>km/h</em>
      </div>
    </section>
  );
}
