package ec.udla.orderflow.orders.api;

/**
 * Estados posibles de un pedido.
 */
public enum OrderStatus {
    CREATED,
    PROCESSING,
    CONFIRMED,
    COMPLETED,
    CANCELLED
}
