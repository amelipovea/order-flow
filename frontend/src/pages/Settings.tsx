import { useState, type FormEvent } from "react";
import { Bell, LockKeyhole, Save, UserRound } from "lucide-react";

interface SettingsProps { onNotify: (message: string) => void; }

export default function Settings({ onNotify }: SettingsProps) {
  const [name, setName] = useState("Administrador");
  const [email, setEmail] = useState("admin@orderflow.local");
  const [notifications, setNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [promotionAlerts, setPromotionAlerts] = useState(false);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNotify("Preferencias guardadas en esta sesión de demostración.");
  };

  return <div className="page-content">
    <div className="welcome-row"><div><div className="eyebrow">PREFERENCIAS</div><h2>Configuración</h2><p>Administra la información del perfil y las preferencias de OrderFlow.</p></div></div>
    <form onSubmit={save} className="settings-layout">
      <section className="panel settings-panel"><div className="settings-section-heading"><div className="settings-icon"><UserRound size={19} /></div><div><h3>Información del perfil</h3><p>Datos de la cuenta que utiliza el panel.</p></div></div>
        <div className="settings-fields"><label>Nombre visible<input value={name} onChange={e => setName(e.target.value)} required /></label><label>Correo electrónico<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Rol del usuario<input value="Administrador del sistema" disabled /></label></div>
      </section>
      <section className="panel settings-panel"><div className="settings-section-heading"><div className="settings-icon"><Bell size={19} /></div><div><h3>Notificaciones</h3><p>Selecciona qué avisos deseas visualizar.</p></div></div>
        <div className="preference-row"><div><strong>Notificaciones generales</strong><span>Mostrar avisos dentro del panel.</span></div><button type="button" role="switch" aria-checked={notifications} className={`switch ${notifications ? "switch-on" : ""}`} onClick={() => setNotifications(!notifications)}><i /></button></div>
        <div className="preference-row"><div><strong>Alertas de pedidos</strong><span>Avisos cuando se registre o cambie un pedido.</span></div><button type="button" role="switch" aria-checked={orderAlerts} className={`switch ${orderAlerts ? "switch-on" : ""}`} onClick={() => setOrderAlerts(!orderAlerts)}><i /></button></div>
        <div className="preference-row"><div><strong>Alertas de promociones</strong><span>Avisos sobre cambios en las promociones.</span></div><button type="button" role="switch" aria-checked={promotionAlerts} className={`switch ${promotionAlerts ? "switch-on" : ""}`} onClick={() => setPromotionAlerts(!promotionAlerts)}><i /></button></div>
      </section>
      <section className="panel settings-panel security-panel"><div className="settings-section-heading"><div className="settings-icon"><LockKeyhole size={19} /></div><div><h3>Información del entorno</h3><p>Datos técnicos de esta versión del frontend.</p></div></div><div className="environment-list"><div><span>Aplicación</span><strong>OrderFlow</strong></div><div><span>Versión de interfaz</span><strong>1.0.0</strong></div><div><span>Modo</span><strong>Demostración local</strong></div><div><span>Backend REST</span><strong className="text-amber">Pendiente de integración</strong></div></div></section>
      <div className="settings-save-row"><span>Los cambios de esta pantalla son preferencias locales de demostración.</span><button type="submit" className="button button-primary"><Save size={16} /> Guardar cambios</button></div>
    </form>
  </div>;
}