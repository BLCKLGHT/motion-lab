export const REFERENCE_SPEED_KMH = 80;

export function kmhToMps(speedKmh: number): number {
  return speedKmh / 3.6;
}

export function kineticEnergyJoules(speedKmh: number, massKg: number): number {
  const velocityMps = kmhToMps(speedKmh);
  return 0.5 * massKg * velocityMps * velocityMps;
}

export function energyMultiplier(speedKmh: number, massKg: number): number {
  const referenceEnergy = kineticEnergyJoules(REFERENCE_SPEED_KMH, massKg);
  if (referenceEnergy === 0) {
    return 0;
  }
  return kineticEnergyJoules(speedKmh, massKg) / referenceEnergy;
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
export const REFERENCE_SPEED_KMH = 50;

export function kmhToMps(speedKmh: number): number {
  return speedKmh / 3.6;
}

export function kineticEnergyJoules(speedKmh: number, massKg: number): number {
  const velocityMps = kmhToMps(speedKmh);
  return 0.5 * massKg * velocityMps * velocityMps;
}

export function energyMultiplier(speedKmh: number, massKg: number): number {
  const referenceEnergy = kineticEnergyJoules(REFERENCE_SPEED_KMH, massKg);
  if (referenceEnergy === 0) {
    return 0;
  }
  return kineticEnergyJoules(speedKmh, massKg) / referenceEnergy;
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
