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
  Idada: "/assets/generated/idada.dim_400x300.jpg",
  "Sev Khaman": "/assets/generated/sev-khaman.dim_400x300.jpg",
  "Atta Maggi": "/assets/generated/atta-maggi.dim_400x300.jpg",
  Khichu: "/assets/generated/khichu.dim_400x300.jpg",
  Puff: "/assets/generated/puff.dim_400x300.jpg",
  "French Fries": "/assets/generated/french-fries.dim_400x300.jpg",
  "Farali Sabudana Khichadi":
    "/assets/generated/farali-sabudana-khichadi.dim_400x300.jpg",
  "Vada Pav": "/assets/generated/vada-pav.dim_400x300.jpg",
  Pizza: "/assets/generated/pizza.dim_400x300.jpg",
  "Dal Samosa (5 pcs.)": "/assets/generated/dal-samosa.dim_400x300.jpg",
  "Veg. Burger": "/assets/generated/veg-burger.dim_400x300.jpg",
  "Cheese Burger": "/assets/generated/cheese-burger.dim_400x300.jpg",
  Bhel: "/assets/generated/bhel.dim_400x300.jpg",
  "Bread Roll": "/assets/generated/bread-roll.dim_400x300.jpg",
  "Medu Vada": "/assets/generated/medu-vada.dim_400x300.jpg",
  Dabeli: "/assets/generated/dabeli.dim_400x300.jpg",
  "Chana Chaat": "/assets/generated/chana-chaat.dim_400x300.jpg",
  "Batata Puri": "/assets/generated/batata-puri.dim_400x300.jpg",
  Noodles: "/assets/generated/noodles.dim_400x300.jpg",
  "Aloo Puri": "/assets/generated/aloo-puri.dim_400x300.jpg",
  "Cheese Aloo Puri": "/assets/generated/cheese-aloo-puri.dim_400x300.jpg",
  "Corn Bhel": "/assets/generated/corn-bhel.dim_400x300.jpg",
  Poha: "/assets/generated/poha.dim_400x300.jpg",
  "Rasawala Khaman": "/assets/generated/rasawala-khaman.dim_400x300.jpg",
  "Veg. Frankie": "/assets/generated/veg-frankie.dim_400x300.jpg",
  "Cheese Frankie": "/assets/generated/cheese-frankie.dim_400x300.jpg",
};

export function getItemImage(item: { imageUrl: string; name: string }): string {
  if (item.imageUrl?.startsWith("/")) return item.imageUrl;
  return FOOD_IMAGES[item.name] ?? "/assets/generated/thali.dim_400x300.jpg";
}

export const DAY_MENU: Record<string, string[]> = {
  Monday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
    "Farali Sabudana Khichadi",
    "Vada Pav",
    "Pizza",
  ],
  Tuesday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
    "Farali Sabudana Khichadi",
    "Dal Samosa (5 pcs.)",
    "Veg. Burger",
    "Cheese Burger",
  ],
  Wednesday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
    "Bhel",
    "Bread Roll",
    "Medu Vada",
  ],
  Thursday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
    "Farali Sabudana Khichadi",
    "Dabeli",
    "Chana Chaat",
    "Batata Puri",
  ],
  Friday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
    "Noodles",
    "Aloo Puri",
    "Cheese Aloo Puri",
    "Corn Bhel",
  ],
  Saturday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
    "Poha",
    "Rasawala Khaman",
    "Veg. Frankie",
    "Cheese Frankie",
  ],
  Sunday: [
    "Idada",
    "Sev Khaman",
    "Atta Maggi",
    "Khichu",
    "Puff",
    "French Fries",
  ],
};

export const ITEM_PRICES: Record<string, number> = {
  Idada: 20,
  "Sev Khaman": 25,
  "Atta Maggi": 30,
  Khichu: 25,
  Puff: 20,
  "French Fries": 30,
  "Farali Sabudana Khichadi": 30,
  "Vada Pav": 25,
  Pizza: 100,
  "Dal Samosa (5 pcs.)": 25,
  "Veg. Burger": 50,
  "Cheese Burger": 60,
  Bhel: 25,
  "Bread Roll": 30,
  "Medu Vada": 40,
  Dabeli: 25,
  "Chana Chaat": 30,
  "Batata Puri": 25,
  Noodles: 30,
  "Aloo Puri": 20,
  "Cheese Aloo Puri": 40,
  "Corn Bhel": 40,
  Poha: 20,
  "Rasawala Khaman": 30,
  "Veg. Frankie": 40,
  "Cheese Frankie": 60,
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
