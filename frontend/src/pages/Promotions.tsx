import { useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CircleAlert,
  Copy,
  Plus,
  Power,
  Tag,
  TicketPercent
} from "lucide-react";
import type { NewPromotionInput, Promotion } from "../types";
import Modal from "../components/Modal";

interface PromotionsProps {
  promotions: Promotion[];
  onToggle: (id: string) => void;
  onAdd: (input: NewPromotionInput) => void;
  onNotify: (message: string) => void;
}

export default function Promotions({
  promotions,
  onToggle,
  onAdd,
  onNotify
}: PromotionsProps) {
  const [filter, setFilter] = useState("Todas");
  const [showCreate, setShowCreate] = useState(false);

  const visible = useMemo(
    () =>
      promotions.filter((promotion) =>
        filter === "Todas"
          ? true
          : filter === "Activas"
            ? promotion.active
            : !promotion.active
      ),
    [promotions, filter]
  );

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

    if (
      !input.name ||
      !input.code ||
      input.discount < 1 ||
      input.discount > 90
    ) {
      return;
    }

    onAdd(input);
    setShowCreate(false);
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      onNotify(`Código ${code} copiado.`);
    } catch {
      onNotify(`Código de promoción: ${code}`);
    }
  };

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">COMERCIAL</div>
          <h2>Promociones y descuentos</h2>
          <p>
            Consulta la regla automática que ejecuta Promotion Engine al
            registrar un pedido.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={17} /> Nueva promoción local
        </button>
      </div>

      <div className="demo-banner warning-banner">
        <CircleAlert size={18} />
        <div>
          <strong>Regla activa del motor Java</strong>
          <span>
            El motor OSGi aplica un 10% de descuento cuando el total del pedido
            es igual o superior a USD 100. La evaluación se ejecuta
            automáticamente después de registrar un pedido. Las tarjetas de
            códigos que aparecen abajo son datos locales de demostración y no
            modifican la regla del backend.
          </span>
        </div>
      </div>

      <div className="orders-summary-row promo-summary">
        <div className="mini-summary">
          <span>Promociones de demostración</span>
          <strong>{promotions.length}</strong>
        </div>
        <div className="mini-summary">
          <span>Activas en catálogo local</span>
          <strong>{promotions.filter((promotion) => promotion.active).length}</strong>
        </div>
        <div className="mini-summary">
          <span>Desactivadas</span>
          <strong>{promotions.filter((promotion) => !promotion.active).length}</strong>
        </div>
        <div className="mini-summary">
          <span>Usos de demostración</span>
          <strong>
            {promotions.reduce((sum, promotion) => sum + promotion.uses, 0)}
          </strong>
        </div>
      </div>

      <div className="section-toolbar">
        <div>
          <h3>Catálogo visual de promociones</h3>
          <p>
            Estos códigos son parte de la interfaz de demostración; el descuento
            real lo calcula el motor OSGi.
          </p>
        </div>
        <div className="segmented-filter">
          {["Todas", "Activas", "Inactivas"].map((value) => (
            <button
              key={value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="promotion-grid">
        {visible.map((promotion) => (
          <article
            className={`promotion-card ${
              !promotion.active ? "promotion-disabled" : ""
            }`}
            key={promotion.id}
          >
            <div className="promo-card-top">
              <div className="promo-icon">
                <TicketPercent size={21} />
              </div>
              <span
                className={`promo-state ${
                  promotion.active ? "is-active" : "is-inactive"
                }`}
              >
                <i />
                {promotion.active ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div className="promo-discount">
              {promotion.discount}% <span>DE DEMOSTRACIÓN</span>
            </div>
            <h3>{promotion.name}</h3>
            <p>{promotion.description}</p>

            <div className="promo-code-row">
              <div>
                <span>CÓDIGO PROMOCIONAL LOCAL</span>
                <strong>{promotion.code}</strong>
              </div>
              <button
                className="icon-button"
                onClick={() => void copyCode(promotion.code)}
                title="Copiar código"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="promo-meta">
              <span>
                <Tag size={14} /> {promotion.uses} usos
              </span>
              <span>Vence: {promotion.expiresAt}</span>
            </div>

            <button
              className={`promo-toggle ${
                promotion.active ? "toggle-on" : ""
              }`}
              onClick={() => onToggle(promotion.id)}
            >
              <Power size={15} />
              {promotion.active
                ? "Desactivar en catálogo local"
                : "Activar en catálogo local"}
            </button>
          </article>
        ))}

        {visible.length === 0 && (
          <div className="empty-state">
            <Tag size={25} />
            <strong>No hay promociones en esta categoría</strong>
            <span>Cambia el filtro o crea una nueva promoción.</span>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal
          title="Crear promoción local"
          description="Este registro es visual y no cambia la regla del motor Java."
          onClose={() => setShowCreate(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            <label>
              Nombre
              <input
                name="name"
                placeholder="Ej. Descuento de temporada"
                required
              />
            </label>
            <label>
              Código
              <input name="code" placeholder="TEMPORADA15" required />
            </label>
            <label>
              Descripción
              <input
                name="description"
                placeholder="Describe brevemente el beneficio"
                required
              />
            </label>
            <div className="form-two-columns">
              <label>
                Descuento (%)
                <input
                  name="discount"
                  type="number"
                  min="1"
                  max="90"
                  defaultValue="10"
                  required
                />
              </label>
              <label>
                Fecha de vencimiento
                <input name="expiresAt" type="date" required />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="button button-primary">
                <Check size={16} /> Guardar en catálogo local
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
