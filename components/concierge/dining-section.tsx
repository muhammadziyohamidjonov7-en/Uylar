"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CarFront, ConciergeBell, MapPin, Minus, Plus, Sparkles, Utensils, Users } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import type { ConciergeItem } from "@/lib/experiences";
import { useLanguage } from "@/components/providers/language-provider";
import { getServiceDescriptionKey, getServiceEyebrowKey, getServiceNameKey } from "@/lib/i18n/translations";

const categoryIcon = {
  dining: Utensils,
  transfer: ConciergeBell,
  wellness: Sparkles,
  other: Sparkles,
};

function ExperienceCard({ item }: Readonly<{ item: ConciergeItem }>) {
  const { addItem, items, updateQuantity } = useCart();
  const { t, language } = useLanguage();
  const currency = new Intl.NumberFormat(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const cartItem = items.find((entry) => entry.id === item.id);
  const Icon = categoryIcon[item.category];
  const itemNameKey = getServiceNameKey(item.id);
  const itemDescriptionKey = getServiceDescriptionKey(item.id);
  const itemEyebrowKey = getServiceEyebrowKey(item.id);
  const itemName = itemNameKey ? t(itemNameKey) : item.name;
  const itemDescription = itemDescriptionKey ? t(itemDescriptionKey) : item.description;
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [flight, setFlight] = useState<{ x: number; y: number; left: number; top: number } | null>(null);

  function addWithFlight(event: React.MouseEvent<HTMLButtonElement>) {
    const source = event.currentTarget.getBoundingClientRect();
    const target = document.querySelector(".cart-trigger")?.getBoundingClientRect();
    if (target) {
      setFlight({
        x: target.left + target.width / 2 - (source.left + source.width / 2),
        y: target.top + target.height / 2 - (source.top + source.height / 2),
        left: source.left + source.width / 2,
        top: source.top + source.height / 2,
      });
      window.setTimeout(() => setFlight(null), 720);
    }
    addItem({ id: item.id, name: item.name, price: item.price, category: item.category });
  }

  return (
    <motion.article
      className="experience-card rounded-2xl"
      layout
      initial={{ opacity: 0, y: 18, x: item.category === "transfer" ? 24 : 0 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10, scale: .98 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
    >
      <div className="experience-image rounded-t-2xl" style={{ backgroundImage: `url("${item.image}")` }}>
        <motion.span className="experience-eyebrow" whileHover={{ rotate: [-2, 2, -1, 0] }} transition={{ duration: .45 }}>
          <motion.span whileHover={{ rotate: 12 }}><Icon size={12} /></motion.span> {itemEyebrowKey ? t(itemEyebrowKey) : item.eyebrow}
        </motion.span>
      </div>
      <div className="experience-content">
        <h3>{itemName}</h3>
        <button aria-expanded={descriptionOpen} className="experience-description-toggle" onClick={() => setDescriptionOpen((open) => !open)} type="button">
          {descriptionOpen ? t("services.hideDetails") : t("services.details")}
        </button>
        <AnimatePresence initial={false}>
          {descriptionOpen && (
            <motion.p
              animate={{ height: "auto", opacity: 1, marginTop: 8 }}
              className="experience-description"
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
            >
              {itemDescription}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="experience-bottom">
          <strong>{currency.format(item.price)}</strong>
          {cartItem ? (
            <div className="experience-quantity" aria-label={t("services.quantity", { name: itemName })}>
              <button aria-label={t("services.removeOne", { name: itemName })} onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} type="button">−</button>
              <AnimatePresence mode="popLayout" initial={false}><motion.span key={cartItem.quantity} initial={{ scale: .65, y: 5 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .65, y: -5 }}>{cartItem.quantity}</motion.span></AnimatePresence>
              <button aria-label={t("services.addOne", { name: itemName })} onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} type="button">+</button>
            </div>
          ) : (
            <button
              className="experience-add"
              onClick={addWithFlight}
              type="button"
            >
              {t("services.addBag")} <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {flight && (
          <motion.span
            aria-hidden="true"
            className="flying-cart-icon"
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: flight.x, y: flight.y, scale: .18, opacity: .1 }}
            style={{ left: flight.left, top: flight.top }}
            exit={{ opacity: 0 }}
            transition={{ duration: .66, ease: [.22, 1, .36, 1] }}
          >
            <Icon size={17} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function ConciergeBookingTools() {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [pickup, setPickup] = useState<"Home" | "Airport">("Home");
  const [vehicle, setVehicle] = useState<"S-Class" | "V-Class">("S-Class");
  const [passengers, setPassengers] = useState(2);
  const [time, setTime] = useState("18:30");
  const [location, setLocation] = useState("");
  const times = ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

  return (
    <div className="concierge-tools rounded-2xl">
      <div className="concierge-tools-copy">
        <span className="eyebrow">{t("transfer.eyebrow")}</span>
        <h3>{t("transfer.title")}</h3>
        <p>{t("transfer.description")}</p>
        <div className="pickup-toggle rounded-xl" role="group" aria-label={t("transfer.pickup")}>
          {(["Home", "Airport"] as const).map((option) => (
            <button className={pickup === option ? "is-active" : ""} key={option} onClick={() => setPickup(option)} type="button">
              {pickup === option && <motion.span className="pickup-toggle-highlight" layoutId="pickup-toggle" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span>{option === "Home" ? t("transfer.home") : t("transfer.airport")}</span>
            </button>
          ))}
        </div>
        <label className="concierge-location">
          <span>{pickup === "Home" ? t("transfer.pickupAddress") : t("transfer.arrivalAirport")}</span>
          <span className="rounded-xl"><MapPin size={14} /><input className="rounded-xl" onChange={(event) => setLocation(event.target.value)} placeholder={pickup === "Home" ? t("transfer.addressPlaceholder") : t("transfer.airportPlaceholder")} value={location} /></span>
          <motion.i className="location-map-pin" animate={{ y: [0, -5, 0], scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }}><MapPin size={15} fill="currentColor" /></motion.i>
        </label>
      </div>
      <div className="vehicle-selector">
        {(["S-Class", "V-Class"] as const).map((option) => (
          <button className={`vehicle-option rounded-xl${vehicle === option ? " is-selected" : ""}`} key={option} onClick={() => {
            setVehicle(option);
            setPassengers((count) => Math.min(count, option === "S-Class" ? 3 : 6));
          }} type="button">
            <CarFront size={18} />
            <span><strong>Mercedes {option}</strong><small>{t("transfer.upTo", { count: option === "S-Class" ? 3 : 6, bags: option === "S-Class" ? 2 : 6 })}</small></span>
            {vehicle === option && <span className="vehicle-selected-dot" />}
          </button>
        ))}
        <motion.div className="vehicle-capacity" key={vehicle} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}>
          <motion.span initial={{ scale: .8 }} animate={{ scale: 1 }}><Users size={14} /> {t("transfer.guests", { count: passengers, max: vehicle === "S-Class" ? 3 : 6 })}</motion.span>
          <motion.span initial={{ scale: .8 }} animate={{ scale: 1, transition: { delay: .08 } }}><span className="luggage-glyph">▰</span> {t("transfer.bags", { count: vehicle === "S-Class" ? 2 : 6 })}</motion.span>
          <div className="capacity-controls">
            <button className="rounded-lg" aria-label={t("transfer.removePassenger")} disabled={passengers <= 1} onClick={() => setPassengers((count) => Math.max(1, count - 1))} type="button"><Minus size={12} /></button>
            <button className="rounded-lg" aria-label={t("transfer.addPassenger")} disabled={passengers >= (vehicle === "S-Class" ? 3 : 6)} onClick={() => setPassengers((count) => Math.min(vehicle === "S-Class" ? 3 : 6, count + 1))} type="button"><Plus size={12} /></button>
          </div>
        </motion.div>
        <div className="time-picker">
          <span className="time-picker-label">{t("transfer.preferredPickup")}</span>
          <div className="time-picker-window rounded-xl">
            <motion.div
              className="time-picker-track"
              drag="y"
              dragConstraints={{ top: -100, bottom: 100 }}
              dragElastic={.25}
              dragMomentum
              onDragEnd={(_, info) => {
                const next = Math.max(0, Math.min(times.length - 1, times.indexOf(time) + Math.round(-info.offset.y / 40)));
                setTime(times[next]);
              }}
              style={{ y: -times.indexOf(time) * 40 }}
            >
              {times.map((option) => (
                <button className={time === option ? "is-selected" : ""} key={option} onClick={() => setTime(option)} type="button">{option}</button>
              ))}
            </motion.div>
          </div>
        </div>
        <motion.button className="concierge-add-transfer rounded-xl" disabled={!location.trim()} whileTap={{ scale: .97 }} onClick={() => {
          addItem({
            id: `private-transfer-${pickup.toLowerCase()}-${vehicle.toLowerCase().replace("-", "")}-${time.replace(":", "")}-${passengers}`,
            name: `${vehicle} private transfer · ${pickup} · ${time} · ${passengers} guests · ${location}`,
            price: vehicle === "S-Class" ? 165 : 245,
            category: "transfer",
          });
        }} type="button">
          {t("transfer.arrange", { vehicle })} <ArrowUpRight size={15} />
        </motion.button>
      </div>
    </div>
  );
}

export function DiningSection({
  dining,
  concierge,
}: Readonly<{ dining: ConciergeItem[]; concierge: ConciergeItem[] }>) {
  const [activeCategory, setActiveCategory] = useState("all");
  const { t } = useLanguage();
  const diningCategories = [
    { id: "all", label: t("services.all") },
    { id: "dining", label: t("services.dining") },
    { id: "transfer", label: t("services.transfers") },
    { id: "wellness", label: t("services.wellness") },
  ];
  const items = [...dining, ...concierge].filter((item) => activeCategory === "all" || item.category === activeCategory);

  return (
    <>
      <section className="experiences-section" id="home-services">
        <div className="page-container">
          <div className="experiences-heading">
            <div>
              <span className="eyebrow">{t("services.eyebrow")}</span>
              <h2>{t("services.title")}</h2>
            </div>
            <p>{t("services.description")}</p>
          </div>
          <div className="dining-category-tabs" role="tablist" aria-label={t("services.filter")}>
            {diningCategories.map((category) => (
              <button aria-selected={activeCategory === category.id} className={activeCategory === category.id ? "is-active" : ""} key={category.id} onClick={() => setActiveCategory(category.id)} role="tab" type="button">
                {category.label}
                {activeCategory === category.id && <motion.span className="category-tab-indicator" layoutId="dining-tab" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              </button>
            ))}
          </div>
          <motion.div className="experiences-grid" layout>
            <AnimatePresence>
              {items.map((item) => <ExperienceCard item={item} key={item.id} />)}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
      <section className="concierge-section" id="concierge">
        <div className="page-container">
          <div className="experiences-heading">
            <div>
              <span className="eyebrow">{t("services.conciergeEyebrow")}</span>
              <h2>{t("services.conciergeTitle")}</h2>
            </div>
            <p>{t("services.conciergeDescription")}</p>
          </div>
          <ConciergeBookingTools />
          <div className="experiences-grid">
            {concierge.map((item) => <ExperienceCard item={item} key={item.id} />)}
          </div>
        </div>
      </section>
    </>
  );
}
