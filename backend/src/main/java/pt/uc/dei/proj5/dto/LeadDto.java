package pt.uc.dei.proj5.dto;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.time.LocalDate;


@XmlRootElement
public class LeadDto {


    private Long id;
    private String title;
    private String description;
    private int state;
    private LocalDate creationDate;
    private OwnerDto user;
    private boolean active;


    public LeadDto() {}


    @XmlElement
    public Long getId() {
        return id;
    }

    public void setId(Long id) { // Added setter
        this.id = id;
    }

    @XmlElement
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @XmlElement
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @XmlElement
    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    @XmlElement
    public LocalDate getCreationDate() {
        return creationDate;
    }
    public void setCreationDate(LocalDate date){
        this.creationDate = date;
    }

    @XmlElement
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