import { ApiHealthStatus } from "@/components/api-health-status";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="mx-auto w-full max-w-5xl space-y-16 px-4 pb-20 sm:px-6">
        <FeatureGrid />
        <section id="status" className="scroll-mt-24">
          <div className="mx-auto mb-6 max-w-lg text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-caps-wide text-ocean-teal">
              Status
            </p>
            <h2 className="font-heading mt-2 text-2xl font-bold uppercase tracking-[0.08em] text-ocean-deep sm:text-3xl">
              Wszystko gra?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Krótki podgląd, czy serwer odpowiada.
            </p>
          </div>
          <div className="mx-auto max-w-lg">
            <ApiHealthStatus />
          </div>
        </section>
      </div>
    </>
  );
}
