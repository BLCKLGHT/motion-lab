import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { carLengthCount } from "../utils/physics";

interface ReactionDistanceProps {
  distanceMetres: number;
  carLengthMetres: number;
  moving: boolean;
}

function CarIcon() {
  return (
    <svg viewBox="0 0 92 32" aria-hidden="true" focusable="false">
      <path d="M13 22h66c3 0 6-3 6-6v-2c0-3-2-5-5-6l-16-3H36L24 14H13c-3 0-5 2-5 5s2 3 5 3Z" />
      <circle cx="27" cy="23" r="5" />
      <circle cx="67" cy="23" r="5" />
      <path d="M36 8h20l8 7H27l9-7Z" />
    </svg>
  );
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
          <CarIcon key={index} />
        ))}
        {totalCars > 10 ? <b>+</b> : null}
      </div>
    </section>
  );
}
