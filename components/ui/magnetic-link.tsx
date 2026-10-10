"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

export function MagneticLink({
  children,
  className,
  href,
}: Readonly<{ children: ReactNode; className?: string; href: string }>) {
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });

  function move(event: MouseEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.14);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.14);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a className={className} href={href} onMouseMove={move} onMouseLeave={reset} style={{ x, y }}>
      {children}
    </motion.a>
  );
}
