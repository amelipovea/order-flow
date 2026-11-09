import { useMemo, useState, type FormEvent } from "react";
import { Eye, Plus, Search, SlidersHorizontal } from "lucide-react";
import type { NewOrderInput, Order, OrderStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";

interface OrdersProps {
  orders: Order[];
  onAdd: (input: NewOrderInput) => Promise<Order>;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<Order>;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default function Orders({
  orders,
  onAdd,
  onUpdateStatus
}: OrdersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch = `${order.id} ${order.customer} ${order.email}`
          .toLowerCase()
          .includes(search.toLowerCase());

        return (
          matchesSearch &&
          (status === "Todos" || order.status === status)
        );
      }),
    [orders, search, status]
  );

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const input: NewOrderInput = {
      customer: String(data.get("customer") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      total: Number(data.get("total")),
      items: Number(data.get("items"))
    };

    if (
      !input.customer ||
      !input.email ||
      input.total <= 0 ||
      input.items < 1
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await onAdd(input);
      setShowCreate(false);
    } catch {
      // App muestra el mensaje de error mediante la notificación global.
    } finally {
      setSubmitting(false);
    }
  };

  const changeSelectedStatus = async (nextStatus: OrderStatus) => {
    if (!selected) return;

    setUpdatingStatus(true);

    try {
      const updated = await onUpdateStatus(selected.id, nextStatus);
      setSelected(updated);
    } catch {
      // App muestra el mensaje de error mediante la notificación global.
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">OPERACIONES</div>
          <h2>Gestión de pedidos</h2>
          <p>
            Registra, consulta y administra pedidos almacenados en Order
            Service.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={17} /> Crear pedido
        </button>
      </div>

      <div className="orders-summary-row">
        <div className="mini-summary">
          <span>Total de pedidos</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="mini-summary">
          <span>Pendientes</span>
          <strong>
            {orders.filter((order) => order.status === "Pendiente").length}
          </strong>
        </div>
        <div className="mini-summary">
          <span>En proceso</span>
          <strong>
            {orders.filter((order) => order.status === "Procesando").length}
          </strong>
        </div>
        <div className="mini-summary">
          <span>Completados</span>
          <strong>
            {orders.filter((order) => order.status === "Completado").length}
          </strong>
        </div>
      </div>

      <section className="panel orders-list-panel">
        <div className="list-toolbar">
          <div>
            <h3>Pedidos del backend</h3>
            <p>{filtered.length} registros encontrados</p>
          </div>

          <div className="filter-controls">
            <label className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar pedido o cliente..."
              />
            </label>

            <label className="select-field">
              <SlidersHorizontal size={16} />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option>Todos</option>
                <option>Pendiente</option>
                <option>Procesando</option>
                <option>Completado</option>
                <option>Cancelado</option>
              </select>
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table orders-full-table">
            <thead>
              <tr>
                <th>IDENTIFICADOR</th>
                <th>CLIENTE</th>
                <th>FECHA</th>
                <th>ARTÍCULOS</th>
                <th>IMPORTE</th>
                <th>ESTADO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td className="table-id">{order.id}</td>
                  <td>
                    <strong className="customer-name">
                      {order.customer}
                    </strong>
                    <span className="customer-email">{order.email}</span>
                  </td>
                  <td>{order.date}</td>
                  <td>{order.items}</td>
                  <td className="amount-cell">{money(order.total)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => setSelected(order)}
                      aria-label={`Ver ${order.id}`}
                    >
                      <Eye size={17} /> Ver
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table">
                    <Search size={22} />
                    <strong>No encontramos pedidos</strong>
                    <span>
                      Crea un pedido o cambia el término de búsqueda.
                    </span>
                    <button
                      className="text-link"
                      onClick={() => {
                        setSearch("");
                        setStatus("Todos");
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-bottom-note">
          Los pedidos se consultan en Java. El almacenamiento actual del
          servicio es en memoria y se reinicia al detener el bundle.
        </div>
      </section>

      {showCreate && (
        <Modal
          title="Crear nuevo pedido"
          description="Completa los datos. El pedido se registrará en Order Service."
          onClose={() => !submitting && setShowCreate(false)}
        >
          <form className="form-stack" onSubmit={submitOrder}>
            <label>
              Nombre del cliente
              <input
                name="customer"
                placeholder="Ej. Daniela Pérez"
                required
              />
            </label>

            <label>
              Correo electrónico
              <input
                name="email"
                type="email"
                placeholder="cliente@correo.com"
                required
              />
            </label>

            <div className="form-two-columns">
              <label>
                Importe (USD)
                <input
                  name="total"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="125.00"
                  required
                />
              </label>
              <label>
                Número de artículos
                <input
                  name="items"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue="1"
                  required
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowCreate(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={submitting}
              >
                <Plus size={16} />
                {submitting ? "Registrando..." : "Registrar pedido"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal
          title={`Pedido ${selected.id}`}
          description="Detalle del registro consultado desde Java."
          onClose={() => setSelected(null)}
        >
          <div className="detail-list">
            <div>
              <span>Cliente</span>
              <strong>{selected.customer}</strong>
            </div>
            <div>
              <span>Correo</span>
              <strong>{selected.email}</strong>
            </div>
            <div>
              <span>Fecha</span>
              <strong>{selected.date}</strong>
            </div>
            <div>
              <span>Artículos</span>
              <strong>{selected.items}</strong>
            </div>
            <div>
              <span>Importe</span>
              <strong>{money(selected.total)}</strong>
            </div>
            <div>
              <span>Estado actual</span>
              <StatusBadge status={selected.status} />
            </div>
          </div>

          <label className="status-edit-label">
            Actualizar estado en Java
            <select
              value={selected.status}
              disabled={updatingStatus}
              onChange={(event) =>
                void changeSelectedStatus(event.target.value as OrderStatus)
              }
            >
              <option>Pendiente</option>
              <option>Procesando</option>
              <option>Completado</option>
              <option>Cancelado</option>
            </select>
          </label>

          <div className="modal-actions">
            <button
              className="button button-primary"
              onClick={() => setSelected(null)}
            >
              Listo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
