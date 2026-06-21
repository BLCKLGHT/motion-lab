export type GpsStatus = "searching" | "locked" | "poor" | "excellent" | "denied" | "unavailable";

export type TripState = "idle" | "running" | "paused";

export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GpsReading extends Coordinate {
  speedKmh: number;
  rawSpeedKmh: number;
  accuracy: number | null;
  status: GpsStatus;
  message?: string;
}

export interface TripStats {
  state: TripState;
  startedAt: number | null;
  elapsedMs: number;
  distanceMeters: number;
  averageSpeedKmh: number;
  maximumSpeedKmh: number;
  highestEnergyJoules: number;
  samples: TripSample[];
}

export interface VehicleSettings {
  name: string;
  massKg: number;
  reactionTimeSeconds: number;
  carLengthMetres: number;
  referenceSpeedKmh: number;
}

export interface TripSample {
  elapsedMs: number;
  speedKmh: number;
  energyJoules: number;
  reactionDistanceMetres: number;
}
