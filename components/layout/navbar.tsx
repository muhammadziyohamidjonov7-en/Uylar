"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Heart, Menu, Moon, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { useCart } from "@/components/providers/cart-provider";
import { drawerSpring } from "@/lib/motion";
import { MagneticLink } from "@/components/ui/magnetic-link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/components/providers/language-provider";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, wishlistCount, setCartOpen } = useCart();
  const { t } = useLanguage();
  const links = [
    { href: "#hotel-stays", label: t("nav.stays") },
    { href: "#home-services", label: t("nav.dining") },
    { href: "#concierge", label: t("nav.transfers") },
    { href: "#concierge", label: t("nav.concierge") },
  ];

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const savedTheme = window.localStorage.getItem("maison-luxe-theme");
      const selected = savedTheme ? savedTheme === "dark" : prefersDark;
      setDarkMode(selected);
      document.documentElement.dataset.theme = selected ? "dark" : "light";
    } catch (error) {
      console.error("Unable to restore the saved color theme.", error);
      setDarkMode(prefersDark);
      document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
    }
  }, []);

  useEffect(() => {
    function updateScrolled() {
      setScrolled(window.scrollY > 24);
    }
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  function toggleTheme() {
    const selected = !darkMode;
    setDarkMode(selected);
    document.documentElement.dataset.theme = selected ? "dark" : "light";
    try {
      window.localStorage.setItem("maison-luxe-theme", selected ? "dark" : "light");
    } catch (error) {
      console.error("Unable to save the selected color theme.", error);
    }
  }

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <motion.header
        animate={{
          backgroundColor: darkMode
            ? scrolled ? "rgba(23, 29, 26, .86)" : "rgba(23, 29, 26, .98)"
            : scrolled ? "rgba(251, 250, 247, .82)" : "rgba(251, 250, 247, .96)",
        }}
        className={`site-header${scrolled ? " is-scrolled" : ""}`}
        transition={{ duration: .28 }}
      >
        <div className="announcement">
          <span>{t("nav.announcement")}</span>
          <span className="announcement-detail">{t("nav.announcementDetail")}</span>
        </div>
        <nav className="navbar page-container" aria-label={t("accessibility.mainNavigation")}>
          <Link className="wordmark" href="/" aria-label={t("accessibility.home")} onClick={closeMobileMenu}>
            <span className="wordmark-mark">M</span>
            <span className="wordmark-name">MAISON <span>LUXE</span></span>
          </Link>
          <div className="desktop-nav">
            {links.map((link) => (
              <MagneticLink className="nav-link" href={link.href} key={link.label}>{link.label}</MagneticLink>
            ))}
          </div>
          <div className="nav-actions">
            <LanguageSwitcher />
            <a className="wishlist-link" href="#hotel-stays" aria-label={t("nav.savedStays", { count: wishlistCount })}>
              <Heart size={17} strokeWidth={1.6} />
              <span className="wishlist-label">{t("nav.saved")}</span>
              <span aria-live="polite" className="nav-badge">{wishlistCount}</span>
            </a>
            <button
              aria-label={t("nav.openBag", { count: itemCount, items: itemCount === 1 ? t("nav.item") : t("nav.items") })}
              className="cart-trigger"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <ShoppingBag size={18} strokeWidth={1.6} />
              <motion.span
                aria-atomic="true"
                aria-live="polite"
                className="cart-count"
                key={itemCount}
                initial={{ scale: .7 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: .32, type: "spring", stiffness: 420, damping: 18 }}
              >
                {itemCount}
              </motion.span>
            </button>
            <a className="profile-trigger" href="#your-journey" aria-label={t("nav.bookings")}>
              <UserRound size={17} strokeWidth={1.6} />
            </a>
            <button
              aria-label={darkMode ? t("nav.switchLight") : t("nav.switchDark")}
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
            >
              {darkMode ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
            </button>
            <a className="nav-booking-button rounded-xl" href="#hotel-stays">
              {t("nav.findStay")} <ArrowUpRight size={15} strokeWidth={1.7} />
            </a>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              className="menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              animate={{ opacity: 1, height: "auto", x: 0 }}
              className="mobile-menu"
              exit={{ opacity: 0, height: 0, x: 18 }}
              initial={{ opacity: 0, height: 0, x: 18 }}
              transition={drawerSpring}
            >
              <div className="mobile-menu-inner">
                {links.map((link, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 8 }}
                    key={link.label}
                    transition={{ delay: index * 0.05 }}
                  >
                    <a className="mobile-nav-link" href={link.href} onClick={closeMobileMenu}>
                      {link.label}<ArrowUpRight size={17} strokeWidth={1.5} />
                    </a>
                  </motion.div>
                ))}
                <a className="mobile-saved-link" href="#your-journey" onClick={closeMobileMenu}>
                  <UserRound size={16} /> {t("nav.bookingsLink")}
                </a>
                <button className="mobile-theme-toggle" onClick={toggleTheme} type="button">
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {darkMode ? t("nav.switchLight") : t("nav.switchDark")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <CartDrawer />
    </>
  );
}
