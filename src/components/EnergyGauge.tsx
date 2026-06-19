import { kineticEnergyJoules } from "../utils/physics";

interface EnergyGaugeProps {
  speedKmh: number;
  massKg: number;
}

const GAUGE_MAX_SPEED_KMH = 140;

export function EnergyGauge({ speedKmh, massKg }: EnergyGaugeProps) {
  const maxEnergy = kineticEnergyJoules(GAUGE_MAX_SPEED_KMH, massKg);
  const currentEnergy = kineticEnergyJoules(speedKmh, massKg);
  const fillPercent = Math.min(100, (currentEnergy / maxEnergy) * 100);

  return (
    <section className="energy-gauge" aria-label="Kinetic energy gauge">
      <div className="section-heading">
        <span>Energy Gauge</span>
        <strong>{Math.round(fillPercent)}%</strong>
      </div>
      <div className="energy-gauge__track">
        <div className="energy-gauge__fill" style={{ width: `${fillPercent}%` }} />
      </div>
      <div className="energy-gauge__labels" aria-hidden="true">
        <span>Low</span>
        <span>High</span>
      </div>
    </section>
  );
}
