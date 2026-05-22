export type WeatherSnapshot = {
  name: string;
  country: string;
  coord: { lat: number; lon: number };
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
};

export type ForecastPoint = {
  time: string;
  temp: number;
  min: number;
  max: number;
};

export type ForecastSummary = {
  daily: Array<{ day: string; min: number; max: number; date: string }>;
  hourly: ForecastPoint[];
};

export type AirQualitySnapshot = {
  aqi: number;
  components: {
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
  };
};

export type CountrySnapshot = {
  name: string;
  flag: string;
  population: number;
  region: string;
  subregion: string;
  languages: string[];
  currency: string;
  currencySymbol: string;
  languageScore: number;
};

export type DevMarketSnapshot = {
  totalCount: number;
  score: number;
};
