import type { CartItem } from "@/components/providers/cart-provider";

export type Stay = {
  id: string;
  name: string;
  destination: string;
  image: string;
  rating: string;
  reviews: number;
  price: number;
  tag: string;
  propertyType: "Villa" | "Hotel" | "Resort";
  stars: number;
  amenities: string[];
};

export type ConciergeItem = Omit<CartItem, "quantity"> & {
  description: string;
  image: string;
  eyebrow: string;
};

export const stays: Stay[] = [
  {
    id: "casa-mami",
    name: "Casa Mami",
    destination: "Puglia, Italy",
    image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1100&q=85",
    rating: "4.98",
    reviews: 128,
    price: 680,
    tag: "PRIVATE VILLA",
    propertyType: "Villa",
    stars: 5,
    amenities: ["Pool", "Beachfront"],
  },
  {
    id: "villa-treville",
    name: "Villa Treville",
    destination: "Positano, Italy",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1100&q=85",
    rating: "4.96",
    reviews: 94,
    price: 920,
    tag: "COASTAL RETREAT",
    propertyType: "Hotel",
    stars: 5,
    amenities: ["Spa", "Beachfront"],
  },
  {
    id: "le-grand-palais",
    name: "Le Grand Palais",
    destination: "Paris, France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1100&q=85",
    rating: "4.91",
    reviews: 203,
    price: 540,
    tag: "CITY ICON",
    propertyType: "Hotel",
    stars: 4,
    amenities: ["Spa", "Dining"],
  },
  {
    id: "forestis",
    name: "Forestis",
    destination: "Dolomites, Italy",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1100&q=85",
    rating: "4.99",
    reviews: 77,
    price: 760,
    tag: "MOUNTAIN SANCTUARY",
    propertyType: "Resort",
    stars: 5,
    amenities: ["Spa", "Pool"],
  },
];

export const diningItems: ConciergeItem[] = [
  {
    id: "private-chef",
    name: "Private chef, at home",
    price: 240,
    category: "dining",
    description: "A seasonal four-course menu, prepared and served in your own kitchen.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=85",
    eyebrow: "AN EVENING, MADE YOURS",
  },
  {
    id: "caviar-tasting",
    name: "Caviar & champagne",
    price: 185,
    category: "dining",
    description: "A thoughtful tasting of Baerii caviar with a chilled bottle of prestige cuvée.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=85",
    eyebrow: "A SMALL CELEBRATION",
  },
  {
    id: "villa-breakfast",
    name: "The slow morning",
    price: 78,
    category: "dining",
    description: "Fresh pastries, market fruit, cultured butter, and coffee for two.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=85",
    eyebrow: "DELIVERED TO YOUR DOOR",
  },
];

export const conciergeItems: ConciergeItem[] = [
  {
    id: "airport-transfer",
    name: "Private airport transfer",
    price: 165,
    category: "transfer",
    description: "A discreet, door-to-door arrival in a Mercedes S-Class.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=85",
    eyebrow: "ARRIVE EFFORTLESSLY",
  },
  {
    id: "in-suite-spa",
    name: "In-suite spa ritual",
    price: 210,
    category: "wellness",
    description: "A restorative 60-minute massage, arranged in the comfort of your suite.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85",
    eyebrow: "A MOMENT TO YOURSELF",
  },
  {
    id: "private-driver",
    name: "A day with a private driver",
    price: 420,
    category: "transfer",
    description: "Explore at your own pace with a dedicated luxury vehicle and local driver.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
    eyebrow: "THE SCENIC ROUTE",
  },
];
