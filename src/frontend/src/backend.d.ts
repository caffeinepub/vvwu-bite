import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    id: string;
    dayOfWeek: string;
    name: string;
    description: string;
    imageUrl: string;
    quantity: bigint;
    category: string;
    price: number;
}
export type Time = bigint;
export interface Rating {
    itemId: string;
    comment: string;
    timestamp: Time;
    rating: bigint;
}
export interface OrderItem {
    itemId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    orderType: OrderType;
    totalAmount: number;
    timestamp: Time;
    items: Array<OrderItem>;
    estimatedTime: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum OrderStatus {
    preparing = "preparing",
    pending = "pending",
    delivered = "delivered",
    ready = "ready"
}
export enum OrderType {
    dineIn = "dineIn",
    takeaway = "takeaway"
}
export enum PaymentMethod {
    cash = "cash",
    online = "online"
}
export enum PaymentStatus {
    pending = "pending",
    paid = "paid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(item: MenuItem): Promise<void>;
    addRating(rating: Rating): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllOrders(): Promise<Array<Order>>;
    getAverageRating(itemId: string): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuByDay(dayOfWeek: string): Promise<Array<MenuItem>>;
    getMenuItem(id: string): Promise<MenuItem | null>;
    getOrder(orderId: string): Promise<Order | null>;
    getOrdersByDate(date: Time): Promise<Array<Order>>;
    getOrdersByDateRange(startDate: Time, endDate: Time): Promise<Array<Order>>;
    getQueueOrders(): Promise<Array<Order>>;
    getRatingsForItem(itemId: string): Promise<Array<Rating>>;
    getSalesSummary(date: Time): Promise<{
        totalOrders: bigint;
        totalRevenue: number;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markOrderAsDelivered(orderId: string): Promise<void>;
    markPaymentAsPaid(orderId: string): Promise<void>;
    nextDay(): Promise<void>;
    placeOrder(items: Array<OrderItem>, orderType: OrderType, paymentMethod: PaymentMethod, customerName: string): Promise<string>;
    removeMenuItem(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEstimatedTime(orderId: string, estimatedTime: bigint): Promise<void>;
    updateMenuItem(id: string, updatedItem: MenuItem): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
}
