import { useEffect, useState } from "react";
import type { GpsReading } from "../types/dashboard";

const START_LATITUDE = -42.8826;
const START_LONGITUDE = 147.3257;

function demoSpeedKmh(elapsedSeconds: number): number {
  const cruise = 88 + Math.sin(elapsedSeconds / 8) * 9 + Math.sin(elapsedSeconds / 17) * 6;
  const bendSlowdown = Math.max(0, Math.sin(elapsedSeconds / 11)) * 12;
  const trafficPulse = Math.max(0, Math.sin((elapsedSeconds - 8) / 23)) * 10;
  return Math.max(46, Math.min(112, cruise - bendSlowdown - trafficPulse));
}

export function useDemoGps(enabled: boolean): GpsReading {
  const [startedAt] = useState(() => Date.now());
  const [reading, setReading] = useState<GpsReading>(() => ({
    latitude: START_LATITUDE,
    longitude: START_LONGITUDE,
    timestamp: Date.now(),
    speedKmh: 0,
    rawSpeedKmh: 0,
    accuracy: 5,
    status: "excellent",
    message: "Demo drive"
  }));

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const update = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startedAt) / 1000;
      const speedKmh = demoSpeedKmh(elapsedSeconds);
      const metresTravelled = (speedKmh / 3.6) * elapsedSeconds;
      const heading = elapsedSeconds / 9 + Math.sin(elapsedSeconds / 13) * 0.9;
      const meander = Math.sin(elapsedSeconds / 7) * 0.0009;

      setReading({
        latitude: START_LATITUDE + Math.cos(heading) * (metresTravelled / 111_320) + meander,
        longitude: START_LONGITUDE + Math.sin(heading) * (metresTravelled / 85_000),
        timestamp: now,
        speedKmh,
        rawSpeedKmh: speedKmh,
        accuracy: 4 + Math.max(0, Math.sin(elapsedSeconds / 19)) * 4,
        status: "excellent",
        message: "Demo drive"
      });
    };

    update();
    const intervalId = window.setInterval(update, 500);
    return () => window.clearInterval(intervalId);
  }, [enabled, startedAt]);

  return reading;
}
