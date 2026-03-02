import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MenuItem } from "../backend.d.ts";
import { FoodCard } from "../components/FoodCard";
import { FoodCardSkeleton } from "../components/FoodCardSkeleton";
import { useCart } from "../context/CartContext";
import { useAverageRating, useMenuByDay } from "../hooks/useQueries";
import { DAYS, getCurrentDay } from "../utils/constants";

const DAY_LABELS: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

function MenuItemWithRating({
  item,
  isOrderable,
}: {
  item: MenuItem;
  isOrderable: boolean;
}) {
  const { data: avgRating = 0 } = useAverageRating(item.id);
  return (
    <FoodCard item={item} isOrderable={isOrderable} avgRating={avgRating} />
  );
}

function DayMenu({ day }: { day: string }) {
  const today = getCurrentDay();
  const isOrderable = day === today;
  const { data: items, isLoading } = useMenuByDay(day);

  return (
    <div>
      {!isOrderable && (
        <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground font-heading flex items-center gap-2">
          <span>👁️</span>
          <span>
            {day === today ? "Today's menu" : "View-only mode"} — You can only
            order from today&apos;s menu (
            <span className="text-accent">{today}</span>)
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
            <FoodCardSkeleton key={id} />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          initial="hidden"
          animate="show"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <MenuItemWithRating item={item} isOrderable={isOrderable} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-muted-foreground font-heading text-lg">
            No menu items for {day} yet
          </p>
        </div>
      )}
    </div>
  );
}

export function MenuPage() {
  const today = getCurrentDay();
  const [selectedDay, setSelectedDay] = useState<string>(today);
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/15 via-background to-accent/10 border-b border-border py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-heading uppercase tracking-widest text-accent mb-2">
              Daily Menu
            </p>
            <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
              <span className="gradient-text">Weekly Menu</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Browse our weekly offerings. Only today&apos;s ({today}) menu is
              available for ordering.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs
          value={selectedDay}
          onValueChange={setSelectedDay}
          className="w-full"
        >
          <div className="overflow-x-auto pb-2 mb-8">
            <TabsList className="bg-card border border-border h-auto p-1 gap-1 inline-flex min-w-full sm:min-w-0">
              {DAYS.map((day) => {
                const isToday = day === today;
                return (
                  <TabsTrigger
                    key={day}
                    value={day}
                    className={`relative flex-shrink-0 px-3 py-2 rounded-md font-heading text-sm font-medium transition-all data-[state=active]:shadow-none ${
                      isToday
                        ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
                        : "data-[state=active]:bg-muted data-[state=active]:text-foreground"
                    }`}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{DAY_LABELS[day]}</span>
                    {isToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {DAYS.map((day) => (
            <TabsContent key={day} value={day} className="mt-0">
              <DayMenu day={day} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link to="/cart">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 px-6 shadow-lg glow-red font-heading font-bold gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
              <Badge className="bg-white text-primary text-xs font-bold h-5 w-5 p-0 flex items-center justify-center">
                {itemCount}
              </Badge>
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
