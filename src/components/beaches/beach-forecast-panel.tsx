import { BeachWeatherSummary } from "@/components/beaches/beach-weather-summary";
import {
  formatForecastDayLabel,
  formatForecastHourLabel,
} from "@/lib/beach-forecast-labels";
import type {
  BeachForecastDayDto,
  BeachForecastHourDto,
  BeachForecastWeather,
} from "@/lib/types/beach-forecast";
import type { BeachDisplayWeather } from "@/lib/types/beach-list";
import { cn } from "@/lib/utils";

type BeachForecastPanelLabels = {
  title: string;
  upcomingDays: string;
  today: string;
  tomorrow: string;
  now: string;
  noWeather: string;
};

type BeachForecastPanelProps = {
  forecast: BeachForecastWeather | null;
  locale: string;
  labels: BeachForecastPanelLabels;
};

const SECTION_TITLE_CLASS =
  "font-heading text-base font-bold text-ocean-deep sm:text-lg";

function hourToDisplayWeather(hour: BeachForecastHourDto): BeachDisplayWeather {
  return {
    weatherDate: hour.datetime.slice(0, 10),
    tempMin: hour.temp,
    tempMax: hour.temp,
    feelsLike: hour.feelsLike,
    precipProb: hour.precipProb,
    windSpeed: hour.windSpeed,
    uvIndex: null,
    cloudCover: hour.cloudCover,
    conditions: hour.conditions,
    description: null,
    fetchedAt: null,
  };
}

function dayToDisplayWeather(day: BeachForecastDayDto): BeachDisplayWeather {
  return {
    weatherDate: day.weatherDate,
    tempMin: day.tempMin,
    tempMax: day.tempMax,
    feelsLike: day.feelsLike,
    precipProb: day.precipProb,
    windSpeed: day.windSpeed,
    uvIndex: day.uvIndex,
    cloudCover: day.cloudCover,
    conditions: day.conditions,
    description: null,
    fetchedAt: null,
  };
}

function ForecastSlot({
  label,
  weather,
  labelClassName,
  layoutClassName,
}: {
  label: string;
  weather: BeachDisplayWeather;
  labelClassName?: string;
  layoutClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        layoutClassName,
      )}
    >
      <span
        className={cn(
          "shrink-0 text-[11px] font-bold uppercase tabular-nums text-ocean-deep sm:text-xs",
          labelClassName,
        )}
      >
        {label}
      </span>
      <BeachWeatherSummary weather={weather} compact className="min-w-0 flex-1" />
    </div>
  );
}

export function BeachForecastPanel({
  forecast,
  locale,
  labels,
}: BeachForecastPanelProps) {
  const hourly = forecast?.hourly ?? [];
  const upcomingDays = forecast?.daily?.slice(1) ?? [];

  if (hourly.length === 0 && upcomingDays.length === 0) {
    return (
      <section>
        <h2 className={SECTION_TITLE_CLASS}>{labels.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{labels.noWeather}</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {hourly.length > 0 ? (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>{labels.title}</h2>
          <ul className="mt-3 flex list-none flex-col gap-3 p-0 sm:mt-4 sm:grid sm:grid-cols-3 sm:gap-x-10 sm:gap-y-0">
            {hourly.map((hour, index) => (
              <li key={hour.datetime}>
                <ForecastSlot
                  label={formatForecastHourLabel(
                    hour.datetime,
                    index === 0,
                    labels.now,
                  )}
                  weather={hourToDisplayWeather(hour)}
                  labelClassName="w-11 sm:w-auto sm:min-w-[3.25rem]"
                  layoutClassName="sm:flex-col sm:items-start sm:gap-1.5"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {upcomingDays.length > 0 ? (
        <section>
          <h2 className={SECTION_TITLE_CLASS}>{labels.upcomingDays}</h2>
          <ul className="mt-3 flex list-none flex-col gap-3 p-0 sm:mt-4 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-4 lg:grid-cols-4">
            {upcomingDays.map((day) => (
              <li key={day.weatherDate}>
                <ForecastSlot
                  label={formatForecastDayLabel(day.weatherDate, locale, {
                    today: labels.today,
                    tomorrow: labels.tomorrow,
                  })}
                  weather={dayToDisplayWeather(day)}
                  labelClassName="w-24 capitalize sm:w-auto sm:min-w-0 sm:normal-case sm:text-sm sm:font-semibold"
                  layoutClassName="sm:flex-col sm:items-start sm:gap-1.5"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
