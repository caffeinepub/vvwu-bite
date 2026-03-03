import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  Rating,
} from "../backend";
import { useActor } from "./useActor";

// ─── Menu Queries ────────────────────────────────────────────────────

export function useMenuByDay(day: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menu", day],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuByDay(day);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menu", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMenuItem(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem | null>({
    queryKey: ["menu-item", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getMenuItem(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: MenuItem) => {
      if (!actor) throw new Error("Not connected");
      await actor.addMenuItem(item);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu item added successfully");
    },
    onError: () => toast.error("Failed to add menu item"),
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: MenuItem }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateMenuItem(id, item);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu item updated");
    },
    onError: () => toast.error("Failed to update menu item"),
  });
}

export function useRemoveMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeMenuItem(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Menu item removed");
    },
    onError: () => toast.error("Failed to remove item"),
  });
}

// ─── Order Queries ────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      orderType,
      paymentMethod,
      customerName,
    }: {
      items: OrderItem[];
      orderType: OrderType;
      paymentMethod: PaymentMethod;
      customerName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(items, orderType, paymentMethod, customerName);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["menu"] });
      void qc.invalidateQueries({ queryKey: ["queue"] });
      void qc.invalidateQueries({ queryKey: ["orders", "all"] });
      void qc.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: () => toast.error("Failed to place order"),
  });
}

export function useOrder(orderId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order | null>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}

export function useQueueOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["queue"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQueueOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10_000,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllOrders();
      } catch (err) {
        console.error("[useAllOrders] failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useOrdersByDate(date: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "date", date.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrdersByDate(date);
      } catch (err) {
        console.error("[useOrdersByDate] failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 30_000,
  });
}

export function useOrdersByDateRange(startDate: bigint, endDate: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "range", startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrdersByDateRange(startDate, endDate);
      } catch (err) {
        console.error("[useOrdersByDateRange] failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useMarkDelivered() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.markOrderAsDelivered(orderId);
      return orderId;
    },
    onSuccess: (orderId) => {
      void qc.invalidateQueries({ queryKey: ["queue"] });
      void qc.invalidateQueries({ queryKey: ["orders", "all"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["sales"] });
      toast.success(`Order ${orderId} delivered! Queue updated.`);
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : "Failed to deliver order";
      toast.error(
        msg.includes("not found")
          ? "Order not found"
          : "Failed to deliver order",
      );
    },
  });
}

export function useMarkPaymentPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.markPaymentAsPaid(orderId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["queue"] });
      void qc.invalidateQueries({ queryKey: ["orders", "all"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Payment marked as paid");
    },
    onError: () => toast.error("Failed to update payment"),
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["queue"] });
      void qc.invalidateQueries({ queryKey: ["orders", "all"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Status updated ✓");
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(
        msg.includes("not found")
          ? "Order not found"
          : "Failed to update status",
      );
    },
  });
}

export function useUpdateEstimatedTime() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      time,
    }: { orderId: string; time: bigint }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateEstimatedTime(orderId, time);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: () => toast.error("Failed to update time"),
  });
}

export function useSalesSummary(date: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalOrders: bigint; totalRevenue: number }>({
    queryKey: ["sales", date.toString()],
    queryFn: async () => {
      if (!actor) return { totalOrders: BigInt(0), totalRevenue: 0 };
      try {
        return await actor.getSalesSummary(date);
      } catch (err) {
        console.error("[useSalesSummary] failed:", err);
        return { totalOrders: BigInt(0), totalRevenue: 0 };
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 30_000,
  });
}

// ─── Rating Queries ────────────────────────────────────────────────────

export function useRatingsForItem(itemId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Rating[]>({
    queryKey: ["ratings", itemId],
    queryFn: async () => {
      if (!actor || !itemId) return [];
      return actor.getRatingsForItem(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useAverageRating(itemId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["avg-rating", itemId],
    queryFn: async () => {
      if (!actor || !itemId) return 0;
      return actor.getAverageRating(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useAddRating() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rating: Rating) => {
      if (!actor) throw new Error("Not connected");
      await actor.addRating(rating);
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ["ratings", variables.itemId] });
      void qc.invalidateQueries({ queryKey: ["avg-rating", variables.itemId] });
      toast.success("Rating submitted! Thank you.");
    },
    onError: () => toast.error("Failed to submit rating"),
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}
