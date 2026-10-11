import { useState, useEffect } from "react";

/**
 * Reactive window scroll hook with hysteresis deadband to prevent
 * jitter/vibration at the threshold boundary when scrolling between states.
 *
 * @param threshold Scroll distance (px) to activate scrolled state (default: 40)
 * @param resetThreshold Scroll distance (px) to deactivate scrolled state (default: 15)
 */
export function useScroll(threshold: number = 40, resetThreshold: number = 15): boolean {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    let current = window.scrollY > threshold;
    setScrolled(current);

    const handleScroll = () => {
      const y = window.scrollY;
      if (!current && y > threshold) {
        current = true;
        setScrolled(true);
      } else if (current && y <= resetThreshold) {
        current = false;
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, resetThreshold]);

  return scrolled;
}
