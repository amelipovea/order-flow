import {
  Activity,
  CircleHelp,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  X
} from "lucide-react";
import type { PageKey } from "../types";

interface SidebarProps {
  activePage: PageKey;
  isOpen: boolean;
  onNavigate: (page: PageKey) => void;
  onClose: () => void;
}

const navigation = [
  { section: "PRINCIPAL", items: [
    { id: "dashboard" as PageKey, label: "Dashboard", icon: LayoutDashboard },
    { id: "orders" as PageKey, label: "Pedidos", icon: ShoppingCart },
    { id: "promotions" as PageKey, label: "Promociones", icon: Tags }
  ]},
  { section: "SISTEMA", items: [
    { id: "monitoring" as PageKey, label: "Monitoreo", icon: Activity },
    { id: "settings" as PageKey, label: "Configuración", icon: Settings }
  ]}
];

export default function Sidebar({ activePage, isOpen, onNavigate, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark"><Package size={23} strokeWidth={2.3} /></div>
          <div className="brand-copy">
            <strong>OrderFlow</strong>
            <span>ORDER MANAGEMENT</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú"><X size={19} /></button>
        </div>

        <div className="sidebar-nav-wrap">
          {navigation.map((group) => (
            <div className="nav-group" key={group.section}>
              <p className="nav-caption">{group.section}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${activePage === item.id ? "nav-item-active" : ""}`}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                    {activePage === item.id && <span className="nav-active-mark" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={18} /></div>
            <div><strong>¿Necesitas ayuda?</strong><span>Consulta la documentación</span></div>
          </div>
          <div className="sidebar-version"><span className="online-dot" /> Sistema local · v1.0.0</div>
        </div>
      </aside>
    </>
  );
}