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

  if (!open) {
    return null;
  }

  const handleSave = () => {
    onSave({
      ...settings,
      massKg: Math.max(250, Math.min(10_000, Math.round(massKg)))
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

        <div className="settings-meta">
          <span>Screen wake lock</span>
          <strong>{wakeLockStatus}</strong>
        </div>

        <button className="control-button control-button--primary settings-panel__save" type="button" onClick={handleSave}>
          <Save size={20} aria-hidden="true" />
          Save Settings
        </button>

        <p className="settings-disclaimer">
          This application is for educational purposes only. GPS speed is approximate and must not be relied upon as a certified vehicle
          speedometer. Always obey road rules and use your vehicle's instruments.
        </p>
      </aside>
    </div>
  );
}
