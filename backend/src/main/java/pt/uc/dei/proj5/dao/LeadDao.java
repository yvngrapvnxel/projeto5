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


    // get lead by ID in DB
    public LeadEntity getLeadById(Long ID) {
        return em.find(LeadEntity.class, ID);
    }


    // add new lead in DB
    public void newLead(LeadEntity lead) {
        em.persist(lead);
        em.flush();
        em.refresh(lead);
    }


    // update lead's details in DB
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


    // get ALL user leads
    public List<LeadEntity> getAllUserLeads(Long ID) {
        UserEntity user = em.find(UserEntity.class, ID);
        return user.getLeads();
    }


    // soft delete lead
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