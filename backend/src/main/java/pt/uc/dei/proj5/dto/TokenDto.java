package pt.uc.dei.proj5.dto;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.time.LocalDateTime;


@XmlRootElement
public class TokenDto {


    private long userId;
    private String token;
    private LocalDateTime sessionDate;
    private LocalDateTime expireTime;


    public TokenDto() {}


    @XmlElement
    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    @XmlElement
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    @XmlElement
    public LocalDateTime getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDateTime sessionDate) {
        this.sessionDate = sessionDate;
    }

    @XmlElement
    public LocalDateTime getExpireTime() {
        return expireTime;
    }

    public void setExpireTime(LocalDateTime expireTime) {
        this.expireTime = expireTime;
    }

    public boolean isValido() {
        return LocalDateTime.now().isBefore(expireTime);
    }
}