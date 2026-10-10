"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";

export function ToastViewport() {
  const { toast, dismissToast } = useCart();
  const { t } = useLanguage();

  return (
    <div aria-live="polite" className="toast-viewport">
      <AnimatePresence>
        {toast && (
          <motion.div
            animate={{ opacity: 1, x: 0, y: 0 }}
            className="toast-message rounded-xl"
            exit={{ opacity: 0, x: 36, y: -8 }}
            initial={{ opacity: 0, x: 36, y: -8 }}
            key={toast.id}
            role="status"
          >
            <span className="toast-icon"><Check size={14} /></span>
            <span>{t(toast.message)}</span>
            <button aria-label={t("toast.dismiss")} onClick={dismissToast} type="button"><X size={15} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
