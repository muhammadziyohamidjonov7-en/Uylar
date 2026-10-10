"use client";

import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ExperienceDashboard } from "@/components/account/experience-dashboard";
import { DiningSection } from "@/components/concierge/dining-section";
import { Hero } from "@/components/landing/hero";
import { StayCard } from "@/components/stays/stay-card";
import { useCart } from "@/components/providers/cart-provider";
import { conciergeItems, diningItems, stays } from "@/lib/experiences";
import { useLanguage } from "@/components/providers/language-provider";

export default function HomePage() {
  const { search, setSearch, wishlist } = useCart();
  const { t, language } = useLanguage();
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("curated");
  const [maxPrice, setMaxPrice] = useState(1500);
  const [propertyType, setPropertyType] = useState("all");
  const [amenity, setAmenity] = useState("all");
  const [minimumRating, setMinimumRating] = useState(0);

  const visibleStays = useMemo(() => {
    const query = search.mode === "stay" ? search.destination.trim().toLowerCase() : "";
    const filtered = stays.filter((stay) => {
      const matchesDestination = !query || `${stay.name} ${stay.destination}`.toLowerCase().includes(query);
      const matchesSaved = !savedOnly || wishlist.includes(stay.id);
      const matchesType = propertyType === "all" || stay.propertyType === propertyType;
      const matchesAmenity = amenity === "all" || stay.amenities.includes(amenity);
      const matchesRating = stay.stars >= minimumRating;
      return matchesDestination && matchesSaved && matchesType && matchesAmenity && matchesRating && stay.price <= maxPrice;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return stays.findIndex((stay) => stay.id === a.id) - stays.findIndex((stay) => stay.id === b.id);
    });
  }, [search.destination, search.mode, savedOnly, sort, maxPrice, propertyType, amenity, minimumRating, wishlist]);

  return (
    <>
      <Hero />
      <section className="intro-section page-container" id="discover">
        <div className="intro-kicker"><span className="eyebrow">{t("home.introEyebrow")}</span><span className="intro-rule" /></div>
        <div className="intro-copy">
          <h2>{t("home.introTitle")}</h2>
          <div className="intro-aside">
            <p>{t("home.introBody")}</p>
            <a className="text-link" href="#hotel-stays">{t("home.discoverCollection")} <ArrowRight size={15} strokeWidth={1.5} /></a>
          </div>
        </div>
      </section>

      <section className="stays-section" id="hotel-stays">
        <div className="page-container">
          <div className="stays-heading">
            <div>
              <span className="eyebrow">{t("home.staysEyebrow")}</span>
              <h2>{t("home.staysTitle")}</h2>
              <p>{t("home.staysDescription")}</p>
            </div>
            <div className="stays-tools">
              <label className="sort-control rounded-xl">
                <span><SlidersHorizontal size={14} /> {t("home.sort")}</span>
                <select className="rounded-xl" onChange={(event) => setSort(event.target.value)} value={sort}>
                  <option value="curated">{t("home.curated")}</option>
                  <option value="price-low">{t("home.priceLow")}</option>
                  <option value="price-high">{t("home.priceHigh")}</option>
                </select>
              </label>
              <button
                aria-pressed={savedOnly}
                className={`saved-filter rounded-xl${savedOnly ? " is-active" : ""}`}
                onClick={() => setSavedOnly((active) => !active)}
                type="button"
              >
                {t("home.savedStays")} {wishlist.length > 0 && <span>{wishlist.length}</span>}
              </button>
            </div>
          </div>
          <div className="stays-filter-row">
            <label className="price-filter">
              <span>{t("home.upTo", { price: maxPrice.toLocaleString(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US") })}</span>
              <input
                aria-label="Maximum nightly price"
                max="1500"
                min="400"
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                step="50"
                type="range"
                value={maxPrice}
              />
            </label>
            {search.destination && search.mode === "stay" && (
              <button className="search-filter-chip rounded-xl" onClick={() => setSearch({ ...search, destination: "" })} type="button">
                {search.destination} <span aria-hidden="true">×</span>
              </button>
            )}
            <span className="stay-results-count">{t("home.results", { count: visibleStays.length, stayWord: visibleStays.length === 1 ? t("home.stay") : t("home.stays") })}</span>
          </div>
          <div className="stay-refinements">
            <label>{t("home.propertyType")}
              <select className="rounded-xl" onChange={(event) => setPropertyType(event.target.value)} value={propertyType}>
                <option value="all">{t("home.allStays")}</option>
                <option value="Villa">{t("home.propertyVilla")}</option>
                <option value="Hotel">{t("home.propertyHotel")}</option>
                <option value="Resort">{t("home.propertyResort")}</option>
              </select>
            </label>
            <label>{t("home.amenities")}
              <select className="rounded-xl" onChange={(event) => setAmenity(event.target.value)} value={amenity}>
                <option value="all">{t("home.anyAmenity")}</option>
                <option value="Spa">{t("home.amenitySpa")}</option>
                <option value="Pool">{t("home.amenityPool")}</option>
                <option value="Beachfront">{t("home.privateBeach")}</option>
                <option value="Dining">{t("home.amenityDining")}</option>
              </select>
            </label>
            <label>{t("home.rating")}
              <select className="rounded-xl" onChange={(event) => setMinimumRating(Number(event.target.value))} value={minimumRating}>
                <option value="0">{t("home.anyRating")}</option>
                <option value="4">{t("home.fourPlus")}</option>
                <option value="5">{t("home.fiveStars")}</option>
              </select>
            </label>
          </div>
          {visibleStays.length ? (
            <div className="stays-grid">{visibleStays.map((stay, index) => <StayCard index={index} key={stay.id} stay={stay} />)}</div>
          ) : (
            <div className="stays-empty">
              <h3>{t("home.emptyTitle")}</h3>
              <p>{t("home.emptyBody")}</p>
              <button onClick={() => { setSearch({ ...search, destination: "" }); setSavedOnly(false); setMaxPrice(1500); setPropertyType("all"); setAmenity("all"); setMinimumRating(0); }} type="button">{t("home.showAll")}</button>
            </div>
          )}
        </div>
      </section>

      <DiningSection dining={diningItems} concierge={conciergeItems} />
      <ExperienceDashboard />

      <section className="promise-section">
        <div className="promise-inner page-container">
          <span className="eyebrow">{t("home.promiseEyebrow")}</span>
          <h2>{t("home.promiseTitle")}</h2>
          <p>{t("home.promiseBody")}</p>
          <a className="promise-link" href="#discover">{t("home.promiseLink")} <ArrowRight size={16} strokeWidth={1.5} /></a>
        </div>
      </section>
    </>
  );
}
