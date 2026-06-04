"use client";

import { useCallback, useRef, useState } from "react";

const DISMISS_THRESHOLD_PX = 72;
const SWIPE_START_PX = 12;

type TouchHandlers = {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchCancel: (event: React.TouchEvent) => void;
};

/**
 * Swipe-down-to-dismiss for bottom sheets. Bind handlers only on the backdrop
 * and on the sheet header strip (drag handle + title) — not on scrollable body.
 */
export function useBottomSheetSwipeDismiss(onDismiss: () => void) {
  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const dismissingRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    startYRef.current = null;
    startXRef.current = null;
    offsetRef.current = 0;
    dismissingRef.current = false;
    setOffset(0);
    setIsDragging(false);
  }, []);

  const makeHandlers = useCallback((): TouchHandlers => {
    function onTouchStart(event: React.TouchEvent) {
      const touch = event.touches[0];
      if (touch == null) {
        return;
      }

      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      dismissingRef.current = false;
      setIsDragging(true);
    }

    function onTouchMove(event: React.TouchEvent) {
      if (startYRef.current == null || startXRef.current == null) {
        return;
      }

      const touch = event.touches[0];
      if (touch == null) {
        return;
      }

      const deltaY = touch.clientY - startYRef.current;
      const deltaX = touch.clientX - startXRef.current;

      if (deltaY <= 0 || Math.abs(deltaY) < Math.abs(deltaX)) {
        return;
      }

      if (deltaY >= SWIPE_START_PX) {
        dismissingRef.current = true;
        offsetRef.current = deltaY;
        setOffset(deltaY);
        event.preventDefault();
      }
    }

    function onTouchEnd() {
      if (dismissingRef.current && offsetRef.current >= DISMISS_THRESHOLD_PX) {
        onDismiss();
      }
      reset();
    }

    return {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
    };
  }, [onDismiss, reset]);

  const headerSwipeHandlers = makeHandlers();
  const backdropSwipeHandlers = makeHandlers();

  return {
    offset,
    isDragging,
    headerSwipeHandlers,
    backdropSwipeHandlers,
  };
}
