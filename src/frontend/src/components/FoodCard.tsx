import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import type { MenuItem } from "../backend";
import { useCart } from "../context/CartContext";
import { getItemImage } from "../utils/constants";

interface FoodCardProps {
  item: MenuItem;
  isOrderable?: boolean;
  avgRating?: number;
  ratingCount?: number;
}

export function FoodCard({
  item,
  isOrderable = true,
  avgRating = 0,
  ratingCount = 0,
}: FoodCardProps) {
  const { addItem, items } = useCart();
  const qty = Number(item.quantity);
  const cartQty = items.find((ci) => ci.item.id === item.id)?.quantity ?? 0;

  const qtyBadgeClass =
    qty === 0
      ? "bg-destructive/20 text-destructive border-destructive/30"
      : qty <= 5
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-green-500/20 text-green-400 border-green-500/30";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-card-glow hover:border-accent/50 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={getItemImage(item)}
          alt={item.name}
          className="w-full h-44 object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Category Badge */}
        <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground border-0 text-xs font-heading">
          {item.category || "Snack"}
        </Badge>

        {/* View Only Badge */}
        {!isOrderable && (
          <Badge className="absolute top-2 right-2 bg-muted/90 text-muted-foreground border-0 text-xs">
            View Only
          </Badge>
        )}

        {/* Qty available */}
        <div
          className={cn(
            "absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full border font-heading font-medium",
            qtyBadgeClass,
          )}
        >
          {qty === 0 ? "Sold Out" : `${qty} left`}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-heading font-semibold text-base leading-tight truncate">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Rating */}
        {ratingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3 w-3",
                    star <= Math.round(avgRating)
                      ? "text-accent fill-accent"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {avgRating.toFixed(1)} ({ratingCount})
            </span>
          </div>
        )}

        {/* Price + Button */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="font-display font-bold text-lg gold-gradient-text">
              ₹{item.price}
            </span>
          </div>

          {isOrderable && (
            <Button
              size="sm"
              onClick={() => addItem(item)}
              disabled={qty === 0}
              className={cn(
                "h-8 px-3 rounded-lg font-heading text-xs font-semibold gap-1.5",
                qty === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90",
              )}
            >
              {cartQty > 0 ? (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {cartQty} in cart
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
