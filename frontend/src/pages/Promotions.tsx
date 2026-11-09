import { useMemo, useState, type FormEvent } from "react";
import { Check, Copy, Plus, Power, Tag, TicketPercent } from "lucide-react";
import type { NewPromotionInput, Promotion } from "../types";
import Modal from "../components/Modal";

interface PromotionsProps {
  promotions: Promotion[];
  onToggle: (id: string) => void;
  onAdd: (input: NewPromotionInput) => void;
  onNotify: (message: string) => void;
}

export default function Promotions({ promotions, onToggle, onAdd, onNotify }: PromotionsProps) {
  const [filter, setFilter] = useState("Todas");
  const [showCreate, setShowCreate] = useState(false);
  const visible = useMemo(() => promotions.filter(p => filter === "Todas" || (filter === "Activas" ? p.active : !p.active)), [promotions, filter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: NewPromotionInput = {
      name: String(data.get("name") ?? "").trim(),
      code: String(data.get("code") ?? "").trim().toUpperCase(),
      description: String(data.get("description") ?? "").trim(),
      discount: Number(data.get("discount")),
      expiresAt: String(data.get("expiresAt") ?? "")
    };
    if (!input.name || !input.code || input.discount < 1 || input.discount > 90) return;
    onAdd(input);
    setShowCreate(false);
  };

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); onNotify(`Código ${code} copiado.`); }
    catch { onNotify(`Código de promoción: ${code}`); }
  };

  return <div className="page-content">
    <div className="welcome-row"><div><div className="eyebrow">COMERCIAL</div><h2>Promociones y descuentos</h2><p>Administra los códigos y las reglas promocionales de OrderFlow.</p></div><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={17} /> Nueva promoción</button></div>
    <div className="orders-summary-row promo-summary"><div className="mini-summary"><span>Promociones totales</span><strong>{promotions.length}</strong></div><div className="mini-summary"><span>Activas</span><strong>{promotions.filter(p => p.active).length}</strong></div><div className="mini-summary"><span>Desactivadas</span><strong>{promotions.filter(p => !p.active).length}</strong></div><div className="mini-summary"><span>Usos registrados</span><strong>{promotions.reduce((sum, p) => sum + p.uses, 0)}</strong></div></div>
    <div className="section-toolbar"><div><h3>Catálogo de promociones</h3><p>Activa o desactiva cada regla según su disponibilidad.</p></div><div className="segmented-filter">{["Todas", "Activas", "Inactivas"].map(value => <button key={value} className={filter === value ? "selected" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div></div>
    <div className="promotion-grid">{visible.map(promo => <article className={`promotion-card ${!promo.active ? "promotion-disabled" : ""}`} key={promo.id}>
      <div className="promo-card-top"><div className="promo-icon"><TicketPercent size={21} /></div><span className={`promo-state ${promo.active ? "is-active" : "is-inactive"}`}><i />{promo.active ? "Activa" : "Inactiva"}</span></div>
      <div className="promo-discount">{promo.discount}% <span>DE DESCUENTO</span></div>
      <h3>{promo.name}</h3><p>{promo.description}</p>
      <div className="promo-code-row"><div><span>CÓDIGO PROMOCIONAL</span><strong>{promo.code}</strong></div><button className="icon-button" onClick={() => void copyCode(promo.code)} title="Copiar código"><Copy size={16} /></button></div>
      <div className="promo-meta"><span><Tag size={14} /> {promo.uses} usos</span><span>Vence: {promo.expiresAt}</span></div>
      <button className={`promo-toggle ${promo.active ? "toggle-on" : ""}`} onClick={() => onToggle(promo.id)}><Power size={15} /> {promo.active ? "Desactivar promoción" : "Activar promoción"}</button>
    </article>)}
    {visible.length === 0 && <div className="empty-state"><Tag size={25} /><strong>No hay promociones en esta categoría</strong><span>Cambia el filtro o crea una nueva promoción.</span></div>}</div>
    {showCreate && <Modal title="Crear promoción" description="Define el descuento y los datos del nuevo código." onClose={() => setShowCreate(false)}>
      <form className="form-stack" onSubmit={submit}>
        <label>Nombre<input name="name" placeholder="Ej. Descuento de temporada" required /></label>
        <label>Código<input name="code" placeholder="TEMPORADA15" required /></label>
        <label>Descripción<input name="description" placeholder="Describe brevemente el beneficio" required /></label>
        <div className="form-two-columns"><label>Descuento (%)<input name="discount" type="number" min="1" max="90" defaultValue="10" required /></label><label>Fecha de vencimiento<input name="expiresAt" type="date" required /></label></div>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowCreate(false)}>Cancelar</button><button type="submit" className="button button-primary"><Check size={16} /> Guardar promoción</button></div>
      </form>
    </Modal>}
  </div>;
}