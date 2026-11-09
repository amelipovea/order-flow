import { Activity, CheckCircle2, CircleAlert, Clock3, Layers3, Server, Workflow } from "lucide-react";

const services = [
  { name: "Order Service", bundle: "order-service", version: "1.0.0", state: "ACTIVE", description: "Publica el contrato OrderService para registrar y consultar pedidos.", icon: Server, detail: "Servicio publicado: ec.udla.orderflow.orders.api.OrderService" },
  { name: "Promotion Engine", bundle: "promotion-engine", version: "1.0.0", state: "ACTIVE", description: "Consume OrderService y publica PromotionService.", icon: Workflow, detail: "Referencia OrderService: enlazada en la última prueba" }
];

export default function Monitoring() {
  return <div className="page-content">
    <div className="welcome-row"><div><div className="eyebrow">ARQUITECTURA OSGi</div><h2>Monitoreo del sistema</h2><p>Vista de los módulos y sus relaciones dentro de Apache Karaf.</p></div><span className="connection-pill"><span className="online-dot" /> Vista de demostración</span></div>
    <div className="demo-banner warning-banner"><CircleAlert size={18} /><div><strong>Estado no consultado en tiempo real</strong><span>Esta pantalla representa la configuración comprobada en Karaf. Todavía no existe un endpoint REST que permita al navegador consultar el estado en vivo.</span></div></div>
    <div className="monitor-overview">
      <div className="monitor-stat"><div className="monitor-stat-icon green"><CheckCircle2 size={20} /></div><div><span>Bundles de la aplicación</span><strong>2 activos (referencia)</strong></div></div>
      <div className="monitor-stat"><div className="monitor-stat-icon blue"><Layers3 size={20} /></div><div><span>Servicios publicados</span><strong>2 servicios OSGi</strong></div></div>
      <div className="monitor-stat"><div className="monitor-stat-icon amber"><Clock3 size={20} /></div><div><span>Última verificación</span><strong>Prueba manual en Karaf</strong></div></div>
    </div>
    <div className="section-toolbar"><div><h3>Bundles desplegados</h3><p>Componentes construidos y desplegados en Apache Karaf 4.4.12.</p></div><span className="subtle-pill">Java 17 · OSGi Declarative Services</span></div>
    <div className="service-grid">{services.map(service => { const Icon = service.icon; return <article className="service-card" key={service.bundle}><div className="service-card-heading"><div className="service-icon"><Icon size={21} /></div><span className="service-state"><i />{service.state}</span></div><h3>{service.name}</h3><p className="bundle-name">{service.bundle}</p><p className="service-description">{service.description}</p><div className="service-detail"><span>Versión</span><strong>{service.version}</strong></div><div className="service-detail"><span>Estado de referencia</span><strong className="text-green">Activo</strong></div><div className="service-contract"><span>Contrato / relación</span><p>{service.detail}</p></div></article>; })}</div>
    <section className="panel architecture-panel"><div className="panel-heading"><div><h3>Relación entre los servicios</h3><p>Comunicación desacoplada mediante contratos OSGi.</p></div><span className="subtle-pill">Declarative Services</span></div><div className="architecture-flow"><div className="architecture-node"><span className="architecture-node-icon"><Server size={22} /></span><strong>Order Service</strong><small>Publica OrderService</small><em>order-service</em></div><div className="architecture-connector"><span>Referencia OSGi</span><i /></div><div className="architecture-node"><span className="architecture-node-icon purple"><Workflow size={22} /></span><strong>Promotion Engine</strong><small>Consume OrderService</small><em>promotion-engine</em></div></div><div className="architecture-note"><Activity size={17} /><span>La referencia es dinámica y opcional (0..1). Al detener Order Service, Promotion Engine puede permanecer activo sin esa vinculación, tal como se comprobó en la consola de Karaf.</span></div></section>
  </div>;
}