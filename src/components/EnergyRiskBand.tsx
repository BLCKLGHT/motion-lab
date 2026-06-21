import { energyMultiplier } from "../utils/physics";

export type EnergyRiskLevel = "LOW" | "MODERATE" | "HIGH" | "VERY HIGH" | "EXTREME";

interface EnergyRiskBandProps {
  speedKmh: number;
  massKg: number;
  referenceSpeedKmh: number;
}

const riskPrompts: Record<EnergyRiskLevel, string> = {
  LOW: "Maintain awareness",
  MODERATE: "Leave space",
  HIGH: "Slow before hazards",
  "VERY HIGH": "Increase buffer",
  EXTREME: "Reduce speed"
};

export function getEnergyRiskLevel(speedKmh: number, massKg: number, referenceSpeedKmh: number): EnergyRiskLevel {
  const multiplier = energyMultiplier(speedKmh, massKg, referenceSpeedKmh);

  if (multiplier < 0.5) {
    return "LOW";
  }
  if (multiplier < 1) {
    return "MODERATE";
  }
  if (multiplier < 2) {
    return "HIGH";
  }
  if (multiplier < 3.5) {
    return "VERY HIGH";
  }
  return "EXTREME";
}

export function EnergyRiskBand({ speedKmh, massKg, referenceSpeedKmh }: EnergyRiskBandProps) {
  const level = getEnergyRiskLevel(speedKmh, massKg, referenceSpeedKmh);

  return (
    <section className={`risk-band risk-band--${level.toLowerCase().replace(" ", "-")}`} aria-label="Energy risk band">
      <div>
        <span>Energy Risk</span>
        <strong>{level}</strong>
      </div>
      <p>{riskPrompts[level]}</p>
    </section>
  );
}
