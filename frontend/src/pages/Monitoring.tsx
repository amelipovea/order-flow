import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Layers3,
  RefreshCw,
  Server,
  Workflow
} from "lucide-react";
import { getBundles, type ApiBundle } from "../services/api";

const applicationBundles = new Set([
  "order-service",
  "promotion-engine",
  "orderflow-rest-api"
]);

function stateLabel(state: string): string {
  switch (state) {
    case "ACTIVE":
      return "Activo";
    case "RESOLVED":
      return "Resuelto";
    case "INSTALLED":
      return "Instalado";
    case "STARTING":
      return "Iniciando";
    case "STOPPING":
      return "Deteniéndose";
    case "UNINSTALLED":
      return "Desinstalado";
    default:
      return state;
  }
}

function bundleDescription(symbolicName: string): string {
  switch (symbolicName) {
    case "order-service":
      return "Publica OrderService para crear, consultar y actualizar pedidos.";
    case "promotion-engine":
      return "Consume OrderService y calcula el descuento de los pedidos.";
    case "orderflow-rest-api":
      return "Expone los servicios OSGi mediante endpoints HTTP/REST.";
    default:
      return "Bundle registrado en el runtime OSGi de Apache Karaf.";
  }
}

function bundleIcon(symbolicName: string) {
  switch (symbolicName) {
    case "promotion-engine":
      return Workflow;
    case "orderflow-rest-api":
      return Activity;
    default:
      return Server;
  }
}

export default function Monitoring() {
  const [bundles, setBundles] = useState<ApiBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getBundles();
      setBundles(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo consultar el estado de Karaf."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const appBundles = useMemo(
    () =>
      bundles.filter((bundle) =>
        applicationBundles.has(bundle.symbolicName)
      ),
    [bundles]
  );

  const activeCount = appBundles.filter(
    (bundle) => bundle.state === "ACTIVE"
  ).length;

  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">ARQUITECTURA OSGi</div>
          <h2>Monitoreo del sistema</h2>
          <p>
            Estado consultado directamente desde el runtime de Apache Karaf.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Consultando..." : "Actualizar estado"}
        </button>
      </div>

      {error && (
        <div className="demo-banner warning-banner">
          <CircleAlert size={18} />
          <div>
            <strong>No se pudo consultar la API de monitoreo</strong>
            <span>
              {error}. Comprueba que Karaf esté iniciado, que el bundle
              orderflow-rest-api esté activo y que la dirección de la API sea
              correcta.
            </span>
          </div>
        </div>
      )}

      <div className="monitor-overview">
        <div className="monitor-stat">
          <div className="monitor-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Bundles de la aplicación</span>
            <strong>{loading ? "Consultando..." : appBundles.length}</strong>
          </div>
        </div>

        <div className="monitor-stat">
          <div className="monitor-stat-icon blue">
            <Layers3 size={20} />
          </div>
          <div>
            <span>Bundles activos</span>
            <strong>{loading ? "Consultando..." : activeCount}</strong>
          </div>
        </div>

        <div className="monitor-stat">
          <div className="monitor-stat-icon amber">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Origen del estado</span>
            <strong>Apache Karaf / OSGi</strong>
          </div>
        </div>
      </div>

      <div className="section-toolbar">
        <div>
          <h3>Bundles de OrderFlow</h3>
          <p>
            Datos obtenidos mediante BundleContext.getBundles(), no valores
            escritos manualmente en React.
          </p>
        </div>
        <span className="subtle-pill">
          Java 17 · OSGi Declarative Services
        </span>
      </div>

      <div className="service-grid">
        {appBundles.map((bundle) => {
          const Icon = bundleIcon(bundle.symbolicName);
          const active = bundle.state === "ACTIVE";

          return (
            <article className="service-card" key={bundle.id}>
              <div className="service-card-heading">
                <div className="service-icon">
                  <Icon size={21} />
                </div>
                <span
                  className={`service-state ${
                    active ? "" : "is-inactive"
                  }`}
                >
                  <i />
                  {stateLabel(bundle.state)}
                </span>
              </div>

              <h3>{bundle.name}</h3>
              <p className="bundle-name">{bundle.symbolicName}</p>
              <p className="service-description">
                {bundleDescription(bundle.symbolicName)}
              </p>

              <div className="service-detail">
                <span>ID del bundle</span>
                <strong>{bundle.id}</strong>
              </div>
              <div className="service-detail">
                <span>Versión</span>
                <strong>{bundle.version}</strong>
              </div>
              <div className="service-detail">
                <span>Estado real</span>
                <strong className={active ? "text-green" : ""}>
                  {bundle.state}
                </strong>
              </div>
            </article>
          );
        })}

        {!loading && !error && appBundles.length === 0 && (
          <div className="empty-state">
            <Server size={25} />
            <strong>No se encontraron bundles de OrderFlow</strong>
            <span>
              Verifica el despliegue de order-service, promotion-engine y
              orderflow-rest-api en Karaf.
            </span>
          </div>
        )}
      </div>

      <section className="panel architecture-panel">
        <div className="panel-heading">
          <div>
            <h3>Relación entre los servicios</h3>
            <p>Comunicación desacoplada mediante contratos OSGi.</p>
          </div>
          <span className="subtle-pill">Declarative Services</span>
        </div>

        <div className="architecture-flow">
          <div className="architecture-node">
            <span className="architecture-node-icon">
              <Server size={22} />
            </span>
            <strong>Order Service</strong>
            <small>Publica OrderService</small>
            <em>order-service</em>
          </div>

          <div className="architecture-connector">
            <span>Referencia OSGi</span>
            <i />
          </div>

          <div className="architecture-node">
            <span className="architecture-node-icon purple">
              <Workflow size={22} />
            </span>
            <strong>Promotion Engine</strong>
            <small>Consume OrderService</small>
            <em>promotion-engine</em>
          </div>
        </div>

        <div className="architecture-note">
          <Activity size={17} />
          <span>
            La referencia entre Promotion Engine y Order Service es dinámica y
            opcional (0..1). El adaptador REST mantiene sus endpoints y responde
            con HTTP 503 cuando el servicio OSGi requerido no está disponible.
          </span>
        </div>
      </section>
    </div>
  );
}
