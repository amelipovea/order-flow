package ec.udla.orderflow.rest.internal;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Endpoints de salud y monitoreo del runtime OSGi.
 *
 * GET /api/system/health
 * GET /api/system/bundles
 */
@Component(
        service = Servlet.class,
        property = {
                "osgi.http.whiteboard.servlet.pattern=/api/system/*",
                "osgi.http.whiteboard.servlet.name=orderflow-system"
        }
)
public class SystemServlet extends BaseApiServlet {

    private volatile BundleContext bundleContext;

    @Activate
    void activate(BundleContext context) {
        this.bundleContext = context;
    }

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        String[] path = pathSegments(request);

        if (path.length != 1) {
            writeError(
                    response,
                    HttpServletResponse.SC_NOT_FOUND,
                    "Use /api/system/health o /api/system/bundles."
            );
            return;
        }

        BundleContext context = bundleContext;

        if (context == null) {
            writeError(
                    response,
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "No se pudo consultar el contexto OSGi."
            );
            return;
        }

        if ("health".equals(path[0])) {
            Map<String, Object> health = new LinkedHashMap<>();
            health.put("status", "UP");
            health.put("runtime", "Apache Karaf / OSGi");
            health.put("bundleCount", context.getBundles().length);
            writeJson(response, HttpServletResponse.SC_OK, health);
            return;
        }

        if ("bundles".equals(path[0])) {
            List<Map<String, Object>> result = new ArrayList<>();

            Bundle[] bundles = context.getBundles();
            java.util.Arrays.stream(bundles)
                    .sorted(Comparator.comparingLong(Bundle::getBundleId))
                    .forEach(bundle -> {
                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("id", bundle.getBundleId());
                        item.put("symbolicName", bundle.getSymbolicName());
                        String bundleName = bundle.getHeaders().get("Bundle-Name");
                        item.put(
                                "name",
                                bundleName == null || bundleName.isBlank()
                                        ? bundle.getSymbolicName()
                                        : bundleName
                        );
                        item.put("version", bundle.getVersion().toString());
                        item.put("state", stateName(bundle.getState()));
                        item.put("stateCode", bundle.getState());
                        result.add(item);
                    });

            writeJson(response, HttpServletResponse.SC_OK, result);
            return;
        }

        writeError(
                response,
                HttpServletResponse.SC_NOT_FOUND,
                "El recurso de sistema solicitado no existe."
        );
    }

    private String stateName(int state) {
        return switch (state) {
            case Bundle.ACTIVE -> "ACTIVE";
            case Bundle.RESOLVED -> "RESOLVED";
            case Bundle.INSTALLED -> "INSTALLED";
            case Bundle.STARTING -> "STARTING";
            case Bundle.STOPPING -> "STOPPING";
            case Bundle.UNINSTALLED -> "UNINSTALLED";
            default -> "UNKNOWN";
        };
    }
}
