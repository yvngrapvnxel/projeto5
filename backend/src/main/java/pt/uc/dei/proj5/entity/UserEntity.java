package pt.uc.dei.proj5.entity;


import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;


@Entity
@Table(name="users")
// named queries
public class UserEntity implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    // --- COLUNAS

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id", nullable = false, unique = true, updatable = false)
    private Long id;

    @Column(name="firstName", nullable = false)
    private String firstName;

    @Column(name="lastName", nullable = false)
    private String lastName;

    @Column(name="email", nullable = false)
    private String email;

    @Column(name="phone", nullable = false)
    private String phone;

    @Column(name="username", unique = true, nullable = false, updatable = false)
    private String username;

    @Column(name="password", nullable = false)
    private String password;

    @Column(name="photoUrl", nullable = false)
    private String photoUrl;

    @Column(name="isAdmin", nullable = false, updatable = false)
    private boolean isAdmin;

    @Column(name = "isActive", nullable = false)
    private boolean isActive;

    @JsonbTransient
    @OneToMany(mappedBy = "users")
    private List<TokenEntity> tokens;

    @JsonbTransient
    @OneToMany(mappedBy = "users")
    private List<ClientEntity> clients;

    @JsonbTransient
    @OneToMany(mappedBy = "users")
    private List<LeadEntity> leads;



    // --- MÉTODOS

    // getters

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public boolean isActive() {
        return isActive;
    }

    public List<TokenEntity> getTokens() {
        return tokens;
    }

    public List<ClientEntity> getClients() {
        return clients;
    }

    public List<LeadEntity> getLeads() {
        return leads;
    }

    // setters

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public void setIsAdmin(boolean admin) {
        this.isAdmin = admin;
    }

    public void setIsActive(boolean active) {
        this.isActive = active;
    }

    public void setTokens(List<TokenEntity> tokens) {
        this.tokens = tokens;
    }

    public void setClients(List<ClientEntity> clients) {
        this.clients = clients;
    }

    public void setLeads(List<LeadEntity> leads) {
        this.leads = leads;
    }
}