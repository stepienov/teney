"use client";

import { useEffect, useRef } from "react";

type BeachLoadMoreSentinelProps = {
  onVisible: () => void;
  disabled?: boolean;
};

export function BeachLoadMoreSentinel({
  onVisible,
  disabled = false,
}: BeachLoadMoreSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    const node = ref.current;
    if (!node || disabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisibleRef.current();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled]);

  return <div ref={ref} className="h-px w-full sm:hidden" aria-hidden />;
}
