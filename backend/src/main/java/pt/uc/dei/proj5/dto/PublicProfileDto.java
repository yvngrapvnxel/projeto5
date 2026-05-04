package pt.uc.dei.proj5.dto;

import java.io.Serializable;

public class PublicProfileDto implements Serializable {

    private String firstName;
    private String lastName;
    private String username;
    private String photoUrl;
    private UserStatsDto stats;

    public PublicProfileDto() {
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public UserStatsDto getStats() {
        return stats;
    }

    public void setStats(UserStatsDto stats) {
        this.stats = stats;
    }
}
