import { defaultBeachWeatherDate } from "@/lib/api/beaches-search";

function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function formatForecastHourLabel(
  datetime: string,
  isFirst: boolean,
  nowLabel: string,
): string {
  if (isFirst) {
    return nowLabel.toUpperCase();
  }

  const match = datetime.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : datetime;
}

export function formatForecastDayLabel(
  weatherDate: string,
  locale: string,
  labels: { today: string; tomorrow: string },
): string {
  const today = defaultBeachWeatherDate();

  if (weatherDate === today) {
    return labels.today;
  }

  if (weatherDate === addCalendarDays(today, 1)) {
    return labels.tomorrow;
  }

  const date = new Date(`${weatherDate}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return weatherDate;
  }

  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
}
