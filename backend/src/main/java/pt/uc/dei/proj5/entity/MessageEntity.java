package pt.uc.dei.proj5.entity;

import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;


@Entity
@Table(name = "messages")
public class MessageEntity implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    // --- COLUNAS

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @JsonbTransient
    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserEntity sender;

    @JsonbTransient
    @ManyToOne(optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private UserEntity receiver;

    @Column(name = "text", nullable = false, length = 2000)
    private String text;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }



    // --- MÉTODOS

    // getters

    public Long getId() {
        return id;
    }
    public UserEntity getSender() {
        return sender;
    }
    public UserEntity getReceiver() {
        return receiver;
    }
    public String getText() {
        return text;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // setters

    public void setSender(UserEntity sender) {
        this.sender = sender;
    }
    public void setReceiver(UserEntity receiver) {
        this.receiver = receiver;
    }
    public void setText(String text) {
        this.text = text;
    }
}