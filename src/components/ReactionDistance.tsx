import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { carLengthCount } from "../utils/physics";

interface ReactionDistanceProps {
  distanceMetres: number;
  carLengthMetres: number;
  moving: boolean;
}

export function ReactionDistance({ distanceMetres, carLengthMetres, moving }: ReactionDistanceProps) {
  const animatedDistance = useAnimatedNumber(distanceMetres, 0.12);
  const totalCars = moving ? carLengthCount(animatedDistance, carLengthMetres) : 0;
  const visibleCars = Math.min(10, totalCars);

  return (
    <section className="reaction-panel" aria-label="Reaction distance">
      <span>At This Speed</span>
      <strong>Reaction Distance Is</strong>
      <div className="reaction-panel__distance">{Math.round(animatedDistance)} m</div>
      <div className="car-row" aria-label={`${totalCars} approximate car lengths`}>
        {Array.from({ length: visibleCars }, (_, index) => (
          <span className="car-row__icon" key={index} />
        ))}
        {totalCars > 10 ? <b>+</b> : null}
      </div>
    </section>
  );
}
