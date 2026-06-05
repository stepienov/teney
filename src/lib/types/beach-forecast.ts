export type BeachForecastHourDto = {
  datetime: string;
  temp: number | null;
  feelsLike: number | null;
  precipProb: number | null;
  windSpeed: number | null;
  cloudCover: number | null;
  conditions: string | null;
};

export type BeachForecastDayDto = {
  weatherDate: string;
  tempMin: number | null;
  tempMax: number | null;
  feelsLike: number | null;
  precipProb: number | null;
  windSpeed: number | null;
  uvIndex: number | null;
  cloudCover: number | null;
  conditions: string | null;
  description: string | null;
};

export type BeachForecastWeather = {
  poiId: number;
  fetchedAt: string;
  hourly: BeachForecastHourDto[];
  daily: BeachForecastDayDto[];
};
