package ec.udla.orderflow.orders.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Representa un pedido dentro de OrderFlow.
 *
 * El registro conserva los datos que necesita el frontend:
 * cliente, correo, cantidad de artículos, total, estado y fecha.
 */
public record Order(
        String id,
        String customerId,
        String email,
        int items,
        BigDecimal total,
        OrderStatus status,
        Instant createdAt
) {

    /**
     * Constructor de compatibilidad con la versión inicial del servicio.
     */
    public Order(
            String id,
            String customerId,
            BigDecimal total,
            OrderStatus status,
            Instant createdAt
    ) {
        this(id, customerId, "", 1, total, status, createdAt);
    }

    public Order {
        id = Objects.requireNonNull(id, "id").trim();
        customerId = Objects.requireNonNull(customerId, "customerId").trim();
        email = email == null ? "" : email.trim();
        total = Objects.requireNonNull(total, "total");
        status = Objects.requireNonNull(status, "status");
        createdAt = Objects.requireNonNull(createdAt, "createdAt");

        if (id.isBlank()) {
            throw new IllegalArgumentException("El identificador del pedido no puede estar vacío.");
        }

        if (customerId.isBlank()) {
            throw new IllegalArgumentException("El identificador del cliente no puede estar vacío.");
        }

        if (items < 1) {
            throw new IllegalArgumentException("El pedido debe contener al menos un artículo.");
        }

        if (total.signum() < 0) {
            throw new IllegalArgumentException("El total del pedido no puede ser negativo.");
        }
    }
}
