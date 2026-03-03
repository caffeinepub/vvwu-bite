import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Copy,
  Package,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "../backend";
import { useAllMenuItems, useOrder } from "../hooks/useQueries";
import { formatTime, getItemImage } from "../utils/constants";

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [OrderStatus.preparing]:
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  [OrderStatus.ready]: "bg-green-500/20 text-green-400 border-green-500/30",
  [OrderStatus.delivered]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export function OrderConfirmation() {
  const { id } = useParams({ from: "/user-layout/order/$id" });
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id);
  const { data: menuItems } = useAllMenuItems();

  const copyOrderId = () => {
    void navigator.clipboard.writeText(id);
    toast.success("Order ID copied!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="font-heading font-bold text-xl mb-2">
            Order not found
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            The order ID "{id}" could not be found.
          </p>
          <Button
            onClick={() => void navigate({ to: "/" })}
            className="bg-primary"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const getItemName = (itemId: string) => {
    const item = menuItems?.find((m) => m.id === itemId);
    return item?.name ?? itemId;
  };

  const getItemObj = (itemId: string) => {
    return menuItems?.find((m) => m.id === itemId);
  };

  const estimatedMins = Number(order.estimatedTime);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: "/" })}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground font-heading gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Button>

        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center glow-gold">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="font-display font-bold text-3xl gradient-text mb-2">
            Order Placed!
          </h1>
          <p className="text-muted-foreground text-sm">
            {order.status === OrderStatus.preparing
              ? "👨‍🍳 Preparing your Delicious order 🍽️"
              : order.status === OrderStatus.ready
                ? "✅ Your order is almost ready! Please wait a moment. 🙏"
                : order.status === OrderStatus.delivered
                  ? "🎉 Your Yummy order is Ready! 🥘 Please show your token at the counter to receive it. 🪙"
                  : "✅ Order Confirmed! 🍽️ Cooking will be started soon..."}
          </p>
        </motion.div>

        {/* Token Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary/20 via-card to-accent/20 border-2 border-accent/40 rounded-2xl p-6 text-center mb-6 glow-gold"
        >
          <p className="text-xs font-heading uppercase tracking-widest text-accent mb-2">
            Your Order Token
          </p>
          <div className="font-display font-black text-3xl gold-gradient-text mb-3">
            {id}
          </div>
          <button
            type="button"
            onClick={copyOrderId}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy token
          </button>

          {estimatedMins > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">
                Estimated:{" "}
                <span className="text-foreground font-heading font-bold">
                  {estimatedMins} min{estimatedMins !== 1 ? "s" : ""}
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4"
        >
          <h2 className="font-heading font-semibold text-sm">Order Details</h2>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={`${STATUS_COLORS[order.status]} border text-xs font-heading`}
            >
              {order.status}
            </Badge>
            <Badge className="bg-muted text-muted-foreground border-border border text-xs font-heading">
              {order.orderType === OrderType.dineIn
                ? "🪑 Dine In"
                : "🥡 Takeaway"}
            </Badge>
            <Badge
              className={`border text-xs font-heading ${
                order.paymentStatus === PaymentStatus.paid
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              }`}
            >
              {order.paymentStatus === PaymentStatus.paid
                ? "✅ Paid"
                : `⏳ ${order.paymentMethod === PaymentMethod.cash ? "Pay at counter" : "Payment pending"}`}
            </Badge>
          </div>

          {/* Items List */}
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider">
              Items ordered
            </p>
            {order.items.map((orderItem) => {
              const item = getItemObj(orderItem.itemId);
              return (
                <div key={orderItem.itemId} className="flex items-center gap-3">
                  {item && (
                    <img
                      src={getItemImage(item)}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-medium text-sm truncate">
                      {getItemName(orderItem.itemId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {Number(orderItem.quantity)}
                    </p>
                  </div>
                  {item && (
                    <p className="font-heading font-bold text-sm gold-gradient-text flex-shrink-0">
                      ₹{(item.price * Number(orderItem.quantity)).toFixed(0)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="font-heading font-semibold text-sm">Total</span>
            <span className="font-heading font-bold gold-gradient-text text-lg">
              ₹{order.totalAmount.toFixed(0)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            <span>Placed at {formatTime(order.timestamp)}</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            className="flex-1 border-border hover:border-accent hover:text-accent font-heading gap-2"
            onClick={() => void navigate({ to: "/ratings" })}
          >
            <Star className="h-4 w-4" />
            Rate Your Food
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 font-heading"
            onClick={() => void navigate({ to: "/menu" })}
          >
            Order Again
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
