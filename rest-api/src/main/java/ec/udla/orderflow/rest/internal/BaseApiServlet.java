package ec.udla.orderflow.rest.internal;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.Reader;
import java.lang.reflect.Type;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Funciones comunes para los servlets REST.
 *
 * Centraliza JSON, CORS y el tratamiento de rutas.
 */
abstract class BaseApiServlet extends HttpServlet {

    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(
                    Instant.class,
                    (JsonSerializer<Instant>) (value, type, context) ->
                            new JsonPrimitive(value.toString())
            )
            .registerTypeAdapter(
                    Instant.class,
                    (JsonDeserializer<Instant>) (json, type, context) ->
                            Instant.parse(json.getAsString())
            )
            .disableHtmlEscaping()
            .create();

    @Override
    protected void service(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, OPTIONS"
        );
        response.setHeader(
                "Access-Control-Allow-Headers",
                "Content-Type, Accept"
        );
        response.setHeader("Access-Control-Max-Age", "3600");

        super.service(request, response);
    }

    @Override
    protected void doOptions(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    protected <T> T readJson(
            HttpServletRequest request,
            Class<T> type
    ) throws IOException {
        try (Reader reader = request.getReader()) {
            return GSON.fromJson(reader, type);
        }
    }

    protected void writeJson(
            HttpServletResponse response,
            int status,
            Object value
    ) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        response.getWriter().write(GSON.toJson(value));
    }

    protected void writeError(
            HttpServletResponse response,
            int status,
            String message
    ) throws IOException {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("error", "request_error");
        body.put("message", message);
        writeJson(response, status, body);
    }

    protected String[] pathSegments(HttpServletRequest request) {
        String path = request.getPathInfo();

        if (path == null || path.isBlank() || "/".equals(path)) {
            return new String[0];
        }

        return java.util.Arrays.stream(path.split("/"))
                .filter(segment -> !segment.isBlank())
                .map(segment -> URLDecoder.decode(
                        segment,
                        StandardCharsets.UTF_8
                ))
                .toArray(String[]::new);
    }
}
