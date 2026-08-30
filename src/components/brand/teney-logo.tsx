import { cn } from "@/lib/utils";

const LIGHT_SRC = "/brand/teney-lockup-on-light.png";
const DARK_SRC = "/brand/teney-lockup-on-dark.png";

const LIGHT_SIZE = { width: 1600, height: 518 };
const DARK_SIZE = { width: 1600, height: 419 };

type TeneyLogoProps = {
  className?: string;
  /** Header lockup vs larger about/hero lockup. */
  size?: "header" | "hero";
};

export function TeneyLogo({ className, size = "header" }: TeneyLogoProps) {
  const heightClass = size === "hero" ? "h-16 sm:h-[4.5rem]" : "h-14 sm:h-16";

  return (
    <span className={cn("relative inline-flex shrink-0 items-center", className)}>
      <img
        src={LIGHT_SRC}
        alt="teney.APP"
        width={LIGHT_SIZE.width}
        height={LIGHT_SIZE.height}
        className={cn(heightClass, "w-auto dark:hidden")}
        decoding="async"
      />
      <img
        src={DARK_SRC}
        alt=""
        width={DARK_SIZE.width}
        height={DARK_SIZE.height}
        className={cn(heightClass, "hidden w-auto dark:block")}
        decoding="async"
        aria-hidden
      />
    </span>
  );
}
