import { Bell, Menu } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const today = new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <button className="mobile-menu-button" onClick={onMenuClick} aria-label="Abrir menú"><Menu size={21} /></button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="topbar-date"><span className="date-dot" />{today}</div>
        <button className="icon-button notification-button" aria-label="Notificaciones" title="Notificaciones de demostración">
          <Bell size={19} />
          <span />
        </button>
        <div className="profile-chip">
          <div className="avatar">AD</div>
          <div className="profile-copy"><strong>Administrador</strong><span>Cuenta principal</span></div>
        </div>
      </div>
    </header>
  );
}