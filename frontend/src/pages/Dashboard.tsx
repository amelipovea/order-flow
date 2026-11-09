import {
  ArrowUpRight,
  ArrowUpRight as OpenArrow,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Tags,
  TrendingUp
} from "lucide-react";
import type { Order, PageKey, Promotion } from "../types";
import { weeklyOrders } from "../data/mockData";
import StatusBadge from "../components/StatusBadge";

interface DashboardProps {
  orders: Order[];
  promotions: Promotion[];
  onNavigate: (page: PageKey) => void;
}

const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(value);

export default function Dashboard({ orders, promotions, onNavigate }: DashboardProps) {
  const pending = orders.filter((order) => order.status === "Pendiente").length;
  const completed = orders.filter((order) => order.status === "Completado").length;
  const revenue = orders.filter((order) => order.status !== "Cancelado").reduce((sum, order) => sum + order.total, 0);
  const activePromotions = promotions.filter((promotion) => promotion.active).length;

  const stats = [
    { label: "Pedidos registrados", value: orders.length.toLocaleString("es-EC"), note: "En el entorno de demostración", icon: ShoppingBag, tone: "blue", trend: "+12.8%" },
    { label: "Pedidos pendientes", value: pending.toString(), note: "Requieren seguimiento", icon: Clock3, tone: "amber", trend: "Por atender" },
    { label: "Pedidos completados", value: completed.toString(), note: "Finalizados correctamente", icon: PackageCheck, tone: "green", trend: "+8.4%" },
    { label: "Promociones activas", value: activePromotions.toString().padStart(2, "0"), note: "Reglas habilitadas", icon: Tags, tone: "violet", trend: "En funcionamiento" }
  ];

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div><div className="eyebrow">VISTA GENERAL</div><h2>Resumen de operaciones</h2><p>Revisa la actividad y el estado general de OrderFlow.</p></div>
        <button className="button button-primary" onClick={() => onNavigate("orders")}><ShoppingBag size={17} /> Nuevo pedido</button>
      </div>

      <div className="demo-banner"><span className="banner-indicator" /><div><strong>Modo demostración</strong><span>Los indicadores y registros se guardan localmente en este navegador; aún no provienen del backend OSGi.</span></div></div>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return <article className="stat-card" key={stat.label}>
            <div className="stat-card-top"><div className={`stat-icon ${stat.tone}`}><Icon size={20} /></div><span className={`stat-trend ${stat.tone === "amber" || stat.tone === "violet" ? "trend-neutral" : ""}`}>{stat.tone === "amber" || stat.tone === "violet" ? null : <ArrowUpRight size={14} />}{stat.trend}</span></div>
            <p>{stat.label}</p><strong className="stat-value">{stat.value}</strong><span className="stat-note">{stat.note}</span>
          </article>;
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><h3>Actividad de pedidos</h3><p>Volumen de pedidos durante los últimos siete días</p></div><span className="subtle-pill">Últimos 7 días</span></div>
          <div className="chart-legend"><div><strong>348</strong><span>Pedidos registrados</span></div><span className="legend-growth"><TrendingUp size={15} /> Tendencia semanal</span></div>
          <div className="bar-chart">
            <div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
            <div className="chart-plot">
              <div className="chart-lines"><i /><i /><i /><i /><i /></div>
              <div className="chart-bars">{weeklyOrders.map((point) => <div className="chart-bar-column" key={point.day}><div className="chart-bar-track"><div className="chart-bar" style={{ height: `${point.value}%` }} /></div><span>{point.day}</span></div>)}</div>
            </div>
          </div>
        </article>

        <article className="panel distribution-panel">
          <div className="panel-heading"><div><h3>Estado de pedidos</h3><p>Distribución actual</p></div></div>
          <div className="distribution-total"><strong>{orders.length}</strong><span>Pedidos en total</span></div>
          {[
            { label: "Completados", count: completed, color: "green" },
            { label: "Pendientes", count: pending, color: "amber" },
            { label: "Procesando", count: orders.filter((o) => o.status === "Procesando").length, color: "blue" },
            { label: "Cancelados", count: orders.filter((o) => o.status === "Cancelado").length, color: "red" }
          ].map((item) => <div className="distribution-row" key={item.label}><div className="distribution-label"><span><i className={`legend-dot ${item.color}`} />{item.label}</span><strong>{item.count}</strong></div><div className="progress-track"><div className={`progress-value ${item.color}`} style={{ width: `${orders.length ? (item.count / orders.length) * 100 : 0}%` }} /></div></div>)}
          <button className="text-link full-link" onClick={() => onNavigate("orders")}>Ver todos los pedidos <OpenArrow size={15} /></button>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading"><div><h3>Pedidos recientes</h3><p>Últimos registros del sistema</p></div><button className="text-link" onClick={() => onNavigate("orders")}>Ver todos <OpenArrow size={15} /></button></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>IDENTIFICADOR</th><th>CLIENTE</th><th>FECHA</th><th>IMPORTE</th><th>ESTADO</th></tr></thead><tbody>
          {orders.slice(0, 5).map((order) => <tr key={order.id}><td className="table-id">{order.id}</td><td><strong className="customer-name">{order.customer}</strong><span className="customer-email">{order.email}</span></td><td>{order.date}</td><td className="amount-cell">{money(order.total)}</td><td><StatusBadge status={order.status} /></td></tr>)}
        </tbody></table></div>
        <div className="panel-footnote"><span>Ingresos de pedidos no cancelados</span><strong>{money(revenue)}</strong></div>
      </section>
      <div className="page-footnote">OrderFlow · Sistema modular de gestión de pedidos y promociones</div>
    </div>
  );
}