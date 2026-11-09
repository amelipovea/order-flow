package ec.udla.orderflow.rest.internal;

import ec.udla.orderflow.promotions.api.PromotionResult;
import ec.udla.orderflow.promotions.api.PromotionService;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.NoSuchElementException;

/**
 * Expone el motor de promociones existente mediante HTTP.
 *
 * POST /api/promotions/evaluate/{orderId}
 */
@Component(
        service = Servlet.class,
        property = {
                "osgi.http.whiteboard.servlet.pattern=/api/promotions/*",
                "osgi.http.whiteboard.servlet.name=orderflow-promotions"
        }
)
public class PromotionsServlet extends BaseApiServlet {

    private volatile PromotionService promotionService;

    @Reference(
            service = PromotionService.class,
            cardinality = ReferenceCardinality.OPTIONAL,
            policy = ReferencePolicy.DYNAMIC
    )
    void bindPromotionService(PromotionService service) {
        this.promotionService = service;
    }

    void unbindPromotionService(PromotionService service) {
        if (this.promotionService == service) {
            this.promotionService = null;
        }
    }

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        String[] path = pathSegments(request);

        if (path.length != 2 || !"evaluate".equals(path[0])) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    "Use POST /api/promotions/evaluate/{orderId}."
            );
            return;
        }

        PromotionService service = promotionService;

        if (service == null) {
            writeError(
                    response,
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Promotion Engine no está disponible en este momento."
            );
            return;
        }

        try {
            PromotionResult result = service.evaluateOrder(path[1]);

            writeJson(
                    response,
                    HttpServletResponse.SC_OK,
                    result
            );
        } catch (NoSuchElementException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    exception.getMessage()
            );
        } catch (IllegalStateException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    exception.getMessage()
            );
        } catch (IllegalArgumentException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    exception.getMessage()
            );
        }
    }
}
