import { AlertTriangle, LocateFixed, Satellite, ShieldAlert } from "lucide-react";
import type { GpsReading } from "../types/dashboard";

interface GpsStatusProps {
  reading: GpsReading;
}

export function GpsStatus({ reading }: GpsStatusProps) {
  const isWarning = reading.status === "poor" || reading.status === "denied" || reading.status === "unavailable";
  const label =
    reading.status === "excellent"
      ? "Excellent Accuracy"
      : reading.status === "locked"
        ? "Locked"
        : reading.status === "poor"
          ? "Poor Accuracy"
          : reading.status === "denied"
            ? "Permission Denied"
            : reading.status === "unavailable"
              ? "Unavailable"
              : "Searching...";

  const Icon = reading.status === "excellent" || reading.status === "locked" ? LocateFixed : isWarning ? ShieldAlert : Satellite;

  return (
    <div className={`gps-status ${isWarning ? "gps-status--warning" : ""}`}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <span>
          {reading.accuracy !== null ? `${Math.round(reading.accuracy)} m accuracy` : reading.message ?? "Searching for GPS..."}
        </span>
      </div>
      {reading.accuracy !== null && reading.accuracy > 25 ? <AlertTriangle size={18} aria-label="Accuracy warning" /> : null}
    </div>
  );
}
