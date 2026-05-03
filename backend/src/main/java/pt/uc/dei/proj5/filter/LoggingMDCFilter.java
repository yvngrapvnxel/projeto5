package pt.uc.dei.proj5.filter;

import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.apache.logging.log4j.ThreadContext;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.entity.UserEntity;

import java.io.IOException;

@Provider
public class LoggingMDCFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Inject
    private TokenDao tokenDao;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String token = requestContext.getHeaderString("token");
        String userInfo = "Anonymous";

        if (token != null && !token.trim().isEmpty()) {
            try {
                UserEntity user = tokenDao.getTokensUser(token);
                if (user != null) {
                    userInfo = user.getUsername() + "|" + token;
                } else {
                    userInfo = "Unknown|" + token;
                }
            } catch (Exception e) {
                userInfo = "Error|" + token;
            }
        }

        ThreadContext.put("user", userInfo);
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        ThreadContext.clearAll();
    }
}
