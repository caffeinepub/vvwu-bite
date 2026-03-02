import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus, OrderType, PaymentStatus } from "../../backend";
import {
  useAllMenuItems,
  useAllOrders,
  useQueueOrders,
  useSalesSummary,
} from "../../hooks/useQueries";
import { formatTime, getCurrentDay } from "../../utils/constants";

export function AdminDashboard() {
  const navigate = useNavigate();
  const today = getCurrentDay();

  const todayTs = BigInt(
    new Date(new Date().setHours(0, 0, 0, 0)).getTime() * 1_000_000,
  );

  const { data: queueOrders, isLoading: queueLoading } = useQueueOrders();
  const { data: allOrders, isLoading: ordersLoading } = useAllOrders();
  const { data: sales, isLoading: salesLoading } = useSalesSummary(todayTs);
  useAllMenuItems(); // preload menu items

  const todayOrders =
    allOrders?.filter((o) => {
      const d = new Date(Number(o.timestamp) / 1_000_000);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }) ?? [];

  const completedToday = todayOrders.filter(
    (o) => o.status === OrderStatus.delivered,
  ).length;
  const revenueToday = todayOrders
    .filter((o) => o.status === OrderStatus.delivered)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const statsCards = [
    {
      title: "Orders Today",
      value: ordersLoading ? "..." : todayOrders.length,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      title: "Revenue Today",
      value: salesLoading
        ? "..."
        : `₹${sales?.totalRevenue?.toFixed(0) ?? revenueToday.toFixed(0)}`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
    },
    {
      title: "In Queue",
      value: queueLoading ? "..." : (queueOrders?.length ?? 0),
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Completed Today",
      value: ordersLoading ? "..." : completedToday,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  const quickLinks = [
    {
      to: "/admin/menu",
      label: "Menu Manager",
      desc: "Add & edit daily menu items",
      icon: UtensilsCrossed,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      to: "/admin/queue",
      label: "Queue Manager",
      desc: "Manage active orders",
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      to: "/admin/orders",
      label: "Completed Orders",
      desc: "Today's delivered orders",
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      to: "/admin/history",
      label: "Sales History",
      desc: "Historical data & exports",
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-heading uppercase tracking-widest text-accent mb-1">
            Admin Panel
          </p>
          <h1 className="font-display font-bold text-3xl gradient-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · Today: <span className="text-accent">{today}</span>
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-card border ${card.borderColor} rounded-xl p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}
                >
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <div className="font-display font-bold text-2xl md:text-3xl mb-1">
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground font-heading">
                {card.title}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickLinks.map((link, i) => (
                <motion.button
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => void navigate({ to: link.to })}
                  className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-border/80 hover:bg-muted/30 transition-all text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${link.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {link.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent Queue Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Current Queue
              </h2>
              <button
                type="button"
                onClick={() => void navigate({ to: "/admin/queue" })}
                className="text-xs text-accent hover:underline font-heading"
              >
                View all →
              </button>
            </div>

            {queueLoading ? (
              <div className="space-y-3">
                {["dsk1", "dsk2", "dsk3", "dsk4"].map((id) => (
                  <Skeleton key={id} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : queueOrders && queueOrders.length > 0 ? (
              <div className="space-y-3">
                {queueOrders.slice(0, 5).map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-heading font-bold text-accent">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm truncate">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.id} · {formatTime(order.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        className={`text-xs border font-heading ${
                          order.orderType === OrderType.dineIn
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {order.orderType === OrderType.dineIn
                          ? "Dine In"
                          : "Takeaway"}
                      </Badge>
                      <Badge
                        className={`text-xs border font-heading ${
                          order.paymentStatus === PaymentStatus.paid
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {order.paymentStatus === PaymentStatus.paid
                          ? "Paid"
                          : "Pending"}
                      </Badge>
                    </div>
                    <span className="font-heading font-bold text-sm gold-gradient-text flex-shrink-0">
                      ₹{order.totalAmount.toFixed(0)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-muted-foreground text-sm font-heading">
                  No orders in queue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
