package ec.udla.orderflow.promotions.rules;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Regla comercial que aplica un descuento porcentual.
 *
 * Condicion:
 * El pedido debe ser igual o superior a 100.
 *
 * Beneficio:
 * 10 por ciento de descuento.
 */
public class PercentageDiscountRule {

    private static final BigDecimal MINIMUM_TOTAL =
            new BigDecimal("100.00");

    private static final BigDecimal DISCOUNT_RATE =
            new BigDecimal("0.10");

    private static final String PROMOTION_CODE =
            "TEN_PERCENT_OVER_100";

    public BigDecimal calculateDiscount(BigDecimal total) {

        Objects.requireNonNull(total, "El total es obligatorio.");

        if (total.signum() < 0) {
            throw new IllegalArgumentException(
                    "El total no puede ser negativo."
            );
        }

        if (total.compareTo(MINIMUM_TOTAL) < 0) {
            return new BigDecimal("0.00");
        }

        return total.multiply(DISCOUNT_RATE)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public String getPromotionCode() {
        return PROMOTION_CODE;
    }
}