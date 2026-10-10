"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "dining" | "transfer" | "wellness" | "other";
};

export type Booking = {
  id: string;
  property: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  createdAt: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: "Confirmed" | "Preparing" | "On the way" | "Delivered";
  createdAt: string;
  deliveryAddress: string;
  scheduledFor: string;
};

export type SearchCriteria = {
  mode: "stay" | "delivery";
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

type CheckoutMode = "order" | "booking" | null;
type ToastKey = "toast.added" | "toast.saved" | "toast.unsaved";
type ToastMessage = { id: number; message: ToastKey } | null;
type StoredAppState = {
  items: CartItem[];
  wishlist: string[];
  bookings: Booking[];
  orders: Order[];
  search: SearchCriteria;
};

type CartContextValue = StoredAppState & {
  itemCount: number;
  wishlistCount: number;
  subtotal: number;
  checkoutMode: CheckoutMode;
  bookingStayId: string | null;
  cartOpen: boolean;
  toast: ToastMessage;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (stayId: string) => void;
  setSearch: (search: SearchCriteria) => void;
  openCheckout: (mode: Exclude<CheckoutMode, null>, stayId?: string) => void;
  closeCheckout: () => void;
  setCartOpen: (open: boolean) => void;
  placeOrder: (deliveryAddress: string, scheduledFor: string) => Order;
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  dismissToast: () => void;
};

const STORAGE_KEY = "maison-luxe-app";
const EMPTY_SEARCH: SearchCriteria = { mode: "stay", destination: "", checkIn: "", checkOut: "", guests: 2 };
const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<CartItem>;
  return typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.price === "number" &&
    Number.isFinite(candidate.price) &&
    candidate.price >= 0 &&
    typeof candidate.quantity === "number" &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0 &&
    ["dining", "transfer", "wellness", "other"].includes(candidate.category ?? "");
}

function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<Booking>;
  return typeof booking.id === "string" &&
    typeof booking.property === "string" &&
    typeof booking.destination === "string" &&
    typeof booking.checkIn === "string" &&
    typeof booking.checkOut === "string" &&
    typeof booking.guests === "number" &&
    Number.isInteger(booking.guests) &&
    typeof booking.total === "number" &&
    Number.isFinite(booking.total) &&
    typeof booking.createdAt === "string";
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<Order>;
  return typeof order.id === "string" &&
    Array.isArray(order.items) &&
    order.items.every(isCartItem) &&
    typeof order.total === "number" &&
    Number.isFinite(order.total) &&
    ["Confirmed", "Preparing", "On the way", "Delivered"].includes(order.status ?? "") &&
    typeof order.createdAt === "string" &&
    typeof order.deliveryAddress === "string" &&
    typeof order.scheduledFor === "string";
}

