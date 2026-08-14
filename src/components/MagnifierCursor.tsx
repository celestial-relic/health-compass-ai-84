import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const ZOOM_SELECTOR = "p,h1,h2,h3,h4,h5,li,td,th,label,figcaption,blockquote,span,a,button,strong";
const SCALE = 1.6;

/**
 * A real magnifying-glass cursor: the lens follows the pointer and only the
 * element directly under the lens is enlarged — the rest of the page stays put.
 */
export function MagnifierCursor({ active }: { active: boolean }) {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 900, damping: 45, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 900, damping: 45, mass: 0.35 });
  const targetRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("magnifier-active");

    const clear = () => {
      const el = targetRef.current;
      if (el) {
        el.style.transform = "";
        el.style.transition = "";
        el.style.willChange = "";
        el.style.position = "";
        el.style.zIndex = "";
      }
      targetRef.current = null;
    };

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const candidate = under?.closest(ZOOM_SELECTOR) as HTMLElement | null;

      if (candidate !== targetRef.current) clear();
      if (!candidate || candidate.dataset["noZoom"] === "true") return;

      const rect = candidate.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || rect.width > window.innerWidth * 0.95) return;

      targetRef.current = candidate;
      const ox = ((e.clientX - rect.left) / rect.width) * 100;
      const oy = ((e.clientY - rect.top) / rect.height) * 100;
      candidate.style.willChange = "transform";
      candidate.style.transition = "transform 120ms ease-out";
      candidate.style.transformOrigin = `${ox}% ${oy}%`;
      candidate.style.transform = `scale(${SCALE})`;
      if (getComputedStyle(candidate).position === "static") candidate.style.position = "relative";
      candidate.style.zIndex = "5";
    };

    const onLeave = () => {
      setVisible(false);
      clear();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", clear, { passive: true });

    return () => {
      document.body.classList.remove("magnifier-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", clear);
      clear();
    };
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="h-24 w-24 rounded-full border-2 border-primary/70 bg-primary/5 shadow-glow backdrop-blur-[1px]" />
        <div className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60" />
        <div className="absolute top-[78%] left-[78%] h-10 w-2 origin-top rotate-[-45deg] rounded-full bg-primary/70" />
      </div>
    </motion.div>
  );
}
