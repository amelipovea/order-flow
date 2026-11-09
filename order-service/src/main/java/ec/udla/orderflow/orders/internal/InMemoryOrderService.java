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
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementacion del servicio de pedidos.
 *
 * Esta clase es administrada por OSGi Declarative Services.
 * Publica OrderService para que otros bundles puedan utilizarlo.
 */
@Component(
        service = OrderService.class,
        immediate = true
)
public class InMemoryOrderService implements OrderService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(InMemoryOrderService.class);

    /**
     * Almacenamiento temporal de pedidos.
     */
    private final Map<String, Order> orders =
            new ConcurrentHashMap<>();

    /**
     * Se ejecuta cuando OSGi activa el componente.
     */
    @Activate
    void activate() {

        LOGGER.info("Order Service ha sido iniciado.");

    }

    /**
     * Se ejecuta cuando OSGi desactiva el componente.
     */
    @Deactivate
    void deactivate() {

        LOGGER.info("Order Service ha sido detenido.");

    }

    /**
     * Crea y registra un nuevo pedido.
     */
    @Override
    public Order createOrder(String customerId, BigDecimal total) {

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

        String orderId = "ORD-" + UUID.randomUUID();

        Order order = new Order(
                orderId,
                customerId,
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

    /**
     * Busca un pedido por su identificador.
     */
    @Override
    public Optional<Order> findById(String orderId) {

        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del pedido es obligatorio."
            );
        }

        return Optional.ofNullable(orders.get(orderId));
    }

    /**
     * Devuelve todos los pedidos registrados.
     */
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

}