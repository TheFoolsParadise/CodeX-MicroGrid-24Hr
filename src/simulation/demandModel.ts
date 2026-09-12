// Dual-Peak Residential Consumer Demand Model for 600-Household Township
// Morning peak (07:00-09:30) ~2.5 kW, Evening peak (18:30-22:00) ~3.5 kW, Base ~0.5 kW

export function calculateBaseHouseholdDemand(hour: number): number {
  // Night baseline (00:00 - 05:30): 0.52 kW
  if (hour < 5.5) {
    return 0.52 + 0.04 * Math.sin(hour * 0.5);
  }

  // Morning ramp up (05:30 - 08:30) peaking around 08:00 at ~2.55 kW
  if (hour >= 5.5 && hour < 10.0) {
    const morningBell = Math.exp(-Math.pow((hour - 8.0) / 1.1, 2));
    return 0.55 + 2.05 * morningBell;
  }

  // Daytime lull (10:00 - 17:00): ~1.15 kW
  if (hour >= 10.0 && hour < 17.0) {
    const middayVar = 0.15 * Math.sin((hour - 10.0) * 0.6);
    return 1.15 + middayVar;
  }

  // Evening peak (17:00 - 22:30) peaking around 19:45 at ~3.45 kW
  if (hour >= 17.0 && hour < 22.5) {
    const eveningBell = Math.exp(-Math.pow((hour - 19.75) / 1.5, 2));
    return 0.85 + 2.65 * eveningBell;
  }

  // Late night taper (22:30 - 24:00): 1.2 kW down to 0.55 kW
  const taper = (hour - 22.5) / 1.5;
  return 1.20 - taper * 0.65;
}
