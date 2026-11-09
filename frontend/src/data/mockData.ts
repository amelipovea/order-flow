import type { Order, Promotion } from "../types";

export const initialOrders: Order[] = [
  { id: "ORD-1024", customer: "María González", email: "maria.g@email.com", date: "09 nov 2026, 10:42", total: 245, status: "Completado", items: 3 },
  { id: "ORD-1023", customer: "Carlos Mendoza", email: "carlos.m@email.com", date: "09 nov 2026, 09:18", total: 180.5, status: "Pendiente", items: 2 },
  { id: "ORD-1022", customer: "Ana Rodríguez", email: "ana.r@email.com", date: "08 nov 2026, 16:35", total: 320, status: "Procesando", items: 4 },
  { id: "ORD-1021", customer: "Luis Pérez", email: "luis.p@email.com", date: "08 nov 2026, 14:12", total: 95, status: "Completado", items: 1 },
  { id: "ORD-1020", customer: "Sofía Torres", email: "sofia.t@email.com", date: "07 nov 2026, 11:06", total: 410, status: "Pendiente", items: 5 },
  { id: "ORD-1019", customer: "Jorge Castro", email: "jorge.c@email.com", date: "07 nov 2026, 09:50", total: 135.75, status: "Cancelado", items: 2 },
  { id: "ORD-1018", customer: "Valentina Ruiz", email: "valentina.r@email.com", date: "06 nov 2026, 17:22", total: 560, status: "Completado", items: 6 },
  { id: "ORD-1017", customer: "Andrés López", email: "andres.l@email.com", date: "06 nov 2026, 13:08", total: 72.5, status: "Procesando", items: 1 }
];

export const initialPromotions: Promotion[] = [
  { id: "PROMO-01", name: "Bienvenida OrderFlow", code: "WELCOME10", description: "Descuento para nuevos clientes.", discount: 10, uses: 128, active: true, expiresAt: "30 nov 2026" },
  { id: "PROMO-02", name: "Semana especial", code: "SEMANA15", description: "Promoción especial de temporada.", discount: 15, uses: 76, active: true, expiresAt: "20 nov 2026" },
  { id: "PROMO-03", name: "Clientes frecuentes", code: "CLIENTE20", description: "Beneficio para clientes recurrentes.", discount: 20, uses: 42, active: false, expiresAt: "15 dic 2026" },
  { id: "PROMO-04", name: "Envío de temporada", code: "ENVIO5", description: "Descuento asociado a pedidos seleccionados.", discount: 5, uses: 214, active: true, expiresAt: "10 dic 2026" }
];

export const weeklyOrders = [
  { day: "Lun", value: 42 },
  { day: "Mar", value: 65 },
  { day: "Mié", value: 52 },
  { day: "Jue", value: 82 },
  { day: "Vie", value: 61 },
  { day: "Sáb", value: 95 },
  { day: "Dom", value: 72 }
];