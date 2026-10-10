 "use client";

import { ArrowRight, ArrowUpRight, Instagram } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAnimationControls, motion } from "framer-motion";
import { MagneticLink } from "@/components/ui/magnetic-link";
import { useLanguage } from "@/components/providers/language-provider";

const footerLinks = [
];

export function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const shake = useAnimationControls();
  const footerLinks = [
    { href: "#hotel-stays", label: t("footer.findStay") },
    { href: "#home-services", label: t("footer.dining") },
    { href: "#concierge", label: t("footer.spaTransfers") },
    { href: "#your-journey", label: t("footer.bookings") },
  ];

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      await shake.start({ x: [0, -7, 7, -5, 5, 0], transition: { duration: .38 } });
      return;
    }
    setError("");
    setSubscribed(true);
  }

  return (
    <footer className="site-footer">
      <div className="footer-main page-container">
        <div className="footer-intro">
          <Link className="wordmark footer-wordmark" href="/">
            <span className="wordmark-mark">M</span>
            <span className="wordmark-name">MAISON <span>LUXE</span></span>
          </Link>
          <p>{t("footer.tagline")}</p>
          <a className="footer-social" href="https://www.instagram.com/" aria-label={t("footer.instagram")}>
            <Instagram size={17} strokeWidth={1.6} />
          </a>
        </div>
        <div className="footer-links">
          <span className="footer-eyebrow">{t("footer.explore")}</span>
          {footerLinks.map((link) => (
            <MagneticLink href={link.href} key={link.href}>
              {link.label}
            </MagneticLink>
          ))}
        </div>
        <div className="footer-newsletter">
          <span className="footer-eyebrow">{t("footer.inspiration")}</span>
          <p>{t("footer.newsletter")}</p>
          <form className="footer-newsletter-form" noValidate onSubmit={subscribe}>
            <label className="sr-only" htmlFor="footer-email">{t("footer.emailLabel")}</label>
            <motion.div animate={shake} className="footer-email-wrap">
              <input
                autoComplete="email"
                className="rounded-xl"
                id="footer-email"
                onChange={(event) => { setEmail(event.target.value); setError(""); }}
                placeholder={t("footer.emailPlaceholder")}
                type="email"
                value={email}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "footer-email-error" : undefined}
              />
              <button aria-label={t("footer.subscribe")} type="submit"><ArrowRight size={16} /></button>
            </motion.div>
            {error ? <span className="footer-form-message is-error" id="footer-email-error" role="alert">{t("footer.emailError")}</span> : null}
            {subscribed ? <span className="footer-form-message" role="status">{t("footer.thanks")}</span> : null}
            <span className="footer-form-note">{t("footer.demoNote")}</span>
          </form>
          <a className="footer-contact-link" href="mailto:hello@maisonluxe.example">
            {t("footer.contact")} <ArrowUpRight size={16} strokeWidth={1.6} />
          </a>
        </div>
      </div>
      <div className="footer-bottom page-container">
        <span>© {new Date().getFullYear()} Maison Luxe</span>
        <span>{t("footer.motto")}</span>
      </div>
    </footer>
  );
}
