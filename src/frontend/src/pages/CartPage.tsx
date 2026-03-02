import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { getItemImage } from "../utils/constants";

export function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-28 h-28 rounded-full bg-muted/50 border-2 border-dashed border-border flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2 gradient-text">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Looks like you haven&apos;t added anything yet. Explore our menu!
          </p>
          <Button
            onClick={() => void navigate({ to: "/menu" })}
            className="bg-primary hover:bg-primary/90 font-heading gap-2"
          >
            Browse Menu
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display font-bold text-3xl gradient-text mb-1">
            Your Cart
          </h1>
          <p className="text-muted-foreground text-sm">
            {items.length} item{items.length !== 1 ? "s" : ""} in your order
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((ci) => (
                <motion.div
                  key={ci.item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                >
                  {/* Image */}
                  <img
                    src={getItemImage(ci.item)}
                    alt={ci.item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm truncate">
                      {ci.item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ₹{ci.item.price} each
                    </p>
                    <p className="font-heading font-bold text-sm gold-gradient-text mt-0.5">
                      ₹{(ci.item.price * ci.quantity).toFixed(0)}
                    </p>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(ci.item.id, ci.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-heading font-bold text-sm w-6 text-center">
                      {ci.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(ci.item.id, ci.quantity + 1)}
                      disabled={ci.quantity >= Number(ci.item.quantity)}
                      className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(ci.item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive text-xs font-heading"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5 sticky top-24"
            >
              <h2 className="font-heading font-bold text-base mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                {items.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="flex justify-between text-muted-foreground"
                  >
                    <span className="truncate mr-2">
                      {ci.item.name} × {ci.quantity}
                    </span>
                    <span className="flex-shrink-0">
                      ₹{(ci.item.price * ci.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between font-heading font-bold text-base">
                <span>Total</span>
                <span className="gold-gradient-text text-lg">
                  ₹{total.toFixed(0)}
                </span>
              </div>

              <Button
                className="w-full mt-5 bg-primary hover:bg-primary/90 font-heading font-bold h-11 gap-2"
                onClick={() => void navigate({ to: "/checkout" })}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                className="w-full mt-2 text-xs font-heading text-muted-foreground hover:text-foreground"
                onClick={() => void navigate({ to: "/menu" })}
              >
                Continue Shopping
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
