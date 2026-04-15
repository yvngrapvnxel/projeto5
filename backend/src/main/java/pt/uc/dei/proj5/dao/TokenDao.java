package pt.uc.dei.proj5.dao;
import jakarta.ejb.Stateless;
import jakarta.persistence.NoResultException;
import pt.uc.dei.proj5.entity.TokenEntity;
import pt.uc.dei.proj5.entity.UserEntity;
import java.io.Serial;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;


@Stateless
public class TokenDao extends DefaultDao<TokenEntity> implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    public TokenDao() {
        super(TokenEntity.class);
    }


    public String encriptar(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao encriptar token", e);
        }
    }


    public void guardarTokenDB(String token, UserEntity u) {

        String encriptado = encriptar(token);

        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setToken(encriptado);
        tokenEntity.setUserId(u);
        tokenEntity.setSessionDate(LocalDateTime.now());
        tokenEntity.setExpireTime(LocalDateTime.now().plusHours(1)); // expira em 1h

        persist(tokenEntity);
    }


    // get user Entity (contém password)
    public UserEntity getTokensUser(String token) {
        if (token == null) {
            return null;
        }

        String encriptado = encriptar(token);

        try {
            return em.createQuery("SELECT u FROM UserEntity u JOIN u.tokens t WHERE t.token = :token AND u.isActive = true", UserEntity.class)
                    .setParameter("token", encriptado)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }


    public Long validToken(String token) {

        String encriptado = encriptar(token);

        Long rows = em.createQuery("SELECT COUNT(t) FROM TokenEntity t WHERE t.token = :token AND t.expireTime > CURRENT_TIMESTAMP", Long.class)
                .setParameter("token", encriptado)
                .getSingleResult();

        return rows;
    }


    public void setExpired(String token) {

        String encriptado = encriptar(token);

        em.createQuery("UPDATE TokenEntity t SET t.expireTime = CURRENT_TIMESTAMP WHERE t.token = :token")
                .setParameter("token", encriptado)
                .executeUpdate();
    }

}