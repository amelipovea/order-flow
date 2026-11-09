package ec.udla.orderflow.orders.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Contrato público para la gestión de pedidos.
 *
 * Otros bundles pueden utilizar esta interfaz sin conocer
 * la implementación interna del servicio.
 */
public interface OrderService {

    /**
     * Crea un pedido usando los datos básicos.
     */
    Order createOrder(String customerId, BigDecimal total);

    /**
     * Crea un pedido con los datos que envía la interfaz web.
     *
     * El método default conserva compatibilidad con implementaciones
     * anteriores; InMemoryOrderService lo sobrescribe para almacenar
     * también el correo y el número de artículos.
     */
    default Order createOrder(
            String customerId,
            String email,
            int items,
            BigDecimal total
    ) {
        return createOrder(customerId, total);
    }

    /**
     * Busca un pedido por su identificador.
     */
    Optional<Order> findById(String orderId);

    /**
     * Devuelve todos los pedidos registrados.
     */
    List<Order> findAll();

    /**
     * Actualiza el estado de un pedido.
     */
    default Order updateStatus(String orderId, OrderStatus status) {
        throw new UnsupportedOperationException(
                "Esta implementación de OrderService no permite actualizar estados."
        );
    }
}
