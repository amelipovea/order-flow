package ec.udla.orderflow.orders.internal;

import ec.udla.orderflow.orders.api.Order;
import ec.udla.orderflow.orders.api.OrderService;
import ec.udla.orderflow.orders.api.OrderStatus;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementación del servicio de pedidos.
 *
 * OSGi administra este componente y publica OrderService.
 * Los pedidos se mantienen en memoria mientras el bundle está activo.
 */
@Component(
        service = OrderService.class,
        immediate = true
)
public class InMemoryOrderService implements OrderService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(InMemoryOrderService.class);

    private final Map<String, Order> orders =
            new ConcurrentHashMap<>();

    @Activate
    void activate() {
        LOGGER.info("Order Service ha sido iniciado.");
    }

    @Deactivate
    void deactivate() {
        LOGGER.info("Order Service ha sido detenido.");
    }

    @Override
    public Order createOrder(String customerId, BigDecimal total) {
        return createOrder(customerId, "", 1, total);
    }

    @Override
    public Order createOrder(
            String customerId,
            String email,
            int items,
            BigDecimal total
    ) {
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del cliente es obligatorio."
            );
        }

        Objects.requireNonNull(total, "El total es obligatorio.");

        if (total.signum() < 0) {
            throw new IllegalArgumentException(
                    "El total no puede ser negativo."
            );
        }

        if (items < 1) {
            throw new IllegalArgumentException(
                    "El pedido debe contener al menos un artículo."
            );
        }

        String orderId = "ORD-" + UUID.randomUUID();

        Order order = new Order(
                orderId,
                customerId,
                email,
                items,
                total,
                OrderStatus.CREATED,
                Instant.now()
        );

        orders.put(order.id(), order);

        LOGGER.info(
                "Pedido creado: id={}, cliente={}, total={}",
                order.id(),
                order.customerId(),
                order.total()
        );

        return order;
    }

    @Override
    public Optional<Order> findById(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del pedido es obligatorio."
            );
        }

        return Optional.ofNullable(orders.get(orderId));
    }

    @Override
    public List<Order> findAll() {
        return orders.values()
                .stream()
                .sorted(
                        Comparator.comparing(Order::createdAt)
                                .thenComparing(Order::id)
                )
                .toList();
    }

    @Override
    public Order updateStatus(String orderId, OrderStatus status) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del pedido es obligatorio."
            );
        }

        Objects.requireNonNull(status, "El estado es obligatorio.");

        Order current = orders.get(orderId);

        if (current == null) {
            throw new NoSuchElementException(
                    "No existe el pedido: " + orderId
            );
        }

        Order updated = new Order(
                current.id(),
                current.customerId(),
                current.email(),
                current.items(),
                current.total(),
                status,
                current.createdAt()
        );

        orders.put(orderId, updated);

        LOGGER.info(
                "Estado actualizado: pedido={}, estado={}",
                orderId,
                status
        );

        return updated;
    }
}
