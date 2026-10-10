"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, ConciergeBell, Hotel, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { setSearch, search } = useCart();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 700], [0, 105]);
  const backgroundScale = useTransform(scrollY, [0, 700], [1.02, 1.12]);
  const [mode, setMode] = useState<"stay" | "delivery">(search.mode);
  const [destination, setDestination] = useState(search.mode === "stay" ? search.destination : "");
  const [checkIn, setCheckIn] = useState(search.checkIn);
  const [checkOut, setCheckOut] = useState(search.checkOut);
  const [guests, setGuests] = useState(search.guests);
  const [address, setAddress] = useState(search.mode === "delivery" ? search.destination : "");
  const [serviceTime, setServiceTime] = useState("18:00");
  const [guestOpen, setGuestOpen] = useState(false);
  const minimumDate = dateString(new Date());
  const titleLines = [t("hero.titleLine1"), t("hero.titleLine2")];
  const particles = Array.from({ length: 16 }, (_, index) => ({
    left: `${(index * 37 + 11) % 100}%`,
    delay: (index % 8) * 0.8,
    duration: 8 + (index % 5) * 2,
    size: 2 + (index % 3),
  }));

  useEffect(() => {
    setMode(search.mode);
    setDestination(search.mode === "stay" ? search.destination : "");
    setAddress(search.mode === "delivery" ? search.destination : "");
    setCheckIn(search.checkIn);
    setCheckOut(search.mode === "stay" ? search.checkOut : "");
    if (/^\d{2}:\d{2}$/.test(search.checkOut)) setServiceTime(search.checkOut);
    setGuests(search.guests);
  }, [search]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch({
      mode,
      destination: mode === "stay" ? destination.trim() : address.trim(),
      checkIn,
      checkOut: mode === "stay" ? checkOut : serviceTime,
      guests,
    });
    document.getElementById(mode === "stay" ? "hotel-stays" : "home-services")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero" ref={heroRef}>
      <motion.div
        aria-hidden="true"
        className="hero-background"
        style={reduceMotion ? undefined : { y: backgroundY, scale: backgroundScale }}
      />
      <div className="hero-shade" />
      <div className="hero-ambient" aria-hidden="true">
        <motion.span className="ambient-orb ambient-orb-one" animate={reduceMotion ? undefined : { x: [0, 24, -10, 0], y: [0, -18, 12, 0], scale: [1, 1.12, .96, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
        <motion.span className="ambient-orb ambient-orb-two" animate={reduceMotion ? undefined : { x: [0, -20, 12, 0], y: [0, 14, -20, 0], scale: [1, .94, 1.1, 1] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} />
        <motion.span className="ambient-orb ambient-orb-three" animate={reduceMotion ? undefined : { x: [0, -10, 18, 0], y: [0, 14, -8, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }} />
        {!reduceMotion && particles.map((particle, index) => (
          <motion.span
            aria-hidden="true"
            className="gold-particle"
            key={index}
            style={{ left: particle.left, width: particle.size, height: particle.size }}
            animate={{ y: [30, -190], opacity: [0, .68, .52, 0], x: [0, index % 2 ? 11 : -9, 0] }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>
      <div className="hero-content page-container">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="eyebrow hero-eyebrow">{t("hero.eyebrow")}</p>
          <h1 aria-label={t("hero.title")}>
            {titleLines.map((line, lineIndex) => (
              <span aria-hidden="true" className="hero-title-line" key={line}>
                {line.split("").map((character, index) => {
                  const italic = lineIndex === 1 && character !== " " && index > line.lastIndexOf(" ");
                  return (
                    <motion.span
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      className={italic ? "hero-title-char is-italic" : "hero-title-char"}
                      initial={reduceMotion ? false : { opacity: 0, y: 15, filter: "blur(5px)" }}
                      key={`${lineIndex}-${index}`}
                      transition={{ duration: .35, delay: reduceMotion ? 0 : .12 + lineIndex * .28 + index * .022, ease: "easeOut" }}
                    >
                      {character === " " ? "\u00a0" : character}
                    </motion.span>
                  );
                })}
                {lineIndex === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-description">
            {t("hero.description")}
          </p>
        </motion.div>

        <motion.div
          className="hero-search rounded-2xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          whileHover={reduceMotion ? undefined : { rotateX: 1.1, rotateY: -.6, y: -2 }}
          style={{ transformPerspective: 1000 }}
        >
          <div className="search-mode-tabs" role="tablist" aria-label={t("hero.chooseExperience")}>
            <button
              aria-selected={mode === "stay"}
              className={`rounded-lg${mode === "stay" ? " is-active" : ""}`}
              onClick={() => setMode("stay")}
              role="tab"
              type="button"
            >
              <Hotel size={15} /> {t("hero.bookStay")}
            </button>
            <button
              aria-selected={mode === "delivery"}
              className={`rounded-lg${mode === "delivery" ? " is-active" : ""}`}
              onClick={() => setMode("delivery")}
              role="tab"
              type="button"
            >
              <ConciergeBell size={15} /> {t("hero.orderServices")}
            </button>
          </div>
          <form className="search-form" onSubmit={submitSearch}>
            <label className="search-field search-destination">
              <span>{mode === "stay" ? t("hero.destination") : t("hero.deliverTo")}</span>
              <span className="search-input-wrap"><MapPin size={15} />
                <input
                  onChange={(event) => mode === "stay" ? setDestination(event.target.value) : setAddress(event.target.value)}
                  placeholder={mode === "stay" ? t("hero.destinationPlaceholder") : t("hero.addressPlaceholder")}
                  required
                  value={mode === "stay" ? destination : address}
                />
              </span>
            </label>
            <label className="search-field">
              <span>{mode === "stay" ? t("hero.checkIn") : t("hero.serviceDate")}</span>
              <input min={minimumDate} onChange={(event) => setCheckIn(event.target.value)} required type="date" value={checkIn} />
            </label>
            <label className="search-field">
              <span>{mode === "stay" ? t("hero.checkOut") : t("hero.preferredTime")}</span>
              {mode === "stay" ? (
                <input min={checkIn || minimumDate} onChange={(event) => setCheckOut(event.target.value)} required type="date" value={checkOut} />
              ) : (
                <input aria-label={t("hero.preferredServiceTime")} onChange={(event) => setServiceTime(event.target.value)} required type="time" value={serviceTime} />
              )}
            </label>
            {mode === "stay" ? (
              <div className="search-field search-guests">
                <span>{t("hero.guests")}</span>
                <button aria-expanded={guestOpen} className="guest-select" onClick={() => setGuestOpen((open) => !open)} type="button">
                  <Users size={15} /> {guests} {guests === 1 ? t("hero.guest") : t("hero.guestsPlural")}
                </button>
                {guestOpen && (
                  <div className="guest-popover rounded-2xl">
                    <span>{t("hero.guests")}</span>
                    <button aria-label={t("hero.decreaseGuests")} disabled={guests <= 1} onClick={() => setGuests((count) => Math.max(1, count - 1))} type="button"><Minus size={14} /></button>
                    <strong>{guests}</strong>
                    <button aria-label={t("hero.increaseGuests")} disabled={guests >= 10} onClick={() => setGuests((count) => Math.min(10, count + 1))} type="button"><Plus size={14} /></button>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-field search-guests">
                <span>{t("hero.experience")}</span>
                <span className="search-experience-choice"><ConciergeBell size={15} /> {t("hero.diningConcierge")}</span>
              </div>
            )}
            <button className="search-submit" type="submit">
              <Search size={17} /> <span>{t("hero.discover")}</span>
            </button>
          </form>
        </motion.div>

        <div className="hero-journeys" aria-label={t("hero.explore")}>
          <motion.a className="hero-journey rounded-2xl" href="#hotel-stays" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="hero-journey-icon"><Hotel size={18} strokeWidth={1.5} /></span>
            <span className="hero-journey-copy"><span className="hero-journey-label">{t("hero.stay")}</span><strong>{t("hero.handpicked")}</strong></span>
            <ArrowRight className="hero-journey-arrow" size={16} />
          </motion.a>
          <motion.a className="hero-journey rounded-2xl" href="#home-services" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <span className="hero-journey-icon"><ConciergeBell size={18} strokeWidth={1.5} /></span>
            <span className="hero-journey-copy"><span className="hero-journey-label">{t("hero.concierge")}</span><strong>{t("hero.arranged")}</strong></span>
            <ArrowRight className="hero-journey-arrow" size={16} />
          </motion.a>
        </div>
      </div>
      <motion.a
        className="hero-scroll"
        href="#discover"
        animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>{t("hero.scroll")}</span><ArrowDown size={14} strokeWidth={1.5} />
      </motion.a>
      <div className="hero-caption"><span>01 / 03</span><span>Casa Mami · Puglia, Italy</span></div>
    </section>
  );
}
