import type { OrderStatus } from "../types";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const className = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return <span className={`status-badge status-${className}`}><i />{status}</span>;
}