package pt.uc.dei.proj5.dto;


import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;


@XmlRootElement
public class OwnerDto {

    private Long id;
    private String username;
    private boolean admin;

    public OwnerDto() {}

    public OwnerDto(Long ID, String username, boolean admin) {
        this.id = ID;
        this.username = username;
        this.admin = admin;
    }

    @XmlElement
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @XmlElement
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @XmlElement
    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}