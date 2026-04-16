package pt.uc.dei.proj5.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;


@Entity
@Table(name="lead")
public class LeadEntity implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    // --- COLUNAS

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "state", nullable = false)
    private int state;

    @CreationTimestamp
    @Column(name = "creationDate", nullable = false, updatable = false)
    private LocalDate creationDate;

    @Column(name = "isActive", nullable = false)
    private boolean isActive;

    @ManyToOne
    @JoinColumn(name = "userId") // FK
    @OnDelete(action = OnDeleteAction.SET_NULL) // altera o campo para null quando o user associado é apagado
    private UserEntity users;


    // --- MÉTODOS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setIsActive(boolean active) {
        isActive = active;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public UserEntity getUser() {
        return users;
    }

    public void setUser(UserEntity user) {
        this.users = user;
    }
}