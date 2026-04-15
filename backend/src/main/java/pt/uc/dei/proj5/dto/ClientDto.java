package pt.uc.dei.proj5.dto;
import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;


@XmlRootElement
public class ClientDto {


    private long id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private OwnerDto user;
    private boolean active;


    public ClientDto() {}


    @XmlElement
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    @XmlElement
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @XmlElement
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @XmlElement
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    @XmlElement
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    @XmlElement
    @JsonbTransient
    public OwnerDto getUser() {
        return user;
    }
    public void setUser(OwnerDto user) {
        this.user = user;
    }

    @XmlElement
    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }
}