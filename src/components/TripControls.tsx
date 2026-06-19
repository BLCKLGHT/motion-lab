import { Pause, Play, RotateCcw } from "lucide-react";
import type { TripState } from "../types/dashboard";

interface TripControlsProps {
  state: TripState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TripControls({ state, onStart, onPause, onReset }: TripControlsProps) {
  const handleReset = () => {
    if (window.confirm("Reset this trip and clear stored trip data?")) {
      onReset();
    }
  };

  return (
    <section className="trip-controls" aria-label="Trip controls">
      {state === "running" ? (
        <button className="control-button control-button--primary" type="button" onClick={onPause}>
          <Pause size={20} aria-hidden="true" />
          Pause Trip
        </button>
      ) : (
        <button className="control-button control-button--primary" type="button" onClick={onStart}>
          <Play size={20} aria-hidden="true" />
          Start Trip
        </button>
      )}
      <button className="control-button" type="button" onClick={handleReset}>
        <RotateCcw size={20} aria-hidden="true" />
        Reset
      </button>
    </section>
  );
}
