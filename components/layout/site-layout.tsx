import type { ReactNode } from "react";
import { BookingModal } from "@/components/commerce/booking-modal";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { CartProvider } from "@/components/providers/cart-provider";
import { BackToTop } from "@/components/ui/back-to-top";
import { ConciergeChatWidget } from "@/components/concierge/chat-widget";
import { FloatingCheckoutBar } from "@/components/commerce/cart-drawer";
import { LanguageProvider } from "@/components/providers/language-provider";
import { LocalizedSkipLink } from "@/components/layout/language-switcher";
import { Preloader } from "@/components/layout/Preloader";

export function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LanguageProvider>
      <Preloader />
      <CartProvider>
        <LocalizedSkipLink />
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <BookingModal />
        <ToastViewport />
        <BackToTop />
        <ConciergeChatWidget />
        <FloatingCheckoutBar />
      </CartProvider>
    </LanguageProvider>
  );
}
