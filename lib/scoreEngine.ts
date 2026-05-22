export type Weights = {
  weather: number;
  costOfLiving: number;
  devMarket: number;
  language: number;
};

export type CityData = {
  tempC: number;
  aqi: number;
  githubScore: number;
  languageScore: number;
};

function normalizeTemperature(tempC: number) {
  const ideal = 22;
  const delta = Math.abs(tempC - ideal);
  return Math.max(0, 100 - delta * 4);
}

function normalizeAqi(aqi: number) {
  const clamped = Math.min(5, Math.max(1, aqi));
  return 100 - (clamped - 1) * 20;
}

export function calculateScore(data: CityData, weights: Weights) {
  const weatherScore =
    normalizeTemperature(data.tempC) * 0.7 + normalizeAqi(data.aqi) * 0.3;
  const costScore = 50;
  const devScore = Math.max(0, Math.min(100, data.githubScore));
  const languageScore = Math.max(0, Math.min(100, data.languageScore));

  const totalWeight =
    weights.weather + weights.costOfLiving + weights.devMarket + weights.language;
  if (totalWeight <= 0) return 0;

  const weighted =
    weatherScore * weights.weather +
    costScore * weights.costOfLiving +
    devScore * weights.devMarket +
    languageScore * weights.language;

  return Math.round(weighted / totalWeight);
}
