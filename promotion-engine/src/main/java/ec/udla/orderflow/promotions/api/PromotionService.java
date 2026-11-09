package ec.udla.orderflow.promotions.api;

/**
 * Contrato publico del motor de promociones.
 */
public interface PromotionService {

    /**
     * Evalua las promociones disponibles para un pedido.
     *
     * @param orderId identificador del pedido
     * @return resultado de la evaluacion
     */
    PromotionResult evaluateOrder(String orderId);

}