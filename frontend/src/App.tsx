import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Promotions from "./pages/Promotions";
import Monitoring from "./pages/Monitoring";
import Settings from "./pages/Settings";
import type {
  NewOrderInput,
  NewPromotionInput,
  Order,
  OrderStatus,
  PageKey,
  Promotion
} from "./types";
import { loadPromotions, savePromotions } from "./services/storage";
import {
  createOrder,
  evaluatePromotion,
  getOrders,
  updateOrder
} from "./services/api";
import { CheckCircle2, X } from "lucide-react";

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Resumen general de las operaciones registradas en Java"
  },
  orders: {
    title: "Pedidos",
    subtitle: "Registro y seguimiento conectado con Order Service"
  },
  promotions: {
    title: "Promociones",
    subtitle: "Regla de descuento evaluada por Promotion Engine"
  },
  monitoring: {
    title: "Monitoreo",
    subtitle: "Estado en tiempo real de los bundles OSGi"
  },
  settings: {
    title: "Configuración",
    subtitle: "Preferencias generales de la aplicación"
  }
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>(() =>
    loadPromotions()
  );
  const [toast, setToast] = useState("");

  const notify = (message: string) => setToast(message);

  useEffect(() => {
    let mounted = true;

    getOrders()
      .then((backendOrders) => {
        if (mounted) {
          setOrders(backendOrders);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo conectar con el backend.";
          notify(`No se pudieron cargar los pedidos: ${message}`);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    savePromotions(promotions);
  }, [promotions]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addOrder = async (input: NewOrderInput): Promise<Order> => {
    let created: Order;

    try {
      created = await createOrder(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrar el pedido.";
      notify(`No se pudo registrar el pedido: ${message}`);
      throw error;
    }

    setOrders((current) => [created, ...current]);

    try {
      const result = await evaluatePromotion(created.id);

      if (result.applied) {
        notify(
          `Pedido ${created.id} registrado. ${result.promotionCode}: descuento ${money(
            result.discountAmount
          )}. Total con promoción: ${money(result.finalTotal)}.`
        );
      } else {
        notify(
          `Pedido ${created.id} registrado. El motor no encontró una promoción aplicable.`
        );
      }
    } catch {
      notify(
        `Pedido ${created.id} registrado, pero Promotion Engine no está disponible para evaluar el descuento.`
      );
    }

    return created;
  };

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus
  ): Promise<Order> => {
    try {
      const updated = await updateOrder(id, status);
      setOrders((current) =>
        current.map((order) => (order.id === id ? updated : order))
      );
      notify(`El estado de ${id} se actualizó en el backend a ${status}.`);
      return updated;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el pedido.";
      notify(`No se pudo actualizar ${id}: ${message}`);
      throw error;
    }
  };

  const addPromotion = (input: NewPromotionInput) => {
    const promotion: Promotion = {
      id: `PROMO-${Date.now().toString().slice(-5)}`,
      ...input,
      uses: 0,
      active: true,
      expiresAt: new Date(`${input.expiresAt}T12:00:00`).toLocaleDateString(
        "es-EC",
        { day: "2-digit", month: "short", year: "numeric" }
      )
    };

    setPromotions((current) => [promotion, ...current]);
    notify(`La promoción ${promotion.code} fue creada en el catálogo local.`);
  };

  const togglePromotion = (id: string) => {
    setPromotions((current) =>
      current.map((promotion) =>
        promotion.id === id
          ? { ...promotion, active: !promotion.active }
          : promotion
      )
    );

    const promotion = promotions.find((item) => item.id === id);

    if (promotion) {
      notify(
        `La promoción ${promotion.code} fue ${
          promotion.active ? "desactivada" : "activada"
        } en el catálogo local.`
      );
    }
  };

  const meta = pageMeta[activePage];

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onNavigate={setActivePage}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main>
          {activePage === "dashboard" && (
            <Dashboard
              orders={orders}
              promotions={promotions}
              onNavigate={setActivePage}
            />
          )}

          {activePage === "orders" && (
            <Orders
              orders={orders}
              onAdd={addOrder}
              onUpdateStatus={updateOrderStatus}
            />
          )}

          {activePage === "promotions" && (
            <Promotions
              promotions={promotions}
              onToggle={togglePromotion}
              onAdd={addPromotion}
              onNotify={notify}
            />
          )}

          {activePage === "monitoring" && <Monitoring />}

          {activePage === "settings" && <Settings onNotify={notify} />}
        </main>
      </div>

      {toast && (
        <div className="toast-message">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Cerrar aviso">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
