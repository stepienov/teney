import { cn } from "@/lib/utils";

type TeneyLogoProps = {
  className?: string;
};

/**
 * Minimal line-art mark inspired by coastal badge shapes (stadium + sun + waves).
 */
export function TeneyLogo({ className }: TeneyLogoProps) {
  return (
    <svg
      viewBox="0 0 56 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-14", className)}
      aria-hidden
    >
      <rect
        x="4"
        y="2"
        width="48"
        height="68"
        rx="24"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="28" cy="22" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M28 10v3M28 31v3M17 22h3M36 22h3M20 15l2 2M34 29l2 2M36 15l-2 2M20 29l-2 2"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M14 38h6l2-4h8l2 4h6"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M10 48c4 3 8 4 18 4s14-1 18-4M12 56c5 3 10 4 16 4s11-1 16-4M14 64c4 2 9 3 14 3s10-1 14-3"
      />
    </svg>
  );
}
