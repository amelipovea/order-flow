package ec.udla.orderflow.promotions.internal;

import ec.udla.orderflow.orders.api.Order;
import ec.udla.orderflow.orders.api.OrderService;

import ec.udla.orderflow.promotions.api.PromotionResult;
import ec.udla.orderflow.promotions.api.PromotionService;
import ec.udla.orderflow.promotions.rules.PercentageDiscountRule;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.NoSuchElementException;

/**
 * Componente principal del motor de promociones.
 *
 * Consume OrderService mediante el registro de servicios OSGi.
 */
@Component(
        service = PromotionService.class,
        immediate = true
)
public class PromotionEngineComponent implements PromotionService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(PromotionEngineComponent.class);

    private final PercentageDiscountRule discountRule =
            new PercentageDiscountRule();

    /**
     * Referencia dinamica al servicio de pedidos.
     */
    private volatile OrderService orderService;

    /**
     * Se ejecuta cuando OSGi activa el componente.
     */
    @Activate
    void activate() {

        LOGGER.info("Promotion Engine ha sido iniciado.");

    }

    /**
     * Se ejecuta cuando OSGi desactiva el componente.
     */
    @Deactivate
    void deactivate() {

        LOGGER.info("Promotion Engine ha sido detenido.");

    }

    /**
     * OSGi invoca este metodo cuando encuentra OrderService.
     */
    @Reference(
            name = "orderService",
            service = OrderService.class,
            cardinality = ReferenceCardinality.OPTIONAL,
            policy = ReferencePolicy.DYNAMIC
    )
    void bindOrderService(OrderService service) {

        this.orderService = service;

        LOGGER.info("Order Service conectado con Promotion Engine.");

    }

    /**
     * OSGi invoca este metodo cuando OrderService deja de estar disponible.
     */
    void unbindOrderService(OrderService service) {

        if (this.orderService == service) {
            this.orderService = null;
        }

        LOGGER.warn("Order Service desconectado de Promotion Engine.");

    }

    /**
     * Evalua las promociones de un pedido.
     */
    @Override
    public PromotionResult evaluateOrder(String orderId) {

        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException(
                    "El identificador del pedido es obligatorio."
            );
        }

        OrderService currentService = this.orderService;

        if (currentService == null) {
            throw new IllegalStateException(
                    "Order Service no esta disponible actualmente."
            );
        }

        // Consultar el pedido mediante el contrato OSGi.
        Order order = currentService.findById(orderId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "No existe el pedido: " + orderId
                        )
                );

        // Evaluar la regla comercial.
        BigDecimal originalTotal = order.total();

        BigDecimal discount =
                discountRule.calculateDiscount(originalTotal);

        BigDecimal finalTotal =
                originalTotal.subtract(discount);

        boolean applied = discount.signum() > 0;

        String promotionCode = applied
                ? discountRule.getPromotionCode()
                : "NO_PROMOTION";

        PromotionResult result = new PromotionResult(
                order.id(),
                originalTotal,
                discount,
                finalTotal,
                promotionCode,
                applied
        );

        LOGGER.info(
                "Promocion evaluada: pedido={}, descuento={}, totalFinal={}",
                order.id(),
                discount,
                finalTotal
        );

        return result;
    }

}