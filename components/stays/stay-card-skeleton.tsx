"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";

export function StayCardSkeleton() {
  const { t } = useLanguage();
  return (
    <motion.div
      aria-label={t("accessibility.loadingStay")}
      className="stay-skeleton"
      initial={{ opacity: 0.65 }}
      animate={{ opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      role="status"
    >
      <span />
      <div><i /><i /><i /></div>
    </motion.div>
  );
}
