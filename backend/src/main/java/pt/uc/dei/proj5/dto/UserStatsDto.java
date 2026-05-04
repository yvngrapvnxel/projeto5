package pt.uc.dei.proj5.dto;

import java.io.Serializable;

public class UserStatsDto implements Serializable {

    private long totalLeads;
    private long totalClients;
    private long wonLeads;

    public UserStatsDto() {
    }

    public UserStatsDto(long totalLeads, long totalClients, long wonLeads) {
        this.totalLeads = totalLeads;
        this.totalClients = totalClients;
        this.wonLeads = wonLeads;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getTotalClients() {
        return totalClients;
    }

    public void setTotalClients(long totalClients) {
        this.totalClients = totalClients;
    }

    public long getWonLeads() {
        return wonLeads;
    }

    public void setWonLeads(long wonLeads) {
        this.wonLeads = wonLeads;
    }
}
