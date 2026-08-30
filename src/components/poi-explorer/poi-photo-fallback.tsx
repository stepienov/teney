import type { LucideIcon } from "lucide-react";

export function PoiPhotoFallback({
  icon: Icon,
  label,
}: {
  icon?: LucideIcon;
  label: string;
}) {
  return (
    <div className="relative aspect-[16/8] max-h-[28rem] min-h-48 w-full overflow-hidden bg-sand/40 sm:min-h-64">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/35">
        {Icon ? <Icon className="size-12 stroke-[1.25]" aria-hidden /> : null}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
