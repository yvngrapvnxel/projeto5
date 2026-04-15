package pt.uc.dei.proj5.beans;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import pt.uc.dei.proj5.dao.LeadDao;
import pt.uc.dei.proj5.dao.UserDao;
import pt.uc.dei.proj5.dto.LeadDto;
import pt.uc.dei.proj5.dto.OwnerDto;
import pt.uc.dei.proj5.entity.LeadEntity;
import pt.uc.dei.proj5.entity.UserEntity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Stateless
public class LeadBean implements Serializable {


    @Inject
    LeadDao leadDao;

    @Inject
    UserBean userBean;

    @Inject
    UserDao userDao;


    // --- DTO TO ENTITY

    public LeadEntity fromDtoToEntity(LeadDto dto) {
        if (dto == null) {
            return null;
        }

        LeadEntity entity = new LeadEntity();
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setState(dto.getState());
        entity.setIsActive(true);

        Long userID = dto.getUser().getId();
        UserEntity user = userDao.findEntity(userID);
        entity.setUser(user);

        return entity;
    }


    // --- ENTITY TO DTO

    public LeadDto fromEntityToDto(LeadEntity lead) {
        if (lead == null) {
            return null;
        }

        LeadDto dto = new LeadDto();
        dto.setId(lead.getId());
        dto.setTitle(lead.getTitle());
        dto.setDescription(lead.getDescription());
        dto.setState(lead.getState());
        dto.setCreationDate(lead.getCreationDate());

        OwnerDto owner = new OwnerDto(lead.getUser().getId(), lead.getUser().getUsername(), lead.getUser().isAdmin());
        dto.setUser(owner);

        dto.setActive(lead.isActive());

        return dto;
    }


    // --- ADD NEW LEAD

    public LeadDto createLead(LeadDto newData) {
        LeadEntity lead = fromDtoToEntity(newData);
        leadDao.newLead(lead);
        return fromEntityToDto(lead);
    }


    // --- EDIT LEAD

    public LeadDto editLead(UserEntity user, Long ID, LeadDto newData) {

        LeadEntity lead = leadDao.getLeadById(ID);

        if (lead.getUser().getId().equals(user.getId()) || user.isAdmin()) {
            LeadEntity l = leadDao.updateLead(ID, newData);
            return fromEntityToDto(l);
        }

        return null;
    }


    // --- GET ALL LEADS

    public List<LeadDto> getAllLeads(Long ID) {

        List<LeadEntity> leads = leadDao.getAllUserLeads(ID);

        if (leads == null) {
            return null;
        }

        List<LeadDto> dtoLeads = new ArrayList<>();

        for (LeadEntity l : leads) {
            dtoLeads.add(fromEntityToDto(l));
        }

        return dtoLeads;
    }


    // --- SOFT DELETE LEAD

    public boolean softDeleteLead(UserEntity user, Long ID) {

        LeadEntity lead = leadDao.getLeadById(ID);

        if (lead == null) {
            return false;
        }

        if (user.isAdmin() || lead.getUser().getId().equals(user.getId())) {
            return leadDao.softDeleteLead(ID);
        }

        return false;
    }


}