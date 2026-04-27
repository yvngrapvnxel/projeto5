package pt.uc.dei.proj5.service;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;

@Provider
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    /**
     * Intercepts incoming requests.
     * If the browser sends an OPTIONS preflight request, we catch it and immediately
     * return a 200 OK. This prevents the server from throwing a 404/405 if you
     * don't have explicit @OPTIONS methods on all your endpoints.
     */
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if (requestContext.getMethod().equalsIgnoreCase("OPTIONS")) {
            requestContext.abortWith(Response.status(Response.Status.OK).build());
        }
    }

    /**
     * Appends the CORS headers to every outgoing response.
     */
    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        // Allow requests from any origin.
        // Note: For production, you should change "*" to "http://localhost:3000" or your React app's actual URL.
        responseContext.getHeaders().add("Access-Control-Allow-Origin", "*");

        // Allow the frontend to send these specific headers
        responseContext.getHeaders().add("Access-Control-Allow-Headers", "origin, content-type, accept, authorization, token");

        // Allow the browser to include cookies/authorization headers
        responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");

        // Allow these HTTP methods
        responseContext.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");
    }
}