import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { carLengthCount, dynamiteStickEquivalent, energyUnit } from "../utils/physics";

interface BrakingFocusDashboardProps {
  speedKmh: number;
  reactionDistanceMetres: number;
  carLengthMetres: number;
  energyJoules: number;
  moving: boolean;
}

function formatStickCount(sticks: number): string {
  if (sticks <= 0) {
    return "0.0";
  }

  return sticks < 10 ? sticks.toFixed(1) : Math.round(sticks).toString();
}

export function BrakingFocusDashboard({
  speedKmh,
  reactionDistanceMetres,
  carLengthMetres,
  energyJoules,
  moving
}: BrakingFocusDashboardProps) {
  const animatedSpeed = useAnimatedNumber(speedKmh, 0.12);
  const animatedDistance = useAnimatedNumber(reactionDistanceMetres, 0.12);
  const animatedEnergy = useAnimatedNumber(energyJoules, 0.1);
  const totalCars = moving ? carLengthCount(animatedDistance, carLengthMetres) : 0;
  const visibleCars = Math.min(10, totalCars);
  const energy = energyUnit(animatedEnergy);
  const stickCount = dynamiteStickEquivalent(animatedEnergy);

  return (
    <section className="braking-focus" aria-label="Braking distance quick view">
      <div className="braking-focus__speed" aria-label="Current speed">
        <strong>{Math.round(animatedSpeed)}</strong>
        <span>km/h</span>
      </div>

      <div className="braking-focus__distance">
        <span>Braking Distance</span>
        <div className="braking-focus__cars" aria-label={`${totalCars} approximate car lengths`}>
          {Array.from({ length: visibleCars }, (_, index) => (
            <i className="car-row__icon" key={index} />
          ))}
          {totalCars > 10 ? <b>+</b> : null}
        </div>
        <strong>{totalCars > 10 ? "10+" : totalCars}</strong>
        <p>car lengths</p>
        <em>{Math.round(animatedDistance)} m reaction gap</em>
      </div>

      <div className="braking-focus__energy" aria-label="Kinetic energy equivalent">
        <span>{energy.value} {energy.unit}</span>
        <strong>{formatStickCount(stickCount)}x</strong>
        <p>approx dynamite stick energy</p>
        <div className="dynamite" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
      </div>
    </section>
  );
}
