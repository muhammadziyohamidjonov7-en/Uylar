"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { luxeSpring } from "@/lib/motion";
import { useLanguage } from "@/components/providers/language-provider";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 640);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          animate={{ opacity: 1, scale: 1, y: 0 }}
          aria-label={t("accessibility.backToTop")}
          className="back-to-top"
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
          transition={luxeSpring}
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.94 }}
        >
          <ArrowUp size={17} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
