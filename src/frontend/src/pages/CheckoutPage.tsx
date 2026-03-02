import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Loader2, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderType, PaymentMethod } from "../backend";
import { useCart } from "../context/CartContext";
import { usePlaceOrder } from "../hooks/useQueries";

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const placeOrder = usePlaceOrder();

  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.dineIn);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.cash,
  );

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const orderItems = items.map((ci) => ({
        itemId: ci.item.id,
        quantity: BigInt(ci.quantity),
      }));

      const orderId = await placeOrder.mutateAsync({
        items: orderItems,
        orderType,
        paymentMethod,
        customerName: customerName.trim(),
      });

      clearCart();
      void navigate({ to: `/order/${orderId}` });
    } catch {
      // error handled by mutation
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-heading text-muted-foreground mb-4">
            Your cart is empty
          </p>
          <Button
            onClick={() => void navigate({ to: "/menu" })}
            className="bg-primary"
          >
            Go to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: "/cart" })}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground font-heading gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="font-display font-bold text-3xl gradient-text">
            Checkout
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3 space-y-6"
          >
            {/* Customer Name */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-heading font-semibold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Your Details
              </h2>
              <div className="space-y-2">
                <Label className="font-heading text-sm">
                  Name <span className="text-primary">*</span>
                </Label>
                <Input
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-muted border-border focus:border-accent font-heading"
                />
                <p className="text-xs text-muted-foreground">
                  This will be used to identify your order
                </p>
              </div>
            </div>

            {/* Order Type */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-heading font-semibold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </span>
                How do you want it?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    type: OrderType.dineIn,
                    label: "Dine In",
                    emoji: "🪑",
                    desc: "Eat at canteen",
                  },
                  {
                    type: OrderType.takeaway,
                    label: "Takeaway",
                    emoji: "🥡",
                    desc: "Take to go",
                  },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.type}
                    onClick={() => setOrderType(opt.type)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      orderType === opt.type
                        ? "border-primary bg-primary/10 shadow-glow-red"
                        : "border-border bg-muted/30 hover:border-border/80"
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="font-heading font-semibold text-sm">
                      {opt.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-heading font-semibold text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    method: PaymentMethod.cash,
                    label: "Cash",
                    emoji: "💵",
                    desc: "Pay at counter",
                  },
                  {
                    method: PaymentMethod.online,
                    label: "Online",
                    emoji: "📱",
                    desc: "UPI / QR Code",
                  },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.method}
                    onClick={() => setPaymentMethod(opt.method)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === opt.method
                        ? "border-accent bg-accent/10 shadow-glow-gold"
                        : "border-border bg-muted/30 hover:border-border/80"
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="font-heading font-semibold text-sm">
                      {opt.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* QR Code for Online Payment */}
              {paymentMethod === PaymentMethod.online && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 rounded-xl bg-muted/50 border border-accent/30"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-3 rounded-xl border border-accent/30 flex-shrink-0">
                      <img
                        src="/assets/generated/payment-qr.dim_300x300.png"
                        alt="Payment QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-1.5 mb-2 justify-center sm:justify-start">
                        <QrCode className="h-4 w-4 text-accent" />
                        <span className="font-heading font-semibold text-sm text-accent">
                          Scan &amp; Pay
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Scan the QR code with any UPI app to pay
                      </p>
                      <div className="bg-card border border-border rounded-lg px-3 py-1.5 inline-block">
                        <p className="font-mono text-xs text-accent">
                          vvwu.canteen@upi
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Amount:{" "}
                        <span className="text-foreground font-bold">
                          ₹{total.toFixed(0)}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
              <h2 className="font-heading font-semibold text-base mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate mr-2">
                      {ci.item.name}{" "}
                      <span className="text-foreground">×{ci.quantity}</span>
                    </span>
                    <span className="flex-shrink-0 font-heading font-medium">
                      ₹{(ci.item.price * ci.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service charge</span>
                  <span className="text-green-400">Free</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between font-heading font-bold text-base mb-5">
                <span>Total Payable</span>
                <span className="gold-gradient-text text-xl">
                  ₹{total.toFixed(0)}
                </span>
              </div>

              {/* Summary Badges */}
              <div className="flex gap-2 mb-5 flex-wrap">
                <span className="text-xs bg-muted border border-border px-2 py-1 rounded-full font-heading">
                  {orderType === OrderType.dineIn
                    ? "🪑 Dine In"
                    : "🥡 Takeaway"}
                </span>
                <span className="text-xs bg-muted border border-border px-2 py-1 rounded-full font-heading">
                  {paymentMethod === PaymentMethod.cash
                    ? "💵 Cash"
                    : "📱 Online"}
                </span>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 font-heading font-bold h-12 gap-2 glow-red"
                onClick={() => void handlePlaceOrder()}
                disabled={placeOrder.isPending}
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Place Order — ₹{total.toFixed(0)}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                You&apos;ll receive a unique order token after placement
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
