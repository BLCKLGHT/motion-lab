import { useEffect, useMemo, useState } from "react";
import type { GpsReading, TripSample, TripStats } from "../types/dashboard";
import { formatDecimal, formatDistance, formatDuration, formatSpeed } from "../utils/format";
import { energyUnit, formatEnergy } from "../utils/physics";
import { MetricCard } from "./MetricCard";

interface AnalyticsPanelProps {
  stats: TripStats;
  gpsReading: GpsReading;
  currentEnergyJoules: number;
  reactionDistanceMetres: number;
  demoMode: boolean;
  vehicleMassKg: number;
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

function buildDemoStats(samples: TripSample[]): TripStats {
  if (samples.length === 0) {
    return {
      state: "idle",
      startedAt: null,
      elapsedMs: 0,
      distanceMeters: 0,
      averageSpeedKmh: 0,
      maximumSpeedKmh: 0,
      highestEnergyJoules: 0,
      samples
    };
  }

  const elapsedMs = samples[samples.length - 1].elapsedMs;
  const averageSpeedKmh = samples.reduce((total, sample) => total + sample.speedKmh, 0) / samples.length;
  const maximumSpeedKmh = Math.max(...samples.map((sample) => sample.speedKmh));
  const highestEnergyJoules = Math.max(...samples.map((sample) => sample.energyJoules));
  const distanceMeters = samples.reduce((total, sample, index) => {
    if (index === 0) {
      return total;
    }
    const previous = samples[index - 1];
    const elapsedHours = Math.max(0, sample.elapsedMs - previous.elapsedMs) / 3_600_000;
    return total + sample.speedKmh * 1000 * elapsedHours;
  }, 0);

  return {
    state: "running",
    startedAt: Date.now() - elapsedMs,
    elapsedMs,
    distanceMeters,
    averageSpeedKmh,
    maximumSpeedKmh,
    highestEnergyJoules,
    samples
  };
}

function energyAnalogy(joules: number, massKg: number): { value: string; label: string } {
  if (joules <= 0 || massKg <= 0) {
    return { value: "--", label: "Start demo or trip data" };
  }

  // Same energy as lifting the configured vehicle mass upward against gravity.
  const liftHeightMetres = joules / (massKg * 9.81);

  return {
    value: `${formatDecimal(liftHeightMetres, liftHeightMetres >= 10 ? 0 : 1)} m`,
    label: `like lifting this vehicle ${formatDecimal(liftHeightMetres, liftHeightMetres >= 10 ? 0 : 1)} m straight up`
  };
}

export function AnalyticsPanel({
  stats,
  gpsReading,
  currentEnergyJoules,
  reactionDistanceMetres,
  demoMode,
  vehicleMassKg
}: AnalyticsPanelProps) {
  const [demoStartedAt, setDemoStartedAt] = useState<number | null>(null);
  const [demoSamples, setDemoSamples] = useState<TripSample[]>([]);

  useEffect(() => {
    if (!demoMode) {
      setDemoStartedAt(null);
      setDemoSamples([]);
      return;
    }

    setDemoStartedAt((current) => current ?? Date.now());
    setDemoSamples((current) => {
      const startedAt = demoStartedAt ?? Date.now();
      const elapsedMs = Date.now() - startedAt;
      const lastSample = current[current.length - 1];
      if (lastSample && elapsedMs - lastSample.elapsedMs < 1000) {
        return current;
      }

      return [
        ...current,
        {
          elapsedMs,
          speedKmh: gpsReading.speedKmh,
          energyJoules: currentEnergyJoules,
          reactionDistanceMetres
        }
      ].slice(-180);
    });
  }, [currentEnergyJoules, demoMode, demoStartedAt, gpsReading.speedKmh, reactionDistanceMetres]);

  const demoStats = useMemo(() => buildDemoStats(demoSamples), [demoSamples]);
  const displayStats = demoMode && stats.state !== "running" ? demoStats : stats;
  const highestEnergy = energyUnit(displayStats.highestEnergyJoules);
  const analogy = energyAnalogy(displayStats.highestEnergyJoules, vehicleMassKg);

  return (
    <section className="analytics-panel" aria-label="Trip analytics">
      {demoMode ? (
        <div className="analytics-demo-banner">
          <strong>Demo Drive Analytics</strong>
          <span>{stats.state === "running" ? "Recording trip data" : "Live simulated data"}</span>
        </div>
      ) : null}
      <div className="analytics-grid">
        <MetricCard label="Distance Travelled" value={formatDistance(displayStats.distanceMeters)} />
        <MetricCard label="Highest Energy" value={highestEnergy.value} unit={highestEnergy.unit} />
        <MetricCard label="Maximum Speed" value={formatSpeed(displayStats.maximumSpeedKmh)} unit="km/h" />
        <MetricCard label="Average Speed" value={formatSpeed(displayStats.averageSpeedKmh)} unit="km/h" />
        <MetricCard label="Trip Time" value={formatDuration(displayStats.elapsedMs)} />
        <MetricCard
          label="GPS Accuracy"
          value={gpsReading.accuracy !== null ? Math.round(gpsReading.accuracy).toString() : "--"}
          unit="m"
          tone={gpsReading.accuracy !== null && gpsReading.accuracy > 25 ? "warning" : "default"}
        />
      </div>
      <section className="energy-context-card" aria-label="Highest energy context">
        <span>Peak energy context</span>
        <strong>{analogy.value}</strong>
        <p>{analogy.label}</p>
      </section>
      <MiniChart label="Energy Over Time" samples={displayStats.samples} valueKey="energyJoules" unit="" formatter={formatEnergy} />
      <MiniChart label="Speed Over Time" samples={displayStats.samples} valueKey="speedKmh" unit="km/h" />
      <MiniChart label="Reaction Distance" samples={displayStats.samples} valueKey="reactionDistanceMetres" unit="m" />
    </section>
  );
}
