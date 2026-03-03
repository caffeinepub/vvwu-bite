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
  MapPin,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
  const { data: todayMenu, isLoading, refetch } = useMenuByDay(today);

  // Auto-retry fetching menu until items appear (seeder may still be running)
  const retryCount = useRef(0);
  useEffect(() => {
    if (
      !isLoading &&
      (!todayMenu || todayMenu.length === 0) &&
      retryCount.current < 8
    ) {
      retryCount.current += 1;
      const delay = Math.min(1500 * retryCount.current, 6000);
      const timer = setTimeout(() => {
        void refetch();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [todayMenu, isLoading, refetch]);
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
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('/assets/generated/canteen-hero-bg.dim_1440x700.jpg')",
          }}
        />
        {/* Dark overlay - 65% opacity for contrast */}
        <div className="absolute inset-0 bg-black/65" />

        {/* Decorative ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-16 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Smart canteen badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-xs font-heading font-bold tracking-widest uppercase shadow-lg shadow-primary/30">
              ✦ SMART CANTEEN SYSTEM ✦
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-display font-black leading-none mb-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-3xl md:text-4xl drop-shadow-lg">
                  🍴🍽️🥄
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-6xl md:text-8xl lg:text-9xl text-white tracking-tight drop-shadow-2xl">
                  VVWU
                </span>
                <span className="text-6xl md:text-8xl lg:text-9xl text-accent tracking-tight drop-shadow-2xl">
                  BITE
                </span>
              </div>
            </h1>

            <p className="font-heading text-base md:text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed mt-4">
              Experience the future of canteen dining. Pre-order your favorite
              meals, skip the queue, and enjoy wait-free service.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => void navigate({ to: "/menu" })}
                className="bg-accent hover:bg-accent/90 text-[oklch(0.1_0_0)] font-heading font-black px-8 h-12 rounded-lg gap-2 text-sm tracking-widest uppercase w-full sm:w-auto glow-gold shadow-lg shadow-accent/20"
              >
                ORDER NOW
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => void navigate({ to: "/menu" })}
                className="border-white/40 text-white bg-white/5 hover:bg-white/15 hover:border-white/60 font-heading font-bold px-8 h-12 rounded-lg gap-2 text-sm tracking-widest uppercase w-full sm:w-auto backdrop-blur-sm"
              >
                VIEW MENU
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Track Order Button - animated with pulse */}
              <motion.div
                className="w-full sm:w-auto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  onClick={() => setTrackModalOpen(true)}
                  className="relative bg-primary hover:bg-primary/90 text-white font-heading font-black px-8 h-12 rounded-lg gap-2 text-sm tracking-widest uppercase w-full sm:w-auto shadow-lg shadow-primary/30 overflow-hidden"
                >
                  {/* Pulse ring animation */}
                  <span className="absolute inset-0 rounded-lg animate-ping bg-primary/30 pointer-events-none" />
                  <MapPin className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">TRACK ORDER</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom smooth wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 70"
            className="fill-background w-full block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,40 C360,70 1080,10 1440,40 L1440,70 L0,70 Z" />
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
