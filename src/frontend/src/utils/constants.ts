export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayOfWeek = (typeof DAYS)[number];

export const getCurrentDay = (): DayOfWeek =>
  DAYS[new Date().getDay()] as DayOfWeek;

export const FOOD_IMAGES: Record<string, string> = {
  "Pav Bhaji": "/assets/generated/pav-bhaji.dim_400x300.jpg",
  "Vada Pav": "/assets/generated/vada-pav.dim_400x300.jpg",
  "Masala Chai": "/assets/generated/masala-chai.dim_400x300.jpg",
  Samosa: "/assets/generated/samosa.dim_400x300.jpg",
  Poha: "/assets/generated/poha.dim_400x300.jpg",
  "Chole Bhature": "/assets/generated/chole-bhature.dim_400x300.jpg",
  Lassi: "/assets/generated/lassi.dim_400x300.jpg",
  "Aloo Tikki": "/assets/generated/aloo-tikki.dim_400x300.jpg",
  Jalebi: "/assets/generated/jalebi.dim_400x300.jpg",
  "Bread Pakora": "/assets/generated/bread-pakora.dim_400x300.jpg",
  "Idli Sambar": "/assets/generated/idli-sambar.dim_400x300.jpg",
  Dosa: "/assets/generated/dosa.dim_400x300.jpg",
  "Filter Coffee": "/assets/generated/filter-coffee.dim_400x300.jpg",
  Upma: "/assets/generated/upma.dim_400x300.jpg",
  "Medu Vada": "/assets/generated/medu-vada.dim_400x300.jpg",
  "Dal Tadka Rice": "/assets/generated/dal-tadka-rice.dim_400x300.jpg",
  "Roti Sabzi": "/assets/generated/roti-sabzi.dim_400x300.jpg",
  Buttermilk: "/assets/generated/buttermilk.dim_400x300.jpg",
  Khichdi: "/assets/generated/khichdi.dim_400x300.jpg",
  Papad: "/assets/generated/papad.dim_400x300.jpg",
  "Rajma Rice": "/assets/generated/rajma-rice.dim_400x300.jpg",
  "Paneer Tikka": "/assets/generated/paneer-tikka.dim_400x300.jpg",
  "Mango Lassi": "/assets/generated/mango-lassi.dim_400x300.jpg",
  "Gulab Jamun": "/assets/generated/gulab-jamun.dim_400x300.jpg",
  Naan: "/assets/generated/naan.dim_400x300.jpg",
  Biryani: "/assets/generated/biryani.dim_400x300.jpg",
  Raita: "/assets/generated/raita.dim_400x300.jpg",
  "Shahi Tukda": "/assets/generated/shahi-tukda.dim_400x300.jpg",
  "Seekh Kebab": "/assets/generated/seekh-kebab.dim_400x300.jpg",
  Shorba: "/assets/generated/shorba.dim_400x300.jpg",
  Thali: "/assets/generated/thali.dim_400x300.jpg",
  Kheer: "/assets/generated/kheer.dim_400x300.jpg",
  "Aam Panna": "/assets/generated/aam-panna.dim_400x300.jpg",
  Pakora: "/assets/generated/pakora.dim_400x300.jpg",
  Chutney: "/assets/generated/chutney.dim_400x300.jpg",
};

export function getItemImage(item: { imageUrl: string; name: string }): string {
  if (item.imageUrl?.startsWith("/")) return item.imageUrl;
  return FOOD_IMAGES[item.name] ?? "/assets/generated/thali.dim_400x300.jpg";
}

export const DAY_MENU: Record<string, string[]> = {
  Monday: ["Pav Bhaji", "Vada Pav", "Masala Chai", "Samosa", "Poha"],
  Tuesday: ["Chole Bhature", "Lassi", "Aloo Tikki", "Jalebi", "Bread Pakora"],
  Wednesday: ["Idli Sambar", "Dosa", "Filter Coffee", "Upma", "Medu Vada"],
  Thursday: ["Dal Tadka Rice", "Roti Sabzi", "Buttermilk", "Khichdi", "Papad"],
  Friday: ["Rajma Rice", "Paneer Tikka", "Mango Lassi", "Gulab Jamun", "Naan"],
  Saturday: ["Biryani", "Raita", "Shahi Tukda", "Seekh Kebab", "Shorba"],
  Sunday: ["Thali", "Kheer", "Aam Panna", "Pakora", "Chutney"],
};

export const ITEM_PRICES: Record<string, number> = {
  "Pav Bhaji": 60,
  "Vada Pav": 20,
  "Masala Chai": 15,
  Samosa: 10,
  Poha: 30,
  "Chole Bhature": 70,
  Lassi: 35,
  "Aloo Tikki": 25,
  Jalebi: 20,
  "Bread Pakora": 30,
  "Idli Sambar": 40,
  Dosa: 50,
  "Filter Coffee": 20,
  Upma: 30,
  "Medu Vada": 25,
  "Dal Tadka Rice": 60,
  "Roti Sabzi": 50,
  Buttermilk: 15,
  Khichdi: 45,
  Papad: 10,
  "Rajma Rice": 65,
  "Paneer Tikka": 80,
  "Mango Lassi": 40,
  "Gulab Jamun": 25,
  Naan: 20,
  Biryani: 90,
  Raita: 20,
  "Shahi Tukda": 35,
  "Seekh Kebab": 70,
  Shorba: 30,
  Thali: 100,
  Kheer: 30,
  "Aam Panna": 25,
  Pakora: 30,
  Chutney: 10,
};

export function formatTime(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
