"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ConciergeBell, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";

export function ConciergeChatWidget() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="concierge-chat">
      <AnimatePresence>
        {open && (
          <motion.aside
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label={t("chat.label")}
            className="chat-panel rounded-2xl"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            role="dialog"
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <div className="chat-panel-heading">
              <span className="chat-agent-icon"><ConciergeBell size={17} /></span>
              <div><strong>{t("chat.title")}</strong><span>{t("chat.availability")}</span></div>
              <button aria-label={t("chat.close")} onClick={() => setOpen(false)} type="button"><X size={17} /></button>
            </div>
            <p className="chat-message">{t("chat.message")}</p>
            <a className="chat-contact" href="mailto:concierge@maisonluxe.example">{t("chat.contact")} <ArrowUpRight size={15} /></a>
          </motion.aside>
        )}
      </AnimatePresence>
      <motion.button
        animate={{ scale: [1, 1.04, 1] }}
        aria-expanded={open}
        aria-label={open ? t("chat.close") : t("chat.open")}
        className="chat-launcher"
        onClick={() => setOpen((isOpen) => !isOpen)}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        type="button"
        whileTap={{ scale: 0.94 }}
      >
        {open ? <X size={19} /> : <MessageCircle size={19} />}
        {!open && <span className="chat-notification" />}
      </motion.button>
    </div>
  );
}