function isStoredState(value: unknown): value is StoredAppState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredAppState>;
  return Array.isArray(candidate.items) &&
    Array.isArray(candidate.wishlist) &&
    Array.isArray(candidate.bookings) &&
    Array.isArray(candidate.orders) &&
    !!candidate.search &&
    typeof candidate.search.destination === "string" &&
    ["stay", "delivery"].includes(candidate.search.mode ?? "") &&
    typeof candidate.search.checkIn === "string" &&
    typeof candidate.search.checkOut === "string" &&
    Number.isInteger(candidate.search.guests);
}

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<StoredAppState>({
    items: [],
    wishlist: [],
    bookings: [],
    orders: [],
    search: EMPTY_SEARCH,
  });
  const [hasRestored, setHasRestored] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(null);
  const [bookingStayId, setBookingStayId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage>(null);

  const showToast = useCallback((message: ToastKey) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed: unknown = JSON.parse(savedState);
        if (isStoredState(parsed)) {
          setState({
            items: parsed.items.filter(isCartItem),
            wishlist: parsed.wishlist.filter((id): id is string => typeof id === "string"),
            bookings: parsed.bookings.filter(isBooking),
            orders: parsed.orders.filter(isOrder),
            search: {
              ...parsed.search,
              guests: Math.max(1, Math.min(10, parsed.search.guests)),
            },
          });
        }
      } else {
        const legacyCart = window.localStorage.getItem("maison-luxe-cart");
        if (legacyCart) {
          const parsedLegacyCart: unknown = JSON.parse(legacyCart);
          if (Array.isArray(parsedLegacyCart)) {
            setState((current) => ({
              ...current,
              items: parsedLegacyCart.flatMap((item): CartItem[] => {
                if (
                  item &&
                  typeof item.id === "string" &&
                  typeof item.name === "string" &&
                  typeof item.price === "number" &&
                  Number.isFinite(item.price) &&
                  item.price >= 0 &&
                  Number.isInteger(item.quantity) &&
                  item.quantity > 0
                ) {
                  return [{ id: item.id, name: item.name, price: item.price, quantity: item.quantity, category: "other" }];
                }
                return [];
              }),
            }));
          }
        }
      }
    } catch (error) {
      console.error("Unable to restore Maison Luxe app data.", error);
    } finally {
      setHasRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Unable to save Maison Luxe app data.", error);
    }
  }, [hasRestored, state]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) throw new RangeError("Cart quantity must be a positive integer.");
    if (!Number.isFinite(item.price) || item.price < 0) throw new RangeError("Cart item price must be non-negative.");
    setState((current) => {
      const existing = current.items.find((entry) => entry.id === item.id);
      return {
        ...current,
        items: existing
          ? current.items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry)
          : [...current.items, { ...item, quantity }],
      };
    });
    setCartOpen(true);
    showToast("toast.added");
  }, [showToast]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 0) throw new RangeError("Cart quantity must be a non-negative integer.");
    setState((current) => ({
      ...current,
      items: quantity === 0
        ? current.items.filter((item) => item.id !== id)
        : current.items.map((item) => item.id === id ? { ...item, quantity } : item),
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }));
  }, []);

  const clearCart = useCallback(() => {
    setState((current) => ({ ...current, items: [] }));
  }, []);

  const toggleWishlist = useCallback((stayId: string) => {
    const saved = !state.wishlist.includes(stayId);
    setState((current) => {
      return {
        ...current,
        wishlist: saved
          ? [...current.wishlist, stayId]
          : current.wishlist.filter((id) => id !== stayId),
      };
    });
    showToast(saved ? "toast.saved" : "toast.unsaved");
  }, [showToast, state.wishlist]);

  const setSearch = useCallback((search: SearchCriteria) => {
    setState((current) => ({ ...current, search }));
  }, []);

  const openCheckout = useCallback((mode: Exclude<CheckoutMode, null>, stayId?: string) => {
    setBookingStayId(stayId ?? null);
    setCheckoutMode(mode);
    setCartOpen(false);
  }, []);

  const closeCheckout = useCallback(() => {
    setCheckoutMode(null);
    setBookingStayId(null);
  }, []);

  const placeOrder = useCallback((deliveryAddress: string, scheduledFor: string) => {
    if (state.items.length === 0) throw new Error("Cannot place an order with an empty cart.");
    if (!deliveryAddress.trim() || Number.isNaN(Date.parse(scheduledFor))) {
      throw new Error("A delivery address and valid service time are required.");
    }
    const order: Order = {
      id: `ML-${Date.now().toString(36).toUpperCase()}`,
      items: state.items,
      total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      deliveryAddress,
      scheduledFor,
    };
    setState((current) => ({ ...current, orders: [order, ...current.orders], items: [] }));
    return order;
  }, [state.items]);

  const createBooking = useCallback((details: Omit<Booking, "id" | "createdAt">) => {
    const booking: Booking = {
      ...details,
      id: `ML-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, bookings: [booking, ...current.bookings] }));
    return booking;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setState((current) => ({
      ...current,
      orders: current.orders.map((order) => order.id === orderId ? { ...order, status } : order),
    }));
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      ...state,
      itemCount: state.items.reduce((count, item) => count + item.quantity, 0),
      wishlistCount: state.wishlist.length,
      subtotal,
      checkoutMode,
      bookingStayId,
      cartOpen,
      toast,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      setSearch,
      openCheckout,
      closeCheckout,
      setCartOpen,
      placeOrder,
      createBooking,
      updateOrderStatus,
      dismissToast,
    };
  }, [state, checkoutMode, bookingStayId, cartOpen, toast, addItem, updateQuantity, removeItem, clearCart, toggleWishlist, setSearch, openCheckout, closeCheckout, placeOrder, createBooking, updateOrderStatus, dismissToast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider.");
  return context;
}
