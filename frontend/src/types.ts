export type PageKey = "dashboard" | "orders" | "promotions" | "monitoring" | "settings";

export type OrderStatus = "Pendiente" | "Procesando" | "Completado" | "Cancelado";

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string;
  discount: number;
  uses: number;
  active: boolean;
  expiresAt: string;
}

export interface NewOrderInput {
  customer: string;
  email: string;
  total: number;
  items: number;
}

export interface NewPromotionInput {
  name: string;
  code: string;
  description: string;
  discount: number;
  expiresAt: string;
}