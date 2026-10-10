"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronRight, Heart, MapPin, PackageCheck, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { stays } from "@/lib/experiences";
import type { Order } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { getServiceNameKey } from "@/lib/i18n/translations";

const statusSteps: Order["status"][] = ["Confirmed", "Preparing", "On the way", "Delivered"];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function ExperienceDashboard() {
  const { bookings, orders, wishlist, updateOrderStatus, openCheckout } = useCart();
  const { t, language } = useLanguage();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const activeOrder = orders.find((order) => order.id === activeOrderId);
  const savedStays = stays.filter((stay) => wishlist.includes(stay.id));
  const orderStatusLabel = (status: Order["status"]) => {
    if (status === "Confirmed") return t("order.confirmed");
    if (status === "Preparing") return t("order.preparing");
    if (status === "On the way") return t("order.onWay");
    return t("dashboard.delivered");
  };
  const orderItemName = (id: string, fallback: string) => {
    const key = getServiceNameKey(id);
    return key ? t(key) : fallback;
  };

  function advanceOrder(order: Order) {
    const currentIndex = statusSteps.indexOf(order.status);
    if (currentIndex < statusSteps.length - 1) updateOrderStatus(order.id, statusSteps[currentIndex + 1]);
  }

  return (
    <section className="journey-section" id="your-journey">
      <div className="page-container">
        <div className="experiences-heading">
          <div>
            <span className="eyebrow">{t("dashboard.eyebrow")}</span>
            <h2>{t("dashboard.title")}</h2>
          </div>
          <p>{t("dashboard.description")}</p>
        </div>

        <div className="journey-grid">
          <section className="journey-panel journey-panel--stays rounded-2xl border border-[#1b3026] bg-[#0b1410]">
            <div className="journey-panel-heading"><span><CalendarDays size={16} /> {t("dashboard.stays")}</span><strong>{bookings.length}</strong></div>
            {bookings.length ? bookings.map((booking) => (
              <article className="history-row" key={booking.id}>
                <div><h3>{booking.property}</h3><p>{booking.destination} · {booking.checkIn} — {booking.checkOut}</p></div>
                <strong>{currency.format(booking.total)}</strong>
              </article>
            )) : <p className="journey-empty">{t("dashboard.emptyStays")}</p>}
          </section>
          <section className="journey-panel journey-panel--orders rounded-2xl border border-[#1b3026] bg-[#0b1410]">
            <div className="journey-panel-heading"><span><PackageCheck size={16} /> {t("dashboard.orders")}</span><strong>{orders.length}</strong></div>
            {orders.length ? orders.map((order) => (
              <article className="history-row" key={order.id}>
                <div><h3>{order.items.map((item) => orderItemName(item.id, item.name)).join(", ")}</h3><p>{orderStatusLabel(order.status)} · {new Date(order.scheduledFor).toLocaleString(language)}</p></div>
                <button aria-label={t("dashboard.trackOrder", { id: order.id })} className="history-open" onClick={() => setActiveOrderId(order.id)} type="button"><ChevronRight size={18} /></button>
              </article>
            )) : <p className="journey-empty">{t("dashboard.emptyOrders")}</p>}
          </section>
          <section className="journey-panel journey-panel--saved saved-panel rounded-2xl border border-[#1b3026] bg-[#0b1410]">
            <div className="journey-panel-heading"><span><Heart size={16} /> {t("dashboard.saved")}</span><strong>{savedStays.length}</strong></div>
            {savedStays.length ? savedStays.map((stay) => (
              <article className="history-row" key={stay.id}>
                <div><h3>{stay.name}</h3><p><MapPin size={12} /> {stay.destination}</p></div>
                <button className="history-reserve" onClick={() => openCheckout("booking", stay.id)} type="button">{t("dashboard.reserve")} <ArrowRight size={13} /></button>
              </article>
            )) : <p className="journey-empty">{t("dashboard.emptySaved")}</p>}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {activeOrder && (
          <motion.div
            animate={{ opacity: 1 }}
            className="checkout-backdrop tracker-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActiveOrderId(null);
            }}
          >
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              aria-label={t("dashboard.trackOrder", { id: activeOrder.id })}
              aria-modal="true"
              className="tracker-modal rounded-2xl"
              initial={{ opacity: 0, y: 12 }}
              role="dialog"
            >
              <button aria-label={t("dashboard.closeTracking")} className="checkout-close" onClick={() => setActiveOrderId(null)} type="button"><X size={19} /></button>
              <span className="eyebrow">{t("dashboard.trackingEyebrow")}</span>
              <h2>{t("dashboard.trackingTitle")}</h2>
              <p className="tracker-reference">{activeOrder.id} · {activeOrder.deliveryAddress}<br />{t("dashboard.scheduled", { date: new Date(activeOrder.scheduledFor).toLocaleString(language) })}</p>
              <div className="order-progress">
                {statusSteps.map((status, index) => {
                  const activeIndex = statusSteps.indexOf(activeOrder.status);
                  const complete = index <= activeIndex;
                  return (
                    <div className={`order-progress-step${complete ? " is-complete" : ""}`} key={status}>
                      <motion.span
                        animate={index === activeIndex ? { scale: [1, 1.13, 1], boxShadow: ["0 0 0 rgba(71, 126, 91, 0)", "0 0 0 7px rgba(71, 126, 91, .12)", "0 0 0 rgba(71, 126, 91, 0)"] } : { scale: 1 }}
                        className="order-progress-dot"
                        transition={index === activeIndex ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: .2 }}
                      >
                        {complete ? "✓" : index + 1}
                      </motion.span>
                      <span>{orderStatusLabel(status)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="tracker-disclaimer">{t("dashboard.statusDisclaimer")}</p>
              <button
                className="checkout-primary"
                disabled={activeOrder.status === "Delivered"}
                onClick={() => advanceOrder(activeOrder)}
                type="button"
              >
                {activeOrder.status === "Delivered" ? t("dashboard.delivered") : t("dashboard.nextStatus")} <ArrowRight size={16} />
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
