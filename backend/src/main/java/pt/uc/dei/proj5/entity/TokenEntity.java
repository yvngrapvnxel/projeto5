package pt.uc.dei.proj5.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;


@Entity
@Table(name = "token")
// named queries
public class TokenEntity implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    // --- COLUNAS

    @Id
    @Column(name = "token", nullable = false, updatable = false)
    private String token;

    @CreationTimestamp
    @Column(name = "sessionDate", nullable = false, updatable = false)
    private LocalDateTime sessionDate;

    @Column(name = "expireTime", nullable = false, updatable = false)
    private LocalDateTime expireTime;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false, updatable = false) // FK
    @OnDelete(action = OnDeleteAction.CASCADE) // apaga o token quando o user associado é apagado
    private UserEntity users;


    // --- MÉTODOS

    public Long getUserId() {
        return users.getId();
    }

    public void setUserId(UserEntity user) {
        this.users = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDateTime sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalDateTime getExpireTime() {
        return expireTime;
    }

    public void setExpireTime(LocalDateTime expireTime) {
        this.expireTime = expireTime;
    }
}