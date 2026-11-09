import type { Order, Promotion } from "../types";
import { initialOrders, initialPromotions } from "../data/mockData";

const ORDERS_KEY = "orderflow.orders.v1";
const PROMOTIONS_KEY = "orderflow.promotions.v1";

function readValue<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadOrders(): Order[] {
  return readValue(ORDERS_KEY, initialOrders);
}

export function saveOrders(orders: Order[]): void {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function loadPromotions(): Promotion[] {
  return readValue(PROMOTIONS_KEY, initialPromotions);
}

export function savePromotions(promotions: Promotion[]): void {
  window.localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
}

export function resetDemoData(): void {
  window.localStorage.removeItem(ORDERS_KEY);
  window.localStorage.removeItem(PROMOTIONS_KEY);
}