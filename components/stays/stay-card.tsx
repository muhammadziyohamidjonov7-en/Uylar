"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/providers/cart-provider";
import type { Stay } from "@/lib/experiences";
import { luxeSpring, revealItem } from "@/lib/motion";
import { useLanguage } from "@/components/providers/language-provider";

const galleryFallbacks = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85",
];

export function StayCard({ stay, index }: Readonly<{ stay: Stay; index: number }>) {
  const { wishlist, toggleWishlist, openCheckout } = useCart();
  const { t, language } = useLanguage();
  const currency = new Intl.NumberFormat(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const isSaved = wishlist.includes(stay.id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [ripple, setRipple] = useState(false);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const tiltX = useTransform(rotateX, [-1, 1], [5, -5]);
  const tiltY = useTransform(rotateY, [-1, 1], [-6, 6]);
  const gallery = [stay.image, ...galleryFallbacks];
  const amenityLabels: Record<string, string> = {
    Spa: t("stay.amenitySpa"),
    Pool: t("stay.amenityPool"),
    Beachfront: t("stay.amenityBeachfront"),
    Dining: t("stay.amenityDining"),
  };
  const tagKeys = {
    "PRIVATE VILLA": "stay.tagPrivateVilla",
    "COASTAL RETREAT": "stay.tagCoastalRetreat",
    "CITY ICON": "stay.tagCityIcon",
    "MOUNTAIN SANCTUARY": "stay.tagMountainSanctuary",
  } as const;

  useEffect(() => {
    if (reduceMotion) {
      setDisplayPrice(stay.price);
      return;
    }
    const duration = 650;
    const start = performance.now();
    let frame = 0;
    function countPrice(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayPrice(Math.round(stay.price * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(countPrice);
    }
    frame = requestAnimationFrame(countPrice);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, stay.price]);

  function updateTilt(event: React.MouseEvent<HTMLElement>) {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateX.set((event.clientY - rect.top - rect.height / 2) / (rect.height / 2));
    rotateY.set((event.clientX - rect.left - rect.width / 2) / (rect.width / 2));
  }

  return (
    <motion.article
      className="stay-card rounded-2xl overflow-hidden"
      variants={revealItem}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      style={{ rotateX: reduceMotion ? 0 : tiltX, rotateY: reduceMotion ? 0 : tiltY, transformPerspective: 1000 }}
      whileHover={reduceMotion ? undefined : { y: -5, boxShadow: "0 24px 48px rgba(16, 28, 21, .16)" }}
      transition={{ ...luxeSpring, delay: Math.min(index, 6) * .07 }}
      onMouseMove={updateTilt}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
    >
      <div className="stay-card-image rounded-t-2xl">
        {!loaded && <span aria-hidden="true" className="stay-image-skeleton" />}
        <Image
          alt={`${stay.name}, ${stay.destination}`}
          className={`stay-cover-image${loaded ? " is-loaded" : ""}`}
          fill
          onLoad={() => setLoaded(true)}
          priority={stay.id === "casa-mami"}
          sizes="(max-width: 640px) 90vw, (max-width: 900px) 45vw, 25vw"
          src={gallery[imageIndex]}
          unoptimized
        />
        <span className="stay-tag"><span>{t(tagKeys[stay.tag as keyof typeof tagKeys])}</span></span>
        <button className="stay-quick-view" onClick={() => setQuickViewOpen(true)} type="button">{t("stay.quickView")}</button>
        <button
          aria-label={isSaved ? t("stay.unsave", { name: stay.name }) : t("stay.save", { name: stay.name })}
          aria-pressed={isSaved}
          className={`stay-save${isSaved ? " is-saved" : ""}`}
          onClick={() => toggleWishlist(stay.id)}
          type="button"
        >
          <motion.span animate={isSaved ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: .32 }}>
            <Heart size={17} fill={isSaved ? "currentColor" : "none"} strokeWidth={1.6} />
          </motion.span>
        </button>
      </div>
      <div className="stay-card-content">
        <div className="stay-card-location">{stay.destination}</div>
        <div className="stay-card-title">
          <h3>{stay.name}</h3>
          <span
            className="stay-rating"
            onMouseLeave={() => setRatingHover(0)}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              setRatingHover(Math.max(1, Math.min(5, Math.ceil(((event.clientX - bounds.left) / bounds.width) * 5))));
            }}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Star className={ratingHover === 0 || index < ratingHover ? "rating-star is-filled" : "rating-star"} key={index} size={10} fill="currentColor" />
            ))}
            {stay.rating} <small>({stay.reviews})</small>
          </span>
        </div>
        <div className="stay-amenities">{stay.amenities.map((amenity) => <span key={amenity}>{amenityLabels[amenity] ?? amenity}</span>)}</div>
        <div className="stay-card-bottom">
          <p><strong>{currency.format(displayPrice)}</strong> <span>{t("stay.night")}</span></p>
          <motion.button
            className={`stay-book-button${ripple ? " has-ripple" : ""}`}
            onClick={() => {
              setRipple(true);
              window.setTimeout(() => setRipple(false), 500);
              openCheckout("booking", stay.id);
            }}
            type="button"
            whileTap={{ scale: .96 }}
          >
            {t("stay.reserve")} <ArrowUpRight size={15} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {quickViewOpen && (
          <motion.div className="quick-view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQuickViewOpen(false);
          }}>
            <motion.section
              aria-label={t("stay.quickViewLabel", { name: stay.name })}
              aria-modal="true"
              className="quick-view-panel rounded-2xl"
              initial={{ y: 70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={luxeSpring}
              role="dialog"
            >
              <button aria-label={t("stay.closeQuickView")} className="checkout-close" onClick={() => setQuickViewOpen(false)} type="button"><X size={19} /></button>
              <div className="quick-view-gallery">
                <motion.div className="quick-view-photo" drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => {
                  if (info.offset.x < -50) setImageIndex((index) => (index + 1) % gallery.length);
                  if (info.offset.x > 50) setImageIndex((index) => (index - 1 + gallery.length) % gallery.length);
                }}>
                  <Image alt={t("stay.galleryView", { name: stay.name, index: imageIndex + 1 })} fill sizes="(max-width: 700px) 100vw, 560px" src={gallery[imageIndex]} unoptimized />
                </motion.div>
                <button aria-label={t("stay.previousImage")} className="gallery-arrow gallery-arrow-left" onClick={() => setImageIndex((index) => (index - 1 + gallery.length) % gallery.length)} type="button"><ArrowLeft size={16} /></button>
                <button aria-label={t("stay.nextImage")} className="gallery-arrow gallery-arrow-right" onClick={() => setImageIndex((index) => (index + 1) % gallery.length)} type="button"><ArrowRight size={16} /></button>
                <div className="gallery-dots">{gallery.map((image, index) => <button aria-label={t("stay.showImage", { index: index + 1 })} aria-current={index === imageIndex} className={index === imageIndex ? "is-current" : ""} key={image} onClick={() => setImageIndex(index)} type="button" />)}</div>
              </div>
              <div className="quick-view-details">
                <span className="eyebrow">{stay.destination} · {stay.tag}</span>
                <h2>{stay.name}</h2>
                <p>{t("stay.selectedDescription")}</p>
                <div className="stay-amenities">{stay.amenities.map((amenity) => <span key={amenity}>{amenityLabels[amenity] ?? amenity}</span>)}</div>
                <div className="quick-view-bottom"><strong>{currency.format(stay.price)} <small>{t("stay.night")}</small></strong><button className="checkout-primary" onClick={() => { setQuickViewOpen(false); openCheckout("booking", stay.id); }} type="button">{t("stay.reserveThis")} <ArrowRight size={15} /></button></div>
              </div>
            </motion.section>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.article>
  );
}
