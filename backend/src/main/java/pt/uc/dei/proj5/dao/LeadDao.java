package pt.uc.dei.proj5.dao;


import jakarta.ejb.Stateless;
import pt.uc.dei.proj5.dto.LeadDto;
import pt.uc.dei.proj5.entity.LeadEntity;
import pt.uc.dei.proj5.entity.UserEntity;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;


@Stateless
public class LeadDao extends DefaultDao<LeadEntity> implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;


    public LeadDao() {
        super(LeadEntity.class);
    }


    public LeadEntity getLeadById(Long ID) {
        return em.find(LeadEntity.class, ID);
    }


    // Flush and refresh to get the DB-generated ID immediately after persist
    public void newLead(LeadEntity lead) {
        em.persist(lead);
        em.flush();
        em.refresh(lead);
    }


    public LeadEntity updateLead(Long ID, LeadDto newData) {

        LeadEntity lead = em.find(LeadEntity.class, ID);

        if (newData.getTitle() != null && !newData.getTitle().isEmpty()) {
            lead.setTitle(newData.getTitle());
        }

        if (newData.getDescription() != null && !newData.getDescription().isEmpty()) {
            lead.setDescription(newData.getDescription());
        }

        lead.setState(newData.getState());

        persist(lead);
        return lead;
    }


    public List<LeadEntity> getAllUserLeads(Long ID) {
        UserEntity user = em.find(UserEntity.class, ID);
        return user.getLeads();
    }


    public boolean softDeleteLead(Long ID) {
        LeadEntity leadDB = em.find(LeadEntity.class, ID);
        if (leadDB != null) {
            leadDB.setIsActive(false);
            return true;
        } else {
            return false;
        }
    }
}