"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { drawerSpring } from "@/lib/motion";
import { useLanguage } from "@/components/providers/language-provider";
import { getServiceNameKey } from "@/lib/i18n/translations";

export function CartDrawer() {
  const { items, itemCount, subtotal, cartOpen, setCartOpen, updateQuantity, removeItem, openCheckout } = useCart();
  const { t, language } = useLanguage();
  const currency = new Intl.NumberFormat(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "USD" });
  const itemName = (id: string, fallback: string) => {
    const key = getServiceNameKey(id);
    return key ? t(key) : fallback;
  };

  useEffect(() => {
    if (!cartOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCartOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [cartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            aria-label={t("cart.close")}
            animate={{ opacity: 1 }}
            className="cart-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            type="button"
          />
          <motion.aside
            animate={{ x: 0 }}
            aria-label={t("cart.label")}
            aria-modal="true"
            className="cart-drawer rounded-l-2xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            role="dialog"
            transition={drawerSpring}
          >
            <div className="cart-drawer-header">
              <div>
                <span className="eyebrow">MAISON LUXE</span>
                <h2>{t("cart.title")} <span>({itemCount})</span></h2>
              </div>
              <button aria-label={t("cart.close")} className="cart-close" onClick={() => setCartOpen(false)} type="button">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            {items.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty-icon"><ShoppingBag size={22} strokeWidth={1.3} /></span>
                <h3>{t("cart.emptyTitle")}</h3>
                <p>{t("cart.emptyBody")}</p>
                <a className="cart-browse-link" href="#home-services" onClick={() => setCartOpen(false)}>
                  {t("cart.browse")} <ArrowRight size={15} />
                </a>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                    <motion.div
                      className="cart-item"
                      drag="x"
                      dragConstraints={{ left: -130, right: 0 }}
                      dragDirectionLock
                      dragElastic={.12}
                      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                      initial={{ opacity: 0, x: 24 }}
                      key={item.id}
                      layout
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -85) removeItem(item.id);
                      }}
                      transition={drawerSpring}
                      whileDrag={{ backgroundColor: "rgba(212, 175, 55, .08)" }}
                    >
                      <div className="cart-item-copy">
                        <h3>{itemName(item.id, item.name)}</h3>
                        <span>{currency.format(item.price)}</span>
                        <button className="cart-remove" onClick={() => removeItem(item.id)} type="button">{t("cart.remove")}</button>
                      </div>
                      <div className="cart-quantity" aria-label={t("cart.quantity", { name: itemName(item.id, item.name) })}>
                        <button aria-label={t("cart.decrease", { name: itemName(item.id, item.name) })} onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">−</button>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span key={item.quantity} initial={{ scale: .65, y: 4 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .65, y: -4 }} transition={{ duration: .18 }}>
                            {item.quantity}
                          </motion.span>
                        </AnimatePresence>
                        <button aria-label={t("cart.increase", { name: itemName(item.id, item.name) })} onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
                      </div>
                    </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="cart-summary">
                  <div><span>{t("cart.subtotal")}</span><motion.strong key={subtotal} initial={{ scale: .94 }} animate={{ scale: 1 }}>{currency.format(subtotal)}</motion.strong></div>
                  <p>{t("cart.taxes")}</p>
                  <button className="cart-checkout" onClick={() => openCheckout("order")} type="button">
                    {t("cart.checkout")} <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function FloatingCheckoutBar() {
  const { itemCount, subtotal, cartOpen, setCartOpen, checkoutMode } = useCart();
  const { t, language } = useLanguage();
  const currency = new Intl.NumberFormat(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "USD" });

  return (
    <AnimatePresence>
      {itemCount > 0 && !cartOpen && !checkoutMode && (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          aria-label={t("cart.openWith", { count: itemCount, items: itemCount === 1 ? t("nav.item") : t("nav.items"), subtotal: currency.format(subtotal) })}
          className="floating-checkout-bar rounded-xl"
          exit={{ opacity: 0, y: 24 }}
          initial={{ opacity: 0, y: 24 }}
          onClick={() => setCartOpen(true)}
          transition={drawerSpring}
          type="button"
        >
          <span><ShoppingBag size={17} /> {itemCount} {itemCount === 1 ? t("cart.selection") : t("cart.selections")}</span>
          <strong>{currency.format(subtotal)}</strong>
          <span className="floating-checkout-action">{t("cart.view")} <ArrowRight size={15} /></span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
