import { MapPin, Sun, Umbrella } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Odkrywaj wybrzeże",
    description:
      "Przeglądaj plaże z lokalizacją i szczegółami — przejrzyście, na spokojnie.",
  },
  {
    icon: Umbrella,
    title: "Dzień na luzie",
    description:
      "Planuj wizytę bez chaosu — interfejs, który nie rozprasza od widoków.",
  },
  {
    icon: Sun,
    title: "Oceaniczny klimat",
    description:
      "Turkus, błękit i biel — kolory jak czysta woda i letnie niebo.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <div className="mx-auto mb-10 max-w-lg text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-caps-wide text-ocean-teal">
          Po prostu plaża
        </p>
        <h2 className="font-heading mt-2 text-2xl font-bold uppercase tracking-[0.08em] text-ocean-deep sm:text-3xl">
          Good vibe only
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Minimalizm, morze i przestrzeń — dokładnie jak na Twoim moodboardzie.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="group rounded-3xl border border-border bg-white p-6 shadow-[0_12px_40px_-20px_rgba(26,46,53,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-18px_rgba(64,179,194,0.35)]"
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full border-2 border-ocean-teal/40 text-ocean-deep transition-colors group-hover:border-ocean-teal group-hover:bg-ocean-cyan/30">
              <Icon className="size-5 stroke-[1.5]" aria-hidden />
            </div>
            <h3 className="font-heading mt-5 text-center text-sm font-bold uppercase tracking-wide text-ocean-deep">
              {title}
            </h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
