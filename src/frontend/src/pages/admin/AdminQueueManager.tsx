import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "../../backend";
import type { Order } from "../../backend.d.ts";
import {
  useAllMenuItems,
  useMarkDelivered,
  useMarkPaymentPaid,
  useQueueOrders,
  useUpdateEstimatedTime,
  useUpdateOrderStatus,
} from "../../hooks/useQueries";
import { exportToCSV, formatTime } from "../../utils/constants";

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.pending]:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  [OrderStatus.preparing]:
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  [OrderStatus.ready]: "bg-green-500/20 text-green-400 border-green-500/30",
  [OrderStatus.delivered]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

function QueueOrderRow({
  order,
  index,
}: {
  order: Order;
  index: number;
}) {
  const markDelivered = useMarkDelivered();
  const markPaid = useMarkPaymentPaid();
  const updateStatus = useUpdateOrderStatus();
  const updateTime = useUpdateEstimatedTime();
  const { data: menuItems } = useAllMenuItems();
  const [editingTime, setEditingTime] = useState(false);
  const [timeVal, setTimeVal] = useState(String(Number(order.estimatedTime)));

  const getItemNames = () => {
    if (!menuItems) return order.items.map((i) => i.itemId).join(", ");
    return order.items
      .map((oi) => {
        const item = menuItems.find((m) => m.id === oi.itemId);
        return `${item?.name ?? oi.itemId} ×${Number(oi.quantity)}`;
      })
      .join(", ");
  };

  const handleSaveTime = async () => {
    await updateTime.mutateAsync({
      orderId: order.id,
      time: BigInt(Number(timeVal) || 0),
    });
    setEditingTime(false);
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-border hover:bg-muted/20 transition-colors"
    >
      {/* Order ID */}
      <td className="py-3 px-4">
        <div className="font-mono text-xs text-accent font-bold">
          {order.id}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatTime(order.timestamp)}
        </div>
      </td>

      {/* Customer */}
      <td className="py-3 px-4">
        <div className="font-heading font-medium text-sm">
          {order.customerName}
        </div>
      </td>

      {/* Items */}
      <td className="py-3 px-4 max-w-[200px]">
        <div
          className="text-xs text-muted-foreground truncate"
          title={getItemNames()}
        >
          {getItemNames()}
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-4">
        <Badge
          className={`text-xs border font-heading ${
            order.orderType === OrderType.dineIn
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : "bg-purple-500/20 text-purple-400 border-purple-500/30"
          }`}
        >
          {order.orderType === OrderType.dineIn ? "🪑 Dine In" : "🥡 Takeaway"}
        </Badge>
      </td>

      {/* Est. Time */}
      <td className="py-3 px-4">
        {editingTime ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)}
              className="h-7 w-16 text-xs bg-muted border-border font-heading p-1"
              onKeyDown={(e) => e.key === "Enter" && void handleSaveTime()}
            />
            <button
              type="button"
              onClick={() => void handleSaveTime()}
              className="text-xs text-green-400 hover:text-green-300 font-heading"
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingTime(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Clock className="h-3 w-3" />
            <span>{Number(order.estimatedTime) || "—"} min</span>
          </button>
        )}
      </td>

      {/* Payment */}
      <td className="py-3 px-4">
        <div className="space-y-1">
          <Badge
            className={`text-xs border font-heading ${
              order.paymentStatus === PaymentStatus.paid
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}
          >
            {order.paymentStatus === PaymentStatus.paid ? "Paid" : "Unpaid"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {order.paymentMethod === PaymentMethod.cash
              ? "💵 Cash"
              : "📱 Online"}
          </div>
          {order.paymentStatus !== PaymentStatus.paid && (
            <button
              type="button"
              onClick={() => void markPaid.mutateAsync(order.id)}
              className="text-xs text-accent hover:underline font-heading"
              disabled={markPaid.isPending}
            >
              Mark Paid
            </button>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <Select
          value={order.status}
          onValueChange={(v) =>
            void updateStatus.mutateAsync({
              orderId: order.id,
              status: v as OrderStatus,
            })
          }
        >
          <SelectTrigger className="h-7 w-32 text-xs bg-muted border-border font-heading">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {Object.values(OrderStatus)
              .filter((s) => s !== OrderStatus.delivered)
              .map((s) => (
                <SelectItem key={s} value={s} className="text-xs font-heading">
                  <Badge className={`${STATUS_STYLES[s]} border text-xs`}>
                    {s}
                  </Badge>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </td>

      {/* Amount */}
      <td className="py-3 px-4">
        <span className="font-heading font-bold text-sm gold-gradient-text">
          ₹{order.totalAmount.toFixed(0)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <Button
          size="sm"
          onClick={() => void markDelivered.mutateAsync(order.id)}
          disabled={markDelivered.isPending}
          className="h-7 text-xs bg-green-600 hover:bg-green-700 font-heading gap-1"
        >
          {markDelivered.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          Delivered
        </Button>
      </td>
    </motion.tr>
  );
}

export function AdminQueueManager() {
  const { data: orders, isLoading, refetch, isFetching } = useQueueOrders();

  const handleExport = () => {
    if (!orders?.length) return;
    const csvData = orders.map((o) => ({
      "Order ID": o.id,
      Customer: o.customerName,
      "Order Type": o.orderType,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      Status: o.status,
      Amount: `₹${o.totalAmount}`,
      "Est. Time (min)": Number(o.estimatedTime),
      Time: formatTime(o.timestamp),
    }));
    exportToCSV(
      csvData as Record<string, unknown>[],
      `queue-${new Date().toISOString().split("T")[0]}`,
    );
  };

  const dineInCount =
    orders?.filter((o) => o.orderType === OrderType.dineIn).length ?? 0;
  const takeawayCount =
    orders?.filter((o) => o.orderType === OrderType.takeaway).length ?? 0;
  const unpaidCount =
    orders?.filter((o) => o.paymentStatus !== PaymentStatus.paid).length ?? 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <p className="text-xs font-heading uppercase tracking-widest text-accent mb-1">
              Live
            </p>
            <h1 className="font-display font-bold text-3xl gradient-text">
              Queue Manager
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              Auto-refreshes every 10 seconds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="border-border font-heading text-xs gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!orders?.length}
              className="border-border font-heading text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "In Queue",
              value: orders?.length ?? 0,
              icon: ShoppingBag,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Dine-In",
              value: dineInCount,
              icon: Users,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Takeaway",
              value: takeawayCount,
              icon: ShoppingBag,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              label: "Unpaid",
              value: unpaidCount,
              icon: Clock,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <div className="font-display font-bold text-xl">
                  {isLoading ? "..." : stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-heading">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["qsk1", "qsk2", "qsk3", "qsk4", "qsk5"].map((id) => (
                <Skeleton key={id} className="h-16 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Type",
                      "Est. Time",
                      "Payment",
                      "Status",
                      "Amount",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-left font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {orders.map((order, i) => (
                      <QueueOrderRow key={order.id} order={order} index={i} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-heading font-semibold text-lg mb-1">
                All Clear!
              </p>
              <p className="text-muted-foreground text-sm">
                No orders in the queue right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
