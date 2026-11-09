package ec.udla.orderflow.orders.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Contrato publico para la gestion de pedidos.
 *
 * Otros bundles pueden utilizar esta interfaz
 * sin conocer su implementacion interna.
 */
public interface OrderService {

    /**
     * Crea un nuevo pedido.
     *
     * @param customerId identificador del cliente
     * @param total valor total del pedido
     * @return pedido creado
     */
    Order createOrder(String customerId, BigDecimal total);

    /**
     * Busca un pedido por su identificador.
     *
     * @param orderId identificador del pedido
     * @return pedido encontrado o vacio
     */
    Optional<Order> findById(String orderId);

    /**
     * Devuelve todos los pedidos registrados.
     *
     * @return lista de pedidos
     */
    List<Order> findAll();

}