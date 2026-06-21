import type { GpsReading, TripSample, TripStats } from "../types/dashboard";
import { formatDecimal, formatDistance, formatDuration, formatSpeed } from "../utils/format";
import { energyUnit, formatEnergy } from "../utils/physics";
import { MetricCard } from "./MetricCard";

interface AnalyticsPanelProps {
  stats: TripStats;
  gpsReading: GpsReading;
}

interface MiniChartProps {
  label: string;
  samples: TripSample[];
  valueKey: keyof Pick<TripSample, "speedKmh" | "energyJoules" | "reactionDistanceMetres">;
  unit: string;
  formatter?: (value: number) => string;
}

function MiniChart({ label, samples, valueKey, unit, formatter = (value) => formatDecimal(value, 0) }: MiniChartProps) {
  const points = samples.length > 1 ? samples : [];
  const values = points.map((sample) => sample[valueKey]);
  const maxValue = Math.max(...values, 1);
  const width = 320;
  const height = 104;
  const path = points
    .map((sample, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - (sample[valueKey] / maxValue) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const latest = values.length > 0 ? values[values.length - 1] : 0;

  return (
    <section className="mini-chart">
      <div className="section-heading">
        <span>{label}</span>
        <strong>
          {formatter(latest)} {unit}
        </strong>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} over time`}>
        <path className="mini-chart__baseline" d={`M 0 ${height - 6} H ${width}`} />
        {path ? <path className="mini-chart__line" d={path} /> : null}
      </svg>
    </section>
  );
}

export function AnalyticsPanel({ stats, gpsReading }: AnalyticsPanelProps) {
  const highestEnergy = energyUnit(stats.highestEnergyJoules);

  return (
    <section className="analytics-panel" aria-label="Trip analytics">
      <div className="analytics-grid">
        <MetricCard label="Distance Travelled" value={formatDistance(stats.distanceMeters)} />
        <MetricCard label="Highest Energy" value={highestEnergy.value} unit={highestEnergy.unit} />
        <MetricCard label="Maximum Speed" value={formatSpeed(stats.maximumSpeedKmh)} unit="km/h" />
        <MetricCard label="Average Speed" value={formatSpeed(stats.averageSpeedKmh)} unit="km/h" />
        <MetricCard label="Trip Time" value={formatDuration(stats.elapsedMs)} />
        <MetricCard
          label="GPS Accuracy"
          value={gpsReading.accuracy !== null ? Math.round(gpsReading.accuracy).toString() : "--"}
          unit="m"
          tone={gpsReading.accuracy !== null && gpsReading.accuracy > 25 ? "warning" : "default"}
        />
      </div>
      <MiniChart label="Energy Over Time" samples={stats.samples} valueKey="energyJoules" unit="" formatter={formatEnergy} />
      <MiniChart label="Speed Over Time" samples={stats.samples} valueKey="speedKmh" unit="km/h" />
      <MiniChart label="Reaction Distance" samples={stats.samples} valueKey="reactionDistanceMetres" unit="m" />
    </section>
  );
}
