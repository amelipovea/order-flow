package ec.udla.orderflow.orders.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Representa un pedido dentro de OrderFlow.
 *
 * Es un objeto inmutable que contiene
 * la informacion principal del pedido.
 */
public record Order(
        String id,
        String customerId,
        BigDecimal total,
        OrderStatus status,
        Instant createdAt
) {

    public Order {

        id = Objects.requireNonNull(id, "id").trim();
        customerId = Objects.requireNonNull(customerId, "customerId").trim();

        total = Objects.requireNonNull(total, "total");
        status = Objects.requireNonNull(status, "status");
        createdAt = Objects.requireNonNull(createdAt, "createdAt");

        if (id.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del pedido no puede estar vacio."
            );
        }

        if (customerId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del cliente no puede estar vacio."
            );
        }

        if (total.signum() < 0) {
            throw new IllegalArgumentException(
                    "El total del pedido no puede ser negativo."
            );
        }
    }
}