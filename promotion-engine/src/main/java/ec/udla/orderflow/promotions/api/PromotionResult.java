package ec.udla.orderflow.promotions.api;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Resultado de la evaluacion de una promocion.
 */
public record PromotionResult(
        String orderId,
        BigDecimal originalTotal,
        BigDecimal discountAmount,
        BigDecimal finalTotal,
        String promotionCode,
        boolean applied
) {

    public PromotionResult {

        orderId = Objects.requireNonNull(orderId).trim();
        originalTotal = Objects.requireNonNull(originalTotal);
        discountAmount = Objects.requireNonNull(discountAmount);
        finalTotal = Objects.requireNonNull(finalTotal);
        promotionCode = Objects.requireNonNull(promotionCode).trim();

        if (orderId.isBlank() || promotionCode.isBlank()) {
            throw new IllegalArgumentException(
                    "El pedido y el codigo de promocion son obligatorios."
            );
        }

        if (originalTotal.signum() < 0
                || discountAmount.signum() < 0
                || finalTotal.signum() < 0) {
            throw new IllegalArgumentException(
                    "Los importes no pueden ser negativos."
            );
        }

        if (discountAmount.compareTo(originalTotal) > 0) {
            throw new IllegalArgumentException(
                    "El descuento no puede superar el total original."
            );
        }

        if (originalTotal.subtract(discountAmount)
                .compareTo(finalTotal) != 0) {
            throw new IllegalArgumentException(
                    "El total final no coincide con el descuento."
            );
        }

        if (applied != (discountAmount.signum() > 0)) {
            throw new IllegalArgumentException(
                    "El estado de la promocion no coincide con el descuento."
            );
        }
    }
}