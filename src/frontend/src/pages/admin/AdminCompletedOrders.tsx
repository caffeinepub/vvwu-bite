import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DollarSign,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "../../backend";
import type { Order } from "../../backend.d.ts";
import { useAllMenuItems, useAllOrders } from "../../hooks/useQueries";
import { exportToCSV, formatTime } from "../../utils/constants";

export function AdminCompletedOrders() {
  const { data: allOrders, isLoading, refetch, isFetching } = useAllOrders();
  const { data: menuItems } = useAllMenuItems();
  const [filterType, setFilterType] = useState<"all" | OrderType>("all");
  const [filterPayment, setFilterPayment] = useState<"all" | PaymentMethod>(
    "all",
  );

  const today = new Date();
  const todayCompleted = (allOrders ?? []).filter((o) => {
    const d = new Date(Number(o.timestamp) / 1_000_000);
    return (
      o.status === OrderStatus.delivered &&
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  const filtered = todayCompleted.filter((o) => {
    const typeMatch = filterType === "all" ? true : o.orderType === filterType;
    const payMatch =
      filterPayment === "all" ? true : o.paymentMethod === filterPayment;
    return typeMatch && payMatch;
  });

  const totalRevenue = filtered.reduce((sum, o) => sum + o.totalAmount, 0);

  const getItemNames = (order: Order) => {
    if (!menuItems) return order.items.map((i) => i.itemId).join(", ");
    return order.items
      .map((oi) => {
        const item = menuItems.find((m) => m.id === oi.itemId);
        return `${item?.name ?? oi.itemId} ×${Number(oi.quantity)}`;
      })
      .join(", ");
  };

  const handleExport = () => {
    if (!filtered.length) return;
    const csvData = filtered.map((o) => ({
      "Order ID": o.id,
      Customer: o.customerName,
      Items: getItemNames(o),
      "Order Type": o.orderType,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      Amount: `₹${o.totalAmount}`,
      Time: formatTime(o.timestamp),
    }));
    exportToCSV(
      csvData as Record<string, unknown>[],
      `completed-orders-${new Date().toISOString().split("T")[0]}`,
    );
  };

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
              Today
            </p>
            <h1 className="font-display font-bold text-3xl gradient-text">
              Completed Orders
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
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
              disabled={!filtered.length}
              className="border-border font-heading text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl">
                {isLoading ? "..." : filtered.length}
              </div>
              <div className="text-xs text-muted-foreground font-heading">
                Completed
              </div>
            </div>
          </div>
          <div className="bg-card border border-accent/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl gold-gradient-text">
                ₹{isLoading ? "..." : totalRevenue.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground font-heading">
                Total Revenue
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as typeof filterType)}
          >
            <SelectTrigger className="h-8 w-36 text-xs bg-card border-border font-heading">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-xs font-heading">
                All Types
              </SelectItem>
              <SelectItem
                value={OrderType.dineIn}
                className="text-xs font-heading"
              >
                Dine-In Only
              </SelectItem>
              <SelectItem
                value={OrderType.takeaway}
                className="text-xs font-heading"
              >
                Takeaway Only
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPayment}
            onValueChange={(v) => setFilterPayment(v as typeof filterPayment)}
          >
            <SelectTrigger className="h-8 w-36 text-xs bg-card border-border font-heading">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-xs font-heading">
                All Payments
              </SelectItem>
              <SelectItem
                value={PaymentMethod.cash}
                className="text-xs font-heading"
              >
                Cash Only
              </SelectItem>
              <SelectItem
                value={PaymentMethod.online}
                className="text-xs font-heading"
              >
                Online Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["cosk1", "cosk2", "cosk3", "cosk4", "cosk5"].map((id) => (
                <Skeleton key={id} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Type",
                      "Payment",
                      "Amount",
                      "Time",
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
                  {filtered.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-accent font-bold">
                          {order.id}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-heading font-medium text-sm">
                          {order.customerName}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div
                          className="text-xs text-muted-foreground truncate"
                          title={getItemNames(order)}
                        >
                          {getItemNames(order)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <Badge
                            className={`text-xs border font-heading ${
                              order.paymentStatus === PaymentStatus.paid
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {order.paymentMethod === PaymentMethod.cash
                              ? "💵 Cash"
                              : "📱 Online"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-heading font-bold text-sm gold-gradient-text">
                          ₹{order.totalAmount.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(order.timestamp)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-heading font-semibold text-lg mb-1">
                No completed orders yet
              </p>
              <p className="text-muted-foreground text-sm">
                Orders will appear here once delivered
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
