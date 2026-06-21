import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinate, GpsReading, TripStats } from "../types/dashboard";
import { haversineDistanceMeters } from "../utils/gps";

const STORAGE_KEY = "motion-lab-trip";

const emptyTrip: TripStats = {
  state: "idle",
  startedAt: null,
  elapsedMs: 0,
  distanceMeters: 0,
  averageSpeedKmh: 0,
  maximumSpeedKmh: 0,
  highestEnergyJoules: 0,
  samples: []
};

function normalizeTripStats(stats: TripStats): TripStats {
  return {
    ...emptyTrip,
    ...stats,
    samples: Array.isArray(stats.samples) ? stats.samples : []
  };
}

export function useTrip(reading: GpsReading, currentEnergyJoules: number, reactionDistanceMetres: number) {
  const [stats, setStats] = useState<TripStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeTripStats(JSON.parse(stored) as TripStats) : emptyTrip;
    } catch {
      return emptyTrip;
    }
  });
  const previousCoordinateRef = useRef<Coordinate | null>(null);
  const activeStartedAtRef = useRef<number | null>(stats.state === "running" ? Date.now() - stats.elapsedMs : null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (stats.state !== "running" || reading.status === "denied" || reading.status === "unavailable") {
      previousCoordinateRef.current = null;
      return;
    }

    const coordinate: Coordinate = {
      latitude: reading.latitude,
      longitude: reading.longitude,
      timestamp: reading.timestamp
    };

    setStats((current) => {
      const previous = previousCoordinateRef.current;
      const addedDistance =
        previous && coordinate.timestamp !== previous.timestamp ? haversineDistanceMeters(previous, coordinate) : 0;
      const nextDistance = current.distanceMeters + (Number.isFinite(addedDistance) ? addedDistance : 0);
      const elapsedMs = activeStartedAtRef.current ? Date.now() - activeStartedAtRef.current : current.elapsedMs;
      const hours = elapsedMs / 3_600_000;
      const lastSample = current.samples.length > 0 ? current.samples[current.samples.length - 1] : undefined;
      const shouldSample = !lastSample || elapsedMs - lastSample.elapsedMs >= 1000;
      const nextSamples = shouldSample
        ? [
            ...current.samples,
            {
              elapsedMs,
              speedKmh: reading.speedKmh,
              energyJoules: currentEnergyJoules,
              reactionDistanceMetres
            }
          ].slice(-900)
        : current.samples;

      return {
        ...current,
        elapsedMs,
        distanceMeters: nextDistance,
        averageSpeedKmh: hours > 0 ? nextDistance / 1000 / hours : 0,
        maximumSpeedKmh: Math.max(current.maximumSpeedKmh, reading.speedKmh),
        highestEnergyJoules: Math.max(current.highestEnergyJoules, currentEnergyJoules),
        samples: nextSamples
      };
    });

    previousCoordinateRef.current = coordinate;
  }, [currentEnergyJoules, reactionDistanceMetres, reading, stats.state]);

  useEffect(() => {
    if (stats.state !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setStats((current) => ({
        ...current,
        elapsedMs: activeStartedAtRef.current ? Date.now() - activeStartedAtRef.current : current.elapsedMs
      }));
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [stats.state]);

  const startTrip = useCallback(() => {
    setStats((current) => {
      activeStartedAtRef.current = Date.now() - current.elapsedMs;
      return {
        ...current,
        state: "running",
        startedAt: current.startedAt ?? Date.now()
      };
    });
  }, []);

  const pauseTrip = useCallback(() => {
    setStats((current) => ({ ...current, state: "paused" }));
    activeStartedAtRef.current = null;
    previousCoordinateRef.current = null;
  }, []);

  const resetTrip = useCallback(() => {
    setStats(emptyTrip);
    activeStartedAtRef.current = null;
    previousCoordinateRef.current = null;
  }, []);

  return { stats, startTrip, pauseTrip, resetTrip };
}
