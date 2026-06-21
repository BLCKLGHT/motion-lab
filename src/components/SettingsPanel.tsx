import { Save, X } from "lucide-react";
import { useState } from "react";
import type { VehicleSettings } from "../types/dashboard";

interface SettingsPanelProps {
  open: boolean;
  settings: VehicleSettings;
  onClose: () => void;
  onSave: (settings: VehicleSettings) => void;
  wakeLockStatus: string;
}

export function SettingsPanel({ open, settings, onClose, onSave, wakeLockStatus }: SettingsPanelProps) {
  const [massKg, setMassKg] = useState(settings.massKg);
  const [reactionTimeSeconds, setReactionTimeSeconds] = useState(settings.reactionTimeSeconds);
  const [carLengthMetres, setCarLengthMetres] = useState(settings.carLengthMetres);
  const [referenceSpeedKmh, setReferenceSpeedKmh] = useState(settings.referenceSpeedKmh);

  if (!open) {
    return null;
  }

  const handleSave = () => {
    onSave({
      ...settings,
      massKg: Math.max(250, Math.min(10_000, Math.round(massKg))),
      reactionTimeSeconds: Math.max(0.5, Math.min(4, Number(reactionTimeSeconds.toFixed(1)))),
      carLengthMetres: Math.max(2, Math.min(12, Number(carLengthMetres.toFixed(1)))),
      referenceSpeedKmh: Math.max(10, Math.min(140, Math.round(referenceSpeedKmh)))
    });
    onClose();
  };

  return (
    <div className="settings-backdrop" role="presentation">
      <aside className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-panel__header">
          <div>
            <p>Vehicle Configuration</p>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings">
            <X size={22} />
          </button>
        </div>

        <label className="settings-field">
          <span>Vehicle</span>
          <input value={settings.name} readOnly />
        </label>

        <label className="settings-field">
          <span>Mass</span>
          <div className="settings-field__with-unit">
            <input
              inputMode="numeric"
              min="250"
              max="10000"
              type="number"
              value={massKg}
              onChange={(event) => setMassKg(Number(event.target.value))}
            />
            <strong>kg</strong>
          </div>
        </label>

        <label className="settings-field">
          <span>Reaction Time</span>
          <div className="settings-field__with-unit">
            <input
              inputMode="decimal"
              min="0.5"
              max="4"
              step="0.1"
              type="number"
              value={reactionTimeSeconds}
              onChange={(event) => setReactionTimeSeconds(Number(event.target.value))}
            />
            <strong>s</strong>
          </div>
        </label>

        <label className="settings-field">
          <span>Car Length</span>
          <div className="settings-field__with-unit">
            <input
              inputMode="decimal"
              min="2"
              max="12"
              step="0.1"
              type="number"
              value={carLengthMetres}
              onChange={(event) => setCarLengthMetres(Number(event.target.value))}
            />
            <strong>m</strong>
          </div>
        </label>

        <label className="settings-field">
          <span>Reference Speed</span>
          <div className="settings-field__with-unit">
            <input
              inputMode="numeric"
              min="10"
              max="140"
              type="number"
              value={referenceSpeedKmh}
              onChange={(event) => setReferenceSpeedKmh(Number(event.target.value))}
            />
            <strong>km/h</strong>
          </div>
        </label>

        <div className="settings-meta">
          <span>Screen wake lock</span>
          <strong>{wakeLockStatus}</strong>
        </div>

        <button className="control-button control-button--primary settings-panel__save" type="button" onClick={handleSave}>
          <Save size={20} aria-hidden="true" />
          Save Settings
        </button>

        <p className="settings-disclaimer">
          This app is for driver awareness and education only. It does not predict crash outcomes, replace safe driving judgement, or
          replace your vehicle's instruments. Always obey road laws, posted signs, and road conditions.
        </p>
      </aside>
    </div>
  );
}
