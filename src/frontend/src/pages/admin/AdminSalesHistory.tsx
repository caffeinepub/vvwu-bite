import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Calendar,
  DollarSign,
  Download,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
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
import {
  useAllMenuItems,
  useOrdersByDate,
  useOrdersByDateRange,
  useSalesSummary,
} from "../../hooks/useQueries";
import { exportToCSV, formatTime } from "../../utils/constants";

function dateToNano(d: Date): bigint {
  const startOfDay = new Date(d);
  startOfDay.setHours(0, 0, 0, 0);
  return BigInt(startOfDay.getTime() * 1_000_000);
}

function dateEndToNano(d: Date): bigint {
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return BigInt(endOfDay.getTime() * 1_000_000);
}

function MonthChart({
  orders,
  selectedDate,
}: { orders: Order[]; selectedDate: Date }) {
  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0,
  ).getDate();

  const dailyCounts: number[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return orders.filter((o) => {
      const d = new Date(Number(o.timestamp) / 1_000_000);
      return (
        d.getDate() === day &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    }).length;
  });

  const maxCount = Math.max(...dailyCounts, 1);

  return (
    <div className="space-y-2">
      <p className="text-xs font-heading text-muted-foreground uppercase tracking-wider">
        Orders this month — {format(selectedDate, "MMMM yyyy")}
      </p>
      <div className="flex items-end gap-0.5 h-20">
        {dailyCounts.map((count, i) => (
          <div
            key={`day-${i + 1}`}
            className="flex-1 flex flex-col items-center gap-0.5 group"
          >
            <div
              className="w-full rounded-sm bg-primary/70 hover:bg-primary transition-all duration-300"
              style={{
                height: `${(count / maxCount) * 100}%`,
                minHeight: count > 0 ? "4px" : "0",
              }}
              title={`Day ${i + 1}: ${count} orders`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-heading">
        <span>1</span>
        <span>{Math.floor(daysInMonth / 2)}</span>
        <span>{daysInMonth}</span>
      </div>
    </div>
  );
}

export function AdminSalesHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calOpen, setCalOpen] = useState(false);
  const { data: menuItems } = useAllMenuItems();

  const dateNano = dateToNano(selectedDate);
  const dateEndNano = dateEndToNano(selectedDate);

  const {
    data: dayOrders,
    isLoading,
    refetch: refetchDay,
    isFetching: dayFetching,
  } = useOrdersByDate(dateNano);
  useSalesSummary(dateNano); // kept for potential display

  // Get month range for chart — use last nanosecond of last day of month
  const monthStart = dateToNano(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const monthEnd = BigInt(
    new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime() * 1_000_000,
  );
  const {
    data: monthOrders,
    refetch: refetchMonth,
    isFetching: monthFetching,
  } = useOrdersByDateRange(monthStart, monthEnd);

  const isRefreshing = dayFetching || monthFetching;

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
    if (!dayOrders?.length) return;
    const csvData = dayOrders.map((o) => ({
      "Order ID": o.id,
      Customer: o.customerName,
      Items: getItemNames(o),
      "Order Type": o.orderType,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      Status: o.status,
      Amount: `₹${o.totalAmount}`,
      Time: formatTime(o.timestamp),
    }));
    exportToCSV(
      csvData as Record<string, unknown>[],
      `sales-${format(selectedDate, "yyyy-MM-dd")}`,
    );
  };

  const handleExportMonth = () => {
    if (!monthOrders?.length) return;
    const csvData = monthOrders.map((o) => ({
      "Order ID": o.id,
      Customer: o.customerName,
      Items: getItemNames(o),
      Date: format(new Date(Number(o.timestamp) / 1_000_000), "dd MMM yyyy"),
      Status: o.status,
      Amount: `₹${o.totalAmount}`,
    }));
    exportToCSV(
      csvData as Record<string, unknown>[],
      `monthly-sales-${format(selectedDate, "yyyy-MM")}`,
    );
  };

  // Revenue = only delivered orders
  const revenue =
    dayOrders
      ?.filter((o) => o.status === OrderStatus.delivered)
      .reduce((sum, o) => sum + o.totalAmount, 0) ?? 0;

  const completedOrders =
    dayOrders?.filter((o) => o.status === OrderStatus.delivered).length ?? 0;

  // Month revenue = only delivered
  const monthRevenue =
    monthOrders
      ?.filter((o) => o.status === OrderStatus.delivered)
      .reduce((s, o) => s + o.totalAmount, 0) ?? 0;

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Suppress unused variable warning — dateEndNano used for potential direct query
  void dateEndNano;

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
              Analytics
            </p>
            <h1 className="font-display font-bold text-3xl gradient-text">
              Sales History
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void refetchDay();
                void refetchMonth();
              }}
              disabled={isRefreshing}
              className="border-border font-heading text-xs gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {/* Date Picker */}
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border font-heading text-xs gap-1.5 min-w-36"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {isToday ? "Today" : format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="bg-card border-border p-0 w-auto"
                align="end"
              >
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      setSelectedDate(d);
                      setCalOpen(false);
                    }
                  }}
                  disabled={{ after: new Date() }}
                  className="rounded-md"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!dayOrders?.length}
              className="border-border font-heading text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Day
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMonth}
              disabled={!monthOrders?.length}
              className="border-border font-heading text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Month
            </Button>
          </div>
        </motion.div>

        {/* Selected Date Label */}
        <p className="text-sm text-muted-foreground font-heading mb-5">
          Showing data for:{" "}
          <span className="text-foreground font-semibold">
            {format(selectedDate, "EEEE, dd MMMM yyyy")}
          </span>
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Orders",
              value: isLoading ? "..." : (dayOrders?.length ?? 0),
              icon: ShoppingBag,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
            },
            {
              label: "Revenue",
              value: isLoading ? "..." : `₹${revenue.toFixed(0)}`,
              icon: DollarSign,
              color: "text-accent",
              bg: "bg-accent/10",
              border: "border-accent/20",
            },
            {
              label: "Completed",
              value: isLoading ? "..." : completedOrders,
              icon: TrendingUp,
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              label: "Month Revenue",
              value: monthOrders ? `₹${monthRevenue.toFixed(0)}` : "...",
              icon: Calendar,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border ${card.border} rounded-xl p-4 flex items-center gap-3`}
            >
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <div className="font-display font-bold text-2xl">
                  {card.value}
                </div>
                <div className="text-xs text-muted-foreground font-heading">
                  {card.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Month Chart */}
        {monthOrders && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <MonthChart orders={monthOrders} selectedDate={selectedDate} />
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm">
              All Orders — {format(selectedDate, "dd MMMM yyyy")}
            </h2>
            {dayOrders && dayOrders.length > 0 && (
              <span className="text-xs text-muted-foreground font-heading">
                {dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {["shsk1", "shsk2", "shsk3", "shsk4", "shsk5"].map((id) => (
                <Skeleton key={id} className="h-14 w-full" />
              ))}
            </div>
          ) : dayOrders && dayOrders.length > 0 ? (
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
                      "Status",
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
                  {dayOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
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
                      <td className="py-3 px-4 max-w-[180px]">
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
                        <div>
                          <Badge
                            className={`text-xs border font-heading ${
                              order.paymentStatus === PaymentStatus.paid
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {order.paymentMethod === PaymentMethod.cash
                              ? "💵 Cash"
                              : "📱 Online"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`text-xs border font-heading ${
                            order.status === OrderStatus.delivered
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : order.status === OrderStatus.ready
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : order.status === OrderStatus.preparing
                                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {order.status}
                        </Badge>
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
                <tfoot>
                  <tr className="bg-muted/30 border-t border-border">
                    <td
                      colSpan={6}
                      className="py-3 px-4 font-heading font-semibold text-sm text-right"
                    >
                      Delivered Revenue:
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-heading font-bold gold-gradient-text text-base">
                        ₹{revenue.toFixed(0)}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-heading font-semibold text-lg mb-1">
                No orders found
              </p>
              <p className="text-muted-foreground text-sm">
                No orders for {format(selectedDate, "dd MMMM yyyy")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
