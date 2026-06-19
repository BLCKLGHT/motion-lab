import { Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { EnergyGauge } from "./components/EnergyGauge";
import { EnergyGraph } from "./components/EnergyGraph";
import { GpsStatus } from "./components/GpsStatus";
import { MetricCard } from "./components/MetricCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { SpeedDisplay } from "./components/SpeedDisplay";
import { TripControls } from "./components/TripControls";
import { useGps } from "./hooks/useGps";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTrip } from "./hooks/useTrip";
import { useWakeLock } from "./hooks/useWakeLock";
import type { VehicleSettings } from "./types/dashboard";
import { formatDecimal, formatDistance, formatDuration, formatSpeed } from "./utils/format";
import { energyMultiplier, energyUnit, kineticEnergyJoules, REFERENCE_SPEED_KMH } from "./utils/physics";
import "./styles.css";

const DEFAULT_SETTINGS: VehicleSettings = {
  name: "Jeep Grand Cherokee",
  massKg: 2000
};

function App() {
  const gpsReading = useGps();
  const wakeLockStatus = useWakeLock();
  const [settings, setSettings] = useLocalStorage<VehicleSettings>("motion-lab-settings", DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentEnergyJoules = useMemo(
    () => kineticEnergyJoules(gpsReading.speedKmh, settings.massKg),
    [gpsReading.speedKmh, settings.massKg]
  );
  const { stats, startTrip, pauseTrip, resetTrip } = useTrip(gpsReading, currentEnergyJoules);
  const currentEnergy = energyUnit(currentEnergyJoules);
  const multiplier = energyMultiplier(gpsReading.speedKmh, settings.massKg);
  const gpsTone = gpsReading.accuracy !== null && gpsReading.accuracy > 25 ? "warning" : "default";

  return (
    <main className="app-shell">
      <div className="top-bar">
        <div>
          <p>Motion Lab</p>
          <h1>{settings.name}</h1>
        </div>
        <button className="icon-button" type="button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
          <Settings size={22} />
        </button>
      </div>

      <GpsStatus reading={gpsReading} />

      <section className="dashboard-grid">
        <div className="dashboard-grid__speed">
          <SpeedDisplay speedKmh={gpsReading.speedKmh} />
        </div>

        <div className="metric-grid">
          <MetricCard label="Average Speed" value={formatSpeed(stats.averageSpeedKmh)} unit="km/h" />
          <MetricCard label="Maximum Speed" value={formatSpeed(stats.maximumSpeedKmh)} unit="km/h" />
          <MetricCard label="Distance Travelled" value={formatDistance(stats.distanceMeters)} />
          <MetricCard label="Trip Time" value={formatDuration(stats.elapsedMs)} />
          <MetricCard
            label="GPS Accuracy"
            value={gpsReading.accuracy !== null ? Math.round(gpsReading.accuracy).toString() : "--"}
            unit="m"
            tone={gpsTone}
          />
          <MetricCard label="Kinetic Energy" value={currentEnergy.value} unit={currentEnergy.unit} tone="accent" />
          <MetricCard label="Energy Multiplier" value={`${formatDecimal(multiplier, 1)}x`} unit={`vs ${REFERENCE_SPEED_KMH} km/h`} />
          <MetricCard label="Highest Energy" value={energyUnit(stats.highestEnergyJoules).value} unit={energyUnit(stats.highestEnergyJoules).unit} />
        </div>
      </section>

      <section className="comparison-card">
        <span>Energy Comparison</span>
        <strong>Current energy is {formatDecimal(multiplier, 1)}x greater than at {REFERENCE_SPEED_KMH} km/h.</strong>
      </section>

      <EnergyGauge speedKmh={gpsReading.speedKmh} massKg={settings.massKg} />
      <EnergyGraph speedKmh={gpsReading.speedKmh} massKg={settings.massKg} />

      <TripControls state={stats.state} onStart={startTrip} onPause={pauseTrip} onReset={resetTrip} />

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        wakeLockStatus={wakeLockStatus}
        onClose={() => setSettingsOpen(false)}
        onSave={setSettings}
      />
    </main>
  );
}

export default App;
