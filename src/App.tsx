import { BarChart3, Car, Gauge, Settings } from "lucide-react";
import { useMemo, useRef, useState, type TouchEvent } from "react";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { BrakingFocusDashboard } from "./components/BrakingFocusDashboard";
import { EnergyHero } from "./components/EnergyHero";
import { EnergyRiskBand, getEnergyRiskLevel } from "./components/EnergyRiskBand";
import { GpsStatus } from "./components/GpsStatus";
import { QuadraticEnergyCue } from "./components/QuadraticEnergyCue";
import { ReactionDistance } from "./components/ReactionDistance";
import { SettingsPanel } from "./components/SettingsPanel";
import { TripControls } from "./components/TripControls";
import { useGps } from "./hooks/useGps";
import { useDemoGps } from "./hooks/useDemoGps";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTrip } from "./hooks/useTrip";
import { useWakeLock } from "./hooks/useWakeLock";
import type { VehicleSettings } from "./types/dashboard";
import { formatDecimal } from "./utils/format";
import { DEFAULT_REFERENCE_SPEED_KMH, energyMultiplier, kineticEnergyJoules, reactionDistanceMetres } from "./utils/physics";
import "./styles.css";

const DEFAULT_SETTINGS: VehicleSettings = {
  name: "Jeep Grand Cherokee",
  massKg: 2000,
  reactionTimeSeconds: 1.5,
  carLengthMetres: 5,
  referenceSpeedKmh: DEFAULT_REFERENCE_SPEED_KMH,
  demoMode: false
};

function App() {
  const wakeLockStatus = useWakeLock();
  const [storedSettings, setSettings] = useLocalStorage<VehicleSettings>("motion-lab-settings", DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings };
  const realGpsReading = useGps();
  const demoGpsReading = useDemoGps(settings.demoMode);
  const gpsReading = settings.demoMode ? demoGpsReading : realGpsReading;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"drive" | "braking" | "analytics">("drive");
  const touchStartXRef = useRef<number | null>(null);

  const currentEnergyJoules = useMemo(
    () => kineticEnergyJoules(gpsReading.speedKmh, settings.massKg),
    [gpsReading.speedKmh, settings.massKg]
  );
  const reactionDistance = reactionDistanceMetres(gpsReading.speedKmh, settings.reactionTimeSeconds);
  const { stats, startTrip, pauseTrip, resetTrip } = useTrip(gpsReading, currentEnergyJoules, reactionDistance);
  const multiplier = energyMultiplier(gpsReading.speedKmh, settings.massKg, settings.referenceSpeedKmh);
  const riskLevel = getEnergyRiskLevel(gpsReading.speedKmh, settings.massKg, settings.referenceSpeedKmh);
  const riskClassName = riskLevel.toLowerCase().replace(" ", "-");
  const isDrivingView = activeView === "drive" || activeView === "braking";

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;

    if (startX === null || activeView === "analytics") {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 48) {
      return;
    }

    setActiveView(deltaX < 0 ? "braking" : "drive");
  };

  return (
    <main className={`app-shell app-shell--risk-${riskClassName}`}>
      <div className="top-bar">
        <div>
          <p>Motion Lab</p>
          <h1>{activeView === "analytics" ? "Analytics" : activeView === "braking" ? "Braking Focus" : "Energy Awareness"}</h1>
        </div>
        <div className="top-bar__actions">
          <button
            className={`icon-button ${activeView === "drive" ? "icon-button--active" : ""}`}
            type="button"
            onClick={() => setActiveView("drive")}
            aria-label="Show driving dashboard"
          >
            <Gauge size={22} />
          </button>
          <button
            className={`icon-button ${activeView === "braking" ? "icon-button--active" : ""}`}
            type="button"
            onClick={() => setActiveView("braking")}
            aria-label="Show braking focus dashboard"
          >
            <Car size={22} />
          </button>
          <button
            className={`icon-button ${activeView === "analytics" ? "icon-button--active" : ""}`}
            type="button"
            onClick={() => setActiveView("analytics")}
            aria-label="Show analytics"
          >
            <BarChart3 size={22} />
          </button>
          <button className="icon-button" type="button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            <Settings size={22} />
          </button>
        </div>
      </div>

      {isDrivingView ? (
        <section className="drive-frame" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {activeView === "drive" ? (
            <section className="drive-dashboard">
              <GpsStatus reading={gpsReading} compact demo={settings.demoMode} />
              <EnergyHero energyJoules={currentEnergyJoules} speedKmh={gpsReading.speedKmh} riskLevel={riskLevel} />
              <EnergyRiskBand level={riskLevel} />
              <QuadraticEnergyCue speedKmh={gpsReading.speedKmh} />
              <ReactionDistance
                distanceMetres={reactionDistance}
                carLengthMetres={settings.carLengthMetres}
                moving={gpsReading.speedKmh > 1}
              />
              <section className="multiplier-strip" aria-label="Energy multiplier">
                <strong>{formatDecimal(multiplier, 1)}x</strong>
                <span>energy vs {settings.referenceSpeedKmh} km/h</span>
              </section>
            </section>
          ) : (
            <BrakingFocusDashboard
              speedKmh={gpsReading.speedKmh}
              reactionDistanceMetres={reactionDistance}
              carLengthMetres={settings.carLengthMetres}
              energyJoules={currentEnergyJoules}
              moving={gpsReading.speedKmh > 1}
            />
          )}
          <section className="drive-pager" aria-label="Driving dashboard pages">
            <button
              className={activeView === "drive" ? "drive-pager__dot drive-pager__dot--active" : "drive-pager__dot"}
              type="button"
              onClick={() => setActiveView("drive")}
              aria-label="Show energy dashboard"
            />
            <button
              className={activeView === "braking" ? "drive-pager__dot drive-pager__dot--active" : "drive-pager__dot"}
              type="button"
              onClick={() => setActiveView("braking")}
              aria-label="Show braking focus dashboard"
            />
          </section>
        </section>
      ) : (
        <AnalyticsPanel
          stats={stats}
          gpsReading={gpsReading}
          currentEnergyJoules={currentEnergyJoules}
          reactionDistanceMetres={reactionDistance}
          demoMode={settings.demoMode}
          vehicleMassKg={settings.massKg}
        />
      )}

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
