package pt.uc.dei.proj5.filter;

import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.entity.UserEntity;

import java.io.IOException;

@Provider
public class ConfirmedUserFilter implements ContainerRequestFilter {

    @Inject
    private TokenDao tokenDao;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();

        // Enforce that unconfirmed/pending users cannot access core CRM endpoints
        if (path.startsWith("/clients") || path.startsWith("/leads") || path.startsWith("/admin")) {
            String token = requestContext.getHeaderString("token");

            if (token != null) {
                UserEntity user = tokenDao.getTokensUser(token);
                // If user is found but is not active (pending confirmation), block with 403 Forbidden
                if (user != null && !user.isActive()) {
                    requestContext.abortWith(
                            Response.status(Response.Status.FORBIDDEN)
                                    .entity("403 Forbidden: User account is pending confirmation and cannot perform this operation.")
                                    .build()
                    );
                }
            }
        }
    }
}
