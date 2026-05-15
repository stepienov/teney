import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { TeneyLogo } from "@/components/brand/teney-logo";
import { Button } from "@/components/ui/button";

const highlights = [
  { label: "Klimat", value: "Spokojny & słoneczny" },
  { label: "Plaże", value: "Odkrywaj wybrzeża" },
  { label: "Sezon", value: "Kiedy tylko chcesz" },
] as const;

function WavePattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
      <svg
        className="absolute bottom-0 left-0 h-32 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 60c120-20 240-40 360-30s240 50 360 40 240-60 360-50 240 70 360 60 120-30 240-20 360-10v70H0V60z"
          fill="white"
          fillOpacity="0.12"
        />
        <path
          d="M0 80c160-30 320-10 480 0s320 20 480 10 320-40 480-30v50H0V80z"
          fill="white"
          fillOpacity="0.08"
        />
      </svg>
    </div>
  );
}

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-ocean-hero text-white">
        <WavePattern />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-16">
          <TeneyLogo className="w-[4.5rem] stroke-white" />

          <p className="mt-8 text-[0.65rem] font-medium uppercase tracking-caps-wide opacity-95 sm:text-xs">
            Tylko dobry klimat
          </p>

          <h1 className="font-heading mt-3 text-4xl font-bold uppercase tracking-[0.14em] sm:text-5xl md:text-6xl">
            Teney
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
            Twój spokojny przewodnik po plażach — turkus, słońce i zero pośpiechu.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              nativeButton={false}
              render={
                <Link
                  href="#status"
                  className="h-11! gap-2 rounded-full! border-0! bg-white! px-7! text-sm! font-semibold! text-ocean-deep! shadow-lg shadow-ocean-deep/15 hover:bg-ocean-mist!"
                >
                  Zobacz status
                  <ArrowRight className="size-4 text-ocean-teal" />
                </Link>
              }
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href="https://teney.app"
                  className="h-11! rounded-full! border-2! border-white/70! bg-transparent! px-7! text-sm! font-medium! text-white! hover:bg-white/15!"
                >
                  teney.app
                </Link>
              }
            />
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-ocean-foam to-transparent"
        />
      </section>

      <section className="relative mx-auto -mt-6 max-w-5xl px-4 sm:px-6">
        <dl className="grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white bg-white px-5 py-5 text-center shadow-[0_16px_48px_-24px_rgba(26,46,53,0.2)]"
            >
              <dt className="text-[0.65rem] font-semibold uppercase tracking-caps text-ocean-teal">
                {item.label}
              </dt>
              <dd className="font-heading mt-2 text-base font-bold text-ocean-deep">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
