package pt.uc.dei.proj5.entity;


import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serial;
import java.io.Serializable;


@Entity
@Table(name="cliente")
// named queries
public class ClientEntity implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    // --- COLUNAS

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "company", nullable = false)
    private String company;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setIsActive(boolean active) {
        isActive = active;
    }

    @JsonbTransient
    public UserEntity getUser() {
        return users;
    }

    public void setUser(UserEntity user) {
        this.users = user;
    }
}