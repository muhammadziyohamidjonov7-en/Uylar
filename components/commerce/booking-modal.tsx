"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CreditCard, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { stays } from "@/lib/experiences";
import { luxeSpring } from "@/lib/motion";
import { useLanguage } from "@/components/providers/language-provider";
import { getServiceNameKey } from "@/lib/i18n/translations";

const payments = [
  { id: "card", labelKey: "checkout.card" },
  { id: "apple-pay", labelKey: "checkout.applePay" },
  { id: "membership", labelKey: "checkout.membership" },
] as const;

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86_400_000));
}

export function BookingModal() {
  const {
    checkoutMode,
    bookingStayId,
    closeCheckout,
    items,
    subtotal,
    search,
    placeOrder,
    createBooking,
  } = useCart();
  const { t, language } = useLanguage();
  const currency = new Intl.NumberFormat(language === "uz" ? "uz-UZ" : language === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<(typeof payments)[number]["id"]>(payments[0].id);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("18:00");
  const [guests, setGuests] = useState(2);
  const reduceMotion = useReducedMotion();

  const stay = stays.find((entry) => entry.id === bookingStayId);
  const nights = nightsBetween(checkIn, checkOut);
  const basePrice = checkoutMode === "booking" && stay ? stay.price * nights : subtotal;
  const tax = basePrice * 0.08;
  const conciergeFee = checkoutMode === "order" ? 12 : 35;
  const total = basePrice + tax + conciergeFee;
  const minimumDate = useMemo(() => dateString(new Date()), []);

  useEffect(() => {
    if (!checkoutMode) return;
    const today = new Date();
    const defaultCheckIn = dateString(addDays(today, 14));
    const defaultCheckOut = dateString(addDays(today, 17));
    setStep(1);
    setComplete(false);
    setReference("");
    setError("");
    setPayment(payments[0].id);
    setGuestName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCheckIn(search.checkIn || defaultCheckIn);
    setCheckOut(search.checkOut || defaultCheckOut);
    setServiceDate(search.mode === "delivery" && search.checkIn ? search.checkIn : dateString(addDays(today, 1)));
    setServiceTime(search.mode === "delivery" && /^\d{2}:\d{2}$/.test(search.checkOut) ? search.checkOut : "18:00");
    setGuests(search.guests);
  }, [checkoutMode, search.checkIn, search.checkOut, search.guests, search.mode]);

  useEffect(() => {
    if (!checkoutMode) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !complete) closeCheckout();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [checkoutMode, complete, closeCheckout]);

  if (!checkoutMode) return null;

  function validateDetails() {
    if (!guestName.trim() || !/^\S+@\S+\.\S+$/.test(email)) return t("checkout.errorIdentity");
    if (checkoutMode === "booking") {
      if (!stay) return t("checkout.errorStay");
      if (!checkIn || !checkOut || nights < 1) return t("checkout.errorDates");
      return "";
    }
    if (!address.trim() || !phone.trim() || !serviceDate || !serviceTime) return t("checkout.errorDelivery");
    if (items.length === 0) return t("checkout.errorEmpty");
    return "";
  }

  function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateDetails();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setError("");
    setStep(2);
  }

  function submitReservation() {
    setError("");
    if (checkoutMode === "booking" && stay) {
      const booking = createBooking({
        property: stay.name,
        destination: stay.destination,
        checkIn,
        checkOut,
        guests,
        total,
      });
      setReference(booking.id);
    } else if (checkoutMode === "order") {
      try {
        const order = placeOrder(address.trim(), `${serviceDate}T${serviceTime}`);
        setReference(order.id);
      } catch (checkoutError) {
        setError(checkoutError instanceof Error ? checkoutError.message : t("checkout.errorOrder"));
        return;
      }
    }
    setComplete(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="checkout-backdrop"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !complete) closeCheckout();
        }}
      >
        <motion.section
          animate={{ opacity: 1, y: 0, scale: 1 }}
          aria-label={complete ? t(checkoutMode === "booking" ? "checkout.stayAwaits" : "checkout.orderConfirmed") : t("checkout.title")}
          aria-modal="true"
          className="checkout-modal rounded-2xl"
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          role="dialog"
          transition={luxeSpring}
        >
          <button
            aria-label={complete ? t("checkout.closeConfirmation") : t("checkout.close")}
            className="checkout-close"
            onClick={() => {
              closeCheckout();
              setComplete(false);
            }}
            type="button"
          >
            <X size={19} />
          </button>
          {complete ? (
            <div className="checkout-success">
              {!reduceMotion && (
                <div aria-hidden="true" className="success-confetti">
                  {Array.from({ length: 22 }, (_, index) => (
                    <motion.i
                      animate={{
                        x: Math.cos((index / 22) * Math.PI * 2) * (65 + (index % 4) * 18),
                        y: Math.sin((index / 22) * Math.PI * 2) * (55 + (index % 5) * 13) - 20,
                        opacity: [0, 1, 0],
                        rotate: index % 2 ? 220 : -220,
                        scale: [0.4, 1, .6],
                      }}
                      className={`confetti-piece confetti-piece-${index % 4}`}
                      key={index}
                      transition={{ duration: 1.35, delay: (index % 6) * .035, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}
              <motion.span
                animate={{ scale: 1, rotate: 0 }}
                initial={{ scale: 0.5, rotate: -20 }}
                className="checkout-success-icon"
              >
                <Check size={27} />
              </motion.span>
              <span className="eyebrow">{checkoutMode === "booking" ? t("checkout.stayAwaits") : t("checkout.orderConfirmed")}</span>
              <h2>{checkoutMode === "booking" ? t("checkout.escapeReserved") : t("checkout.takenCare")}</h2>
              <p>
                {checkoutMode === "booking"
                  ? `${stay?.name} · ${stay?.destination} · ${nights} ${t(nights === 1 ? "checkout.night" : "checkout.nights")}`
                  : t("checkout.deliveryConfirmation", { address })}
              </p>
              <div className="checkout-reference"><span>{t("checkout.reference")}</span><strong>{reference}</strong></div>
              <p className="demo-payment-note">{t("checkout.demoNoPayment")}</p>
              <button className="checkout-primary" onClick={closeCheckout} type="button">
                {t("checkout.return")} <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-topline">
                <span className="eyebrow">{checkoutMode === "booking" ? t("checkout.stayRemember") : t("checkout.concierge")}</span>
                <span className="checkout-step">{t("checkout.step", { step })}</span>
              </div>
              <h2 className="checkout-title">{checkoutMode === "booking" ? t("checkout.completeReservation") : t("checkout.detailsTitle")}</h2>
              <div className="checkout-progress"><span style={{ width: step === 1 ? "50%" : "100%" }} /></div>

              {step === 1 ? (
                <form className="checkout-form" onSubmit={submitDetails}>
                  {checkoutMode === "booking" ? (
                    <>
                      <div className="checkout-property">
                        <span className="eyebrow">{stay?.destination}</span>
                        <strong>{stay?.name ?? t("checkout.selectedStay")}</strong>
                        <span>{currency.format(stay?.price ?? 0)} {t("stay.night")}</span>
                      </div>
                      <div className="checkout-field-row">
                        <label>{t("checkout.checkIn")}<input className="rounded-xl" min={minimumDate} onChange={(event) => setCheckIn(event.target.value)} required type="date" value={checkIn} /></label>
                        <label>{t("checkout.checkOut")}<input className="rounded-xl" min={checkIn || minimumDate} onChange={(event) => setCheckOut(event.target.value)} required type="date" value={checkOut} /></label>
                      </div>
                      <label>{t("hero.guests")}
                        <select className="rounded-xl" onChange={(event) => setGuests(Number(event.target.value))} value={guests}>
                          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? t("checkout.guest") : t("checkout.guests")}</option>)}
                        </select>
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="checkout-property">
                        <span className="eyebrow">{items.length} {items.length === 1 ? t("checkout.selection") : t("checkout.selections")}</span>
                        <strong>{items.map((item) => {
                          const nameKey = getServiceNameKey(item.id);
                          return `${nameKey ? t(nameKey) : item.name} × ${item.quantity}`;
                        }).join(", ")}</strong>
                      </div>
                      <label>{t("checkout.deliveryAddress")}<input className="rounded-xl" autoComplete="street-address" onChange={(event) => setAddress(event.target.value)} placeholder={t("checkout.addressPlaceholder")} required value={address} /></label>
                      <label>{t("checkout.phone")}<input className="rounded-xl" autoComplete="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 000 0000" required type="tel" value={phone} /></label>
                      <div className="checkout-field-row">
                        <label>{t("checkout.serviceDate")}<input className="rounded-xl" min={minimumDate} onChange={(event) => setServiceDate(event.target.value)} required type="date" value={serviceDate} /></label>
                        <label>{t("checkout.preferredTime")}<input className="rounded-xl" onChange={(event) => setServiceTime(event.target.value)} required type="time" value={serviceTime} /></label>
                      </div>
                    </>
                  )}
                  <label>{t("checkout.name")}<input className="rounded-xl" autoComplete="name" onChange={(event) => setGuestName(event.target.value)} placeholder={t("checkout.namePlaceholder")} required value={guestName} /></label>
                  <label>{t("checkout.email")}<input className="rounded-xl" autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label>
                  {error && <p className="checkout-error" role="alert">{error}</p>}
                  <button className="checkout-primary" type="submit">{t("checkout.reviewPayment")} <ArrowRight size={16} /></button>
                </form>
              ) : (
                <div className="checkout-payment">
                  <div className="payment-options" role="radiogroup" aria-label={t("checkout.paymentMethod")}>
                    {payments.map((method) => (
                      <label className={`payment-option${payment === method.id ? " is-selected" : ""}`} key={method.id}>
                        {payment === method.id && <motion.span className="payment-active-indicator" layoutId="payment-active-indicator" transition={luxeSpring} />}
                        <input checked={payment === method.id} name="payment" onChange={() => setPayment(method.id)} type="radio" />
                        <CreditCard size={17} strokeWidth={1.5} />
                        <span>{t(method.labelKey)}</span>
                        {payment === method.id && <Check className="payment-check" size={15} />}
                      </label>
                    ))}
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      initial={{ opacity: 0, y: 5 }}
                      key={payment}
                      transition={{ duration: .18 }}
                    >
                      {payment === "card" && (
                        <p className="payment-placeholder">{t("checkout.cardUnavailable")}</p>
                      )}
                      {payment === "apple-pay" && (
                        <p className="payment-placeholder">{t("checkout.applePayDemo")}</p>
                      )}
                      {payment === "membership" && (
                        <label className="membership-code">{t("checkout.membershipCode")}<input className="rounded-xl" placeholder={t("checkout.membershipPlaceholder")} /></label>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <div className="price-breakdown">
                    <div><span>{checkoutMode === "booking" ? t("checkout.accommodation", { nights, nightWord: t(nights === 1 ? "checkout.night" : "checkout.nights") }) : t("checkout.conciergeSelections")}</span><span>{currency.format(basePrice)}</span></div>
                    <div><span>{t("checkout.tax")}</span><span>{currency.format(tax)}</span></div>
                    <div><span>{checkoutMode === "booking" ? t("checkout.reservationFee") : t("checkout.conciergeFee")}</span><span>{currency.format(conciergeFee)}</span></div>
                    <div className="price-total"><strong>{t("checkout.total")}</strong><strong>{currency.format(total)}</strong></div>
                  </div>
                  {error && <p className="checkout-error" role="alert">{error}</p>}
                  <p className="demo-payment-note">{t("checkout.demoPayment")}</p>
                  <button className="checkout-primary" onClick={submitReservation} type="button">
                    {checkoutMode === "booking" ? t("checkout.confirmReservation") : t("checkout.placeOrder")} <ArrowRight size={16} />
                  </button>
                  <button className="checkout-back" onClick={() => setStep(1)} type="button"><ArrowLeft size={14} /> {t("checkout.backDetails")}</button>
                </div>
              )}
            </>
          )}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
