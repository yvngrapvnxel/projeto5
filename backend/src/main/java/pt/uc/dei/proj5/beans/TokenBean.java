package pt.uc.dei.proj5.beans;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import pt.uc.dei.proj5.dao.TokenDao;
import java.io.Serializable;
import java.security.SecureRandom;
import java.util.Base64;

@Stateless
public class TokenBean implements Serializable {

    @Inject
    TokenDao tokenDao;


    private String token;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();


    public String generateToken() {
        byte[] token = new byte[16];
        SECURE_RANDOM.nextBytes(token);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token);
    }


    public boolean invalidToken(String token) {
        if (token == null) {
            return true;
        }
        Long count = tokenDao.validToken(token);
        return count == 0;
    }


    public String getToken() {
        return token;
    }


    public void setToken(String token) {
        this.token = token;
    }

}
