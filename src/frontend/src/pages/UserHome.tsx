import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Star,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FoodCard } from "../components/FoodCard";
import { FoodCardSkeleton } from "../components/FoodCardSkeleton";
import { useAverageRating, useMenuByDay } from "../hooks/useQueries";
import { getCurrentDay } from "../utils/constants";

function TodayItemWithRating({
  item,
}: {
  item: import("../backend.d.ts").MenuItem;
}) {
  const { data: avgRating = 0 } = useAverageRating(item.id);
  return <FoodCard item={item} isOrderable avgRating={avgRating} />;
}

export function UserHome() {
  const navigate = useNavigate();
  const today = getCurrentDay();
  const { data: todayMenu, isLoading } = useMenuByDay(today);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleTrackOrder = () => {
    if (orderId.trim()) {
      void navigate({ to: `/order/${orderId.trim()}` });
      setTrackModalOpen(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Pre-Order Ahead",
      desc: "Skip the wait — order before you arrive",
    },
    {
      icon: Users,
      title: "Queue Management",
      desc: "Real-time queue updates on your phone",
    },
    {
      icon: Utensils,
      title: "Dine-In & Takeaway",
      desc: "Choose how you want your meal served",
    },
    {
      icon: Clock,
      title: "Daily Fresh Menu",
      desc: "New menu every day of the week",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/canteen-hero.dim_1200x500.jpg')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl md:text-6xl">🍴🍽️🥄</span>
            </div>

            <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-tight">
              <span className="gradient-text">VVWU-Bite</span>
            </h1>

            <p className="font-heading text-lg md:text-xl text-white/80 mb-3 tracking-wide">
              Smart Canteen Pre-Ordering &amp; Queue Management
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/50" />
              <span className="text-accent text-sm font-heading tracking-widest uppercase">
                VV Wadala University
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/50" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => void navigate({ to: "/menu" })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold px-8 h-12 rounded-xl glow-red gap-2 text-base w-full sm:w-auto"
              >
                Order Now
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setTrackModalOpen(true)}
                className="border-accent/50 text-accent hover:bg-accent/10 font-heading font-bold px-8 h-12 rounded-xl gap-2 text-base w-full sm:w-auto"
              >
                Track My Order
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            className="fill-background w-full"
            aria-hidden="true"
          >
            <title>Wave divider</title>
            <path d="M0,60L1440,0L1440,60L0,60Z" />
          </svg>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-10 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Special */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
              <div>
                <p className="text-xs font-heading uppercase tracking-widest text-accent mb-0.5">
                  Fresh Today
                </p>
                <h2 className="font-display font-bold text-3xl md:text-4xl">
                  <span className="gradient-text">{today}&apos;s Special</span>
                </h2>
              </div>
            </div>
            <p className="text-muted-foreground ml-4 text-sm">
              Freshly prepared for today — order now and skip the queue!
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
                <FoodCardSkeleton key={id} />
              ))}
            </div>
          ) : todayMenu && todayMenu.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {todayMenu.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <TodayItemWithRating item={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-muted-foreground font-heading">
                Menu not available yet. Check back soon!
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => void navigate({ to: "/menu" })}
              className="border-border hover:border-accent hover:text-accent font-heading gap-2"
            >
              View Full Menu
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 bg-gradient-to-r from-primary/20 via-card to-accent/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { num: "500+", label: "Daily Orders", icon: "🍱" },
              { num: "35", label: "Menu Items", icon: "🥘" },
              { num: "4.8", label: "Average Rating", icon: "⭐" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="space-y-1"
              >
                <div className="text-3xl">{stat.icon}</div>
                <div className="font-display font-bold text-3xl md:text-4xl gold-gradient-text">
                  {stat.num}
                </div>
                <div className="text-sm text-muted-foreground font-heading">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Order Modal */}
      <AnimatePresence>
        {trackModalOpen && (
          <Dialog open={trackModalOpen} onOpenChange={setTrackModalOpen}>
            <DialogContent className="bg-card border-border max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading font-bold gradient-text">
                  Track Your Order
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter Order ID (e.g. VVWU-123)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                  className="bg-muted border-border font-heading"
                />
                <Button
                  onClick={handleTrackOrder}
                  className="w-full bg-primary hover:bg-primary/90 font-heading"
                >
                  Track Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
