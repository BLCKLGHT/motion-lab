export const DEFAULT_REFERENCE_SPEED_KMH = 50;
export const JOULES_PER_DYNAMITE_STICK = 1_000_000;

export function kmhToMps(speedKmh: number): number {
  return speedKmh / 3.6;
}

export function kineticEnergyJoules(speedKmh: number, massKg: number): number {
  const velocityMps = kmhToMps(speedKmh);
  return 0.5 * massKg * velocityMps * velocityMps;
}

export function energyMultiplier(speedKmh: number, massKg: number, referenceSpeedKmh = DEFAULT_REFERENCE_SPEED_KMH): number {
  const referenceEnergy = kineticEnergyJoules(referenceSpeedKmh, massKg);
  if (referenceEnergy === 0) {
    return 0;
  }
  return kineticEnergyJoules(speedKmh, massKg) / referenceEnergy;
}

export function reactionDistanceMetres(speedKmh: number, reactionTimeSeconds: number): number {
  return kmhToMps(speedKmh) * reactionTimeSeconds;
}

export function carLengthCount(distanceMetres: number, carLengthMetres: number): number {
  if (distanceMetres <= 0 || carLengthMetres <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(distanceMetres / carLengthMetres));
}

export function formatEnergy(joules: number): string {
  if (joules >= 1_000_000) {
    return `${(joules / 1_000_000).toFixed(2)} MJ`;
  }

  if (joules >= 1_000) {
    return `${(joules / 1_000).toFixed(1)} kJ`;
  }

  return `${Math.round(joules).toLocaleString()} J`;
}

export function energyUnit(joules: number): { value: string; unit: string } {
  if (joules >= 1_000_000) {
    return { value: (joules / 1_000_000).toFixed(2), unit: "MJ" };
  }

  if (joules >= 1_000) {
    return { value: (joules / 1_000).toFixed(1), unit: "kJ" };
  }

  return { value: Math.round(joules).toLocaleString(), unit: "J" };
}

export function dynamiteStickEquivalent(joules: number): number {
  if (joules <= 0) {
    return 0;
  }

  return joules / JOULES_PER_DYNAMITE_STICK;
}
