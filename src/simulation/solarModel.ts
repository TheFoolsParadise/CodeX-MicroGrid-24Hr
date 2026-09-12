// Physics-based Solar Insolation Model for Tamil Nadu Microgrid
// Diurnal cycle with solar noon at 12:30 PM, sunrise ~06:00 AM, sunset ~18:30 PM

export function calculateBaseInsolation(hour: number): number {
  const sunriseHour = 6.0;
  const sunsetHour = 18.5;
  const peakHour = 12.5; // 12:30 PM

  if (hour < sunriseHour || hour > sunsetHour) {
    return 0;
  }

  // Asymmetric diurnal curve peaking at 12:30 PM
  let normalized: number;
  if (hour <= peakHour) {
    normalized = (hour - sunriseHour) / (peakHour - sunriseHour); // 0 to 1
  } else {
    normalized = (sunsetHour - hour) / (sunsetHour - peakHour); // 1 to 0
  }

  // Smooth sinusoidal rise with atmospheric zenith shaping
  const insolation = Math.sin(normalized * (Math.PI / 2));
  return Math.max(0, Math.pow(insolation, 1.28));
}

// Baseline natural clouds that occur 2-3 times during the day
export function getNaturalCloudFactor(hour: number): number {
  // Minor baseline cloud passing at ~10:15 AM (hour 10.25)
  if (hour >= 10.0 && hour <= 10.5) {
    const depth = 0.82 + 0.08 * Math.cos((hour - 10.25) * Math.PI * 4);
    return depth;
  }
  // Brief thermal cumulus afternoon dip at ~15:00 PM (hour 15.0)
  if (hour >= 14.75 && hour <= 15.25) {
    const depth = 0.85 + 0.06 * Math.cos((hour - 15.0) * Math.PI * 4);
    return depth;
  }
  return 1.0;
}
