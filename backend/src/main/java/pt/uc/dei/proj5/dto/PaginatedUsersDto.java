package pt.uc.dei.proj5.dto;

import java.io.Serializable;
import java.util.List;

public class PaginatedUsersDto implements Serializable {

    private List<UserDto> users;
    private long total;

    public PaginatedUsersDto() {
    }

    public PaginatedUsersDto(List<UserDto> users, long total) {
        this.users = users;
        this.total = total;
    }

    public List<UserDto> getUsers() {
        return users;
    }

    public void setUsers(List<UserDto> users) {
        this.users = users;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }
}
