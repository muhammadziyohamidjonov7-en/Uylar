"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";

const progressIntervalMs = 25;

export function Preloader() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let currentProgress = 0;
    let exitFrame = 0;
    const timer = window.setInterval(() => {
      currentProgress = Math.min(100, currentProgress + 1);
      setProgress(currentProgress);
      if (currentProgress === 100) {
        window.clearInterval(timer);
        exitFrame = window.requestAnimationFrame(() => setVisible(false));
      }
    }, progressIntervalMs);

    return () => {
      window.clearInterval(timer);
      window.cancelAnimationFrame(exitFrame);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-[1000] flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden bg-[#0B0F12] px-6 text-center text-white"
          exit={{ opacity: 0, y: -20 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full max-w-sm">
            <div aria-hidden="true" className="relative mx-auto mb-10 grid h-28 w-28 place-items-center">
              <motion.span
                animate={{ rotate: reduceMotion ? 0 : 360 }}
                className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/80 shadow-[0_0_24px_rgba(212,175,55,0.18)]"
                transition={reduceMotion ? { duration: 0 } : { duration: 14, ease: "linear", repeat: Infinity }}
              />
              <span className="absolute inset-[9px] rounded-full border border-[#D4AF37]/35 shadow-[inset_0_0_18px_rgba(212,175,55,0.08),0_0_20px_rgba(212,175,55,0.14)]" />
              <motion.span
                animate={{ rotate: reduceMotion ? 0 : -360 }}
                className="absolute inset-[17px] rounded-full border border-dotted border-[#D4AF37]/40"
                transition={reduceMotion ? { duration: 0 } : { duration: 22, ease: "linear", repeat: Infinity }}
              />
              <Crown className="h-10 w-10 text-[#E7C873] drop-shadow-[0_0_14px_rgba(231,200,115,0.75)]" strokeWidth={1.25} />
            </div>

            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#B88A3B] via-[#F5E6A8] to-[#C49A4A] bg-clip-text font-serif text-3xl font-medium tracking-[0.24em] text-transparent sm:text-4xl"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.12, duration: 0.7 }}
            >
              MAISON LUXE
            </motion.h1>
            <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.34em] text-white/55 sm:text-[10px]">
              GRAND PALACE &amp; LUXURY SUITES
            </p>

            <div
              aria-label={`${progress}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
              className="mt-12 h-1 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
            >
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#9C712D] via-[#F1D889] to-[#C79A45] shadow-[0_0_12px_rgba(212,175,55,0.7)]"
                transition={reduceMotion ? { duration: 0 } : { duration: progressIntervalMs / 1000, ease: "linear" }}
              />
            </div>
            <p aria-live="polite" className="mt-4 text-[10px] uppercase tracking-[0.13em] text-[#D9C58B]/75">
              {progress}% <span aria-hidden="true">•</span> {t("preloader.status")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
