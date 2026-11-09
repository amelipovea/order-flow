import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Promotions from "./pages/Promotions";
import Monitoring from "./pages/Monitoring";
import Settings from "./pages/Settings";
import type { NewOrderInput, NewPromotionInput, Order, OrderStatus, PageKey, Promotion } from "./types";
import { loadOrders, loadPromotions, saveOrders, savePromotions } from "./services/storage";
import { CheckCircle2, X } from "lucide-react";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Resumen general de las operaciones" },
  orders: { title: "Pedidos", subtitle: "Registro, seguimiento y administración de pedidos" },
  promotions: { title: "Promociones", subtitle: "Administración de códigos y reglas de descuento" },
  monitoring: { title: "Monitoreo", subtitle: "Estado de referencia de los componentes OSGi" },
  settings: { title: "Configuración", subtitle: "Preferencias generales de la aplicación" }
};

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [promotions, setPromotions] = useState<Promotion[]>(() => loadPromotions());
  const [toast, setToast] = useState("");

  useEffect(() => { saveOrders(orders); }, [orders]);
  useEffect(() => { savePromotions(promotions); }, [promotions]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const addOrder = (input: NewOrderInput) => {
    const order: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customer: input.customer,
      email: input.email,
      date: new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
      total: input.total,
      status: "Pendiente",
      items: input.items
    };
    setOrders(current => [order, ...current]);
    notify(`El pedido ${order.id} fue registrado.`);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(current => current.map(order => order.id === id ? { ...order, status } : order));
    notify(`El estado de ${id} se actualizó a ${status}.`);
  };

  const addPromotion = (input: NewPromotionInput) => {
    const promotion: Promotion = {
      id: `PROMO-${Date.now().toString().slice(-5)}`,
      ...input,
      uses: 0,
      active: true,
      expiresAt: new Date(`${input.expiresAt}T12:00:00`).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" })
    };
    setPromotions(current => [promotion, ...current]);
    notify(`La promoción ${promotion.code} fue creada.`);
  };

  const togglePromotion = (id: string) => {
    setPromotions(current => current.map(promotion => promotion.id === id ? { ...promotion, active: !promotion.active } : promotion));
    const promotion = promotions.find(item => item.id === id);
    if (promotion) notify(`La promoción ${promotion.code} fue ${promotion.active ? "desactivada" : "activada"}.`);
  };

  const meta = pageMeta[activePage];

  return <div className="app-shell">
    <Sidebar activePage={activePage} isOpen={sidebarOpen} onNavigate={setActivePage} onClose={() => setSidebarOpen(false)} />
    <div className="app-main">
      <Topbar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />
      <main>
        {activePage === "dashboard" && <Dashboard orders={orders} promotions={promotions} onNavigate={setActivePage} />}
        {activePage === "orders" && <Orders orders={orders} onAdd={addOrder} onUpdateStatus={updateOrderStatus} />}
        {activePage === "promotions" && <Promotions promotions={promotions} onToggle={togglePromotion} onAdd={addPromotion} onNotify={notify} />}
        {activePage === "monitoring" && <Monitoring />}
        {activePage === "settings" && <Settings onNotify={notify} />}
      </main>
    </div>
    {toast && <div className="toast-message"><CheckCircle2 size={18} /><span>{toast}</span><button onClick={() => setToast("")} aria-label="Cerrar aviso"><X size={16} /></button></div>}
  </div>;
}