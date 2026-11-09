package ec.udla.orderflow.rest.internal;

import ec.udla.orderflow.orders.api.Order;
import ec.udla.orderflow.orders.api.OrderService;
import ec.udla.orderflow.orders.api.OrderStatus;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * Endpoints REST para consultar, crear y actualizar pedidos.
 *
 * GET    /api/orders
 * GET    /api/orders/{id}
 * POST   /api/orders
 * PUT    /api/orders/{id}/status
 */
@Component(
        service = Servlet.class,
        property = {
                "osgi.http.whiteboard.servlet.pattern=/api/orders/*",
                "osgi.http.whiteboard.servlet.name=orderflow-orders"
        }
)
public class OrdersServlet extends BaseApiServlet {

    private volatile OrderService orderService;

    @Reference(
            service = OrderService.class,
            cardinality = ReferenceCardinality.OPTIONAL,
            policy = ReferencePolicy.DYNAMIC
    )
    void bindOrderService(OrderService service) {
        this.orderService = service;
    }

    void unbindOrderService(OrderService service) {
        if (this.orderService == service) {
            this.orderService = null;
        }
    }

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        OrderService service = orderService;

        if (service == null) {
            writeError(
                    response,
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Order Service no está disponible en este momento."
            );
            return;
        }

        String[] path = pathSegments(request);

        try {
            if (path.length == 0) {
                writeJson(response, HttpServletResponse.SC_OK, service.findAll());
                return;
            }

            if (path.length == 1) {
                Optional<Order> order = service.findById(path[0]);

                if (order.isEmpty()) {
                    writeError(
                            response,
                            HttpServletResponse.SC_NOT_FOUND,
                            "No existe el pedido solicitado."
                    );
                    return;
                }

                writeJson(response, HttpServletResponse.SC_OK, order.get());
                return;
            }

            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    "La ruta de pedidos solicitada no existe."
            );
        } catch (IllegalArgumentException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    exception.getMessage()
            );
        }
    }

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        OrderService service = orderService;

        if (service == null) {
            writeError(
                    response,
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Order Service no está disponible en este momento."
            );
            return;
        }

        if (pathSegments(request).length != 0) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    "La ruta de creación de pedidos no existe."
            );
            return;
        }

        try {
            CreateOrderRequest body = readJson(request, CreateOrderRequest.class);

            if (body == null
                    || body.customerId == null
                    || body.customerId.isBlank()
                    || body.total == null) {
                writeError(
                        response,
                        HttpServletResponse.SC_BAD_REQUEST,
                        "Se requieren customerId y total para crear el pedido."
                );
                return;
            }

            int items = body.items == null ? 1 : body.items;
            String email = body.email == null ? "" : body.email;

            Order created = service.createOrder(
                    body.customerId,
                    email,
                    items,
                    body.total
            );

            response.setHeader(
                    "Location",
                    request.getRequestURL().toString() + "/" + created.id()
            );

            writeJson(
                    response,
                    HttpServletResponse.SC_CREATED,
                    created
            );
        } catch (IllegalArgumentException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    exception.getMessage()
            );
        } catch (RuntimeException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    exception.getMessage() == null
                            ? "No se pudo procesar el pedido."
                            : exception.getMessage()
            );
        }
    }

    @Override
    protected void doPut(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        OrderService service = orderService;

        if (service == null) {
            writeError(
                    response,
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Order Service no está disponible en este momento."
            );
            return;
        }

        String[] path = pathSegments(request);

        if (path.length != 2 || !"status".equals(path[1])) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    "Use PUT /api/orders/{id}/status."
            );
            return;
        }

        try {
            UpdateStatusRequest body =
                    readJson(request, UpdateStatusRequest.class);

            if (body == null || body.status == null || body.status.isBlank()) {
                writeError(
                        response,
                        HttpServletResponse.SC_BAD_REQUEST,
                        "Se requiere el campo status."
                );
                return;
            }

            OrderStatus status = OrderStatus.valueOf(
                    body.status.trim().toUpperCase(java.util.Locale.ROOT)
            );

            Order updated = service.updateStatus(path[0], status);

            writeJson(
                    response,
                    HttpServletResponse.SC_OK,
                    updated
            );
        } catch (NoSuchElementException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    exception.getMessage()
            );
        } catch (IllegalArgumentException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Estado no válido. Use CREATED, PROCESSING, COMPLETED o CANCELLED."
            );
        } catch (UnsupportedOperationException exception) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_IMPLEMENTED,
                    exception.getMessage()
            );
        }
    }

    private static final class CreateOrderRequest {
        String customerId;
        String email;
        Integer items;
        BigDecimal total;
    }

    private static final class UpdateStatusRequest {
        String status;
    }
}
