import type { NewOrderInput, Order, OrderStatus } from "../types";

type ApiOrderStatus =
  | "CREATED"
  | "PROCESSING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

interface ApiOrder {
  id: string;
  customerId: string;
  email: string;
  items: number;
  total: number;
  status: ApiOrderStatus;
  createdAt: string;
}

export interface ApiBundle {
  id: number;
  symbolicName: string;
  name: string;
  version: string;
  state: string;
  stateCode: number;
}

export interface PromotionEvaluation {
  orderId: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  promotionCode: string;
  applied: boolean;
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8181/api"
).replace(/\/+$/, "");

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers
  });

  const raw = await response.text();
  let payload: unknown = null;

  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;
    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
    ) {
      message = payload.message;
    }
    throw new Error(message);
  }

  return payload as T;
}

function mapStatus(status: ApiOrderStatus): OrderStatus {
  switch (status) {
    case "PROCESSING":
      return "Procesando";
    case "CONFIRMED":
    case "COMPLETED":
      return "Completado";
    case "CANCELLED":
      return "Cancelado";
    case "CREATED":
    default:
      return "Pendiente";
  }
}

function toApiStatus(status: OrderStatus): ApiOrderStatus {
  switch (status) {
    case "Procesando":
      return "PROCESSING";
    case "Completado":
      return "COMPLETED";
    case "Cancelado":
      return "CANCELLED";
    case "Pendiente":
    default:
      return "CREATED";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function mapOrder(order: ApiOrder): Order {
  return {
    id: order.id,
    customer: order.customerId,
    email: order.email ?? "",
    date: formatDate(order.createdAt),
    total: Number(order.total),
    status: mapStatus(order.status),
    items: Number(order.items)
  };
}

export async function getOrders(): Promise<Order[]> {
  const orders = await request<ApiOrder[]>("/orders");
  return orders.map(mapOrder);
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const created = await request<ApiOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      customerId: input.customer,
      email: input.email,
      items: input.items,
      total: input.total
    })
  });

  return mapOrder(created);
}

export async function updateOrder(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const updated = await request<ApiOrder>(
    `/orders/${encodeURIComponent(id)}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status: toApiStatus(status) })
    }
  );

  return mapOrder(updated);
}

export function evaluatePromotion(
  orderId: string
): Promise<PromotionEvaluation> {
  return request<PromotionEvaluation>(
    `/promotions/evaluate/${encodeURIComponent(orderId)}`,
    { method: "POST" }
  );
}

export function getBundles(): Promise<ApiBundle[]> {
  return request<ApiBundle[]>("/system/bundles");
}

export function getSystemHealth(): Promise<{
  status: string;
  runtime: string;
  bundleCount: number;
}> {
  return request("/system/health");
}
