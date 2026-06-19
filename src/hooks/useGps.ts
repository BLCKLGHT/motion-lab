import { useEffect, useRef, useState } from "react";
import type { Coordinate, GpsReading } from "../types/dashboard";
import { rollingAverage, speedFromCoordinatesKmh } from "../utils/gps";

const SPEED_SAMPLE_LIMIT = 5;

const initialReading: GpsReading = {
  latitude: 0,
  longitude: 0,
  timestamp: Date.now(),
  speedKmh: 0,
  rawSpeedKmh: 0,
  accuracy: null,
  status: "searching",
  message: "Searching for GPS..."
};

export function useGps(): GpsReading {
  const [reading, setReading] = useState<GpsReading>(initialReading);
  const previousCoordinateRef = useRef<Coordinate | null>(null);
  const speedSamplesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setReading((current) => ({
        ...current,
        status: "unavailable",
        message: "GPS is unavailable on this device."
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coordinate: Coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };

        const previousCoordinate = previousCoordinateRef.current;
        const gpsSpeedKmh =
          typeof position.coords.speed === "number" && position.coords.speed >= 0
            ? position.coords.speed * 3.6
            : previousCoordinate
              ? speedFromCoordinatesKmh(previousCoordinate, coordinate)
              : 0;

        previousCoordinateRef.current = coordinate;
        speedSamplesRef.current = [...speedSamplesRef.current, Math.max(0, gpsSpeedKmh)].slice(-SPEED_SAMPLE_LIMIT);

        const accuracy = Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null;
        const status = accuracy === null ? "locked" : accuracy <= 10 ? "excellent" : accuracy <= 25 ? "locked" : "poor";

        setReading({
          ...coordinate,
          rawSpeedKmh: Math.max(0, gpsSpeedKmh),
          speedKmh: rollingAverage(speedSamplesRef.current),
          accuracy,
          status,
          message: undefined
        });
      },
      (error) => {
        const status = error.code === error.PERMISSION_DENIED ? "denied" : "unavailable";
        setReading((current) => ({
          ...current,
          status,
          message: error.code === error.PERMISSION_DENIED ? "Location permission denied." : "GPS signal unavailable."
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 12000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return reading;
}
