import type { Category } from "@/lib/types";

export const paths = {
  search: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21",
  plus: "M12 5v14M5 12h14", minus: "M5 12h14",
  location: "M20.5 3.5 3.8 10.4c-.8.3-.7 1.4.1 1.6l6.6 1.5 1.5 6.6c.2.8 1.3.9 1.6.1z",
  tray: "M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z",
  mappin: "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21ZM14.5 9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0",
  list: "M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1",
  gear: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  chevron: "m9 6 6 6-6 6", chevdown: "m6 9 6 6 6-6", back: "m15 6-6 6 6 6", close: "m6 6 12 12M18 6 6 18",
  quote: "M7 7h4v4c0 3-1.5 5-4 6M14 7h4v4c0 3-1.5 5-4 6",
  film: "M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5",
  photo: "M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3m15 12-5-5-8 8M9 9h.1",
  person: "M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21a8 8 0 0 1 16 0",
  cup: "M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8ZM16 9h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2M11 3v2",
  bread: "M5 11a5 5 0 0 1 4-8h6a5 5 0 0 1 4 8v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z",
  fork: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 0-3 3-3 7h3",
  coffee: "M4 10h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3",
  binoc: "M10 15.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M21 15.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M10 15h4M5 12l2-7h3l1 5M19 12l-2-7h-3l-1 5",
} as const;
export type IconName = keyof typeof paths;
export const categoryIcons: Record<Category, { icon: IconName; className: string }> = {
  카페: { icon: "cup", className: "cafe" }, 빵집: { icon: "bread", className: "bakery" }, 식당: { icon: "fork", className: "food" }, 커피: { icon: "coffee", className: "coffee" }, 전망대: { icon: "binoc", className: "view" },
};
export function Icon({ name, small = false }: { name: IconName; small?: boolean }) {
  return <svg className={`i${small ? " sm" : ""}`} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
export function Poi({ category }: { category: Category }) {
  const item = categoryIcons[category];
  return <span className={`poi sm ${item.className}`}><Icon name={item.icon} small /></span>;
}
