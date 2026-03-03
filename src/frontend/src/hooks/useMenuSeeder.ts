import { useEffect, useRef } from "react";
import type { MenuItem } from "../backend.d.ts";
import { DAY_MENU, FOOD_IMAGES, ITEM_PRICES } from "../utils/constants";
import { useActor } from "./useActor";

function buildMenuItems(): MenuItem[] {
  const items: MenuItem[] = [];
  for (const [day, names] of Object.entries(DAY_MENU)) {
    for (const name of names) {
      const id = `${day}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const price = ITEM_PRICES[name] ?? 30;
      const imageUrl = FOOD_IMAGES[name] ?? "";
      items.push({
        id,
        name,
        price,
        quantity: BigInt(50),
        imageUrl,
        dayOfWeek: day,
        description: "",
        category: "Snack",
      });
    }
  }
  return items;
}

export function useMenuSeeder() {
  const { actor, isFetching } = useActor();
  // Track attempts so we don't loop infinitely, but allow a few retries
  const attemptRef = useRef(0);
  const seedingRef = useRef(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    if (seedingRef.current) return;
    if (attemptRef.current >= 5) return; // Give up after 5 attempts

    seedingRef.current = true;
    attemptRef.current += 1;

    (async () => {
      try {
        // Check count - use loose comparison to handle both number and bigint
        const rawCount = await actor.getMenuItemCount();
        const count =
          typeof rawCount === "bigint" ? rawCount : BigInt(rawCount as number);

        if (count === 0n) {
          console.log(
            `[MenuSeeder] Menu is empty, seeding all items (attempt ${attemptRef.current})...`,
          );
          const items = buildMenuItems();
          await actor.seedMenuItems(items);
          console.log(
            `[MenuSeeder] Successfully seeded ${items.length} menu items.`,
          );
        } else {
          // Menu exists - verify today's day has items
          const today = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ][new Date().getDay()];
          const todayItems = await actor.getMenuByDay(today);
          if (
            todayItems.length === 0 &&
            DAY_MENU[today] &&
            DAY_MENU[today].length > 0
          ) {
            console.log(
              `[MenuSeeder] No items for ${today}, re-seeding all items...`,
            );
            const items = buildMenuItems();
            await actor.seedMenuItems(items);
            console.log(`[MenuSeeder] Re-seeded ${items.length} items.`);
          } else {
            console.log(
              `[MenuSeeder] Menu OK: ${Number(count)} items, ${todayItems.length} for ${today}.`,
            );
          }
        }
      } catch (err) {
        console.error(
          `[MenuSeeder] Attempt ${attemptRef.current} failed:`,
          err,
        );
        // Allow retry on next effect trigger
        seedingRef.current = false;
      } finally {
        seedingRef.current = false;
      }
    })();
  }, [actor, isFetching]);
}
