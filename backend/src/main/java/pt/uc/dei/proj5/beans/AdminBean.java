package pt.uc.dei.proj5.beans;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import pt.uc.dei.proj5.dao.AdminDao;
import pt.uc.dei.proj5.dao.ClientDao;
import pt.uc.dei.proj5.dao.LeadDao;
import pt.uc.dei.proj5.entity.ClientEntity;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.LeadEntity;
import pt.uc.dei.proj5.entity.UserEntity;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Stateless
public class AdminBean implements Serializable {

    @Inject
    AdminDao adminDao;

    @Inject
    UserBean userBean;

    @Inject
    ClientDao clientDao;

    @Inject
    LeadDao leadDao;


    // --- GET 1 USER

    public UserDto getUser(Long userID) {
        UserEntity user = adminDao.getUserByID(userID);
        return userBean.fromEntityToDto(user);
    }


    // --- GET ALL USERS

    public List<UserDto> getAllUsers() {

        List<UserEntity> users = adminDao.getAllUsers();
        List<UserDto> dtos = new ArrayList<>();

        for(UserEntity u : users) {
            dtos.add(userBean.fromEntityToDto(u));
        }
        return dtos;
    }


    // --- REACTIVATE USER

    public boolean reactivateUser(Long ID) {

        UserEntity user = adminDao.getUserByID(ID);

        if (user == null) {
            return false;
        }

        return adminDao.reactivateUser(user);
    }


    // --- SOFT DELETE USER

    public boolean softDeleteUser(Long ID) {

        UserEntity user = adminDao.getUserByID(ID);
        if (user == null) {
            return false;
        }

        return adminDao.softDeleteUser(user);
    }


    // --- HARD DELETE USER

    public boolean hardDeleteUser(Long ID) {

        UserEntity user = adminDao.getUserByID(ID);
        if (user == null) {
            return false;
        }

        return adminDao.hardDeleteUser(user);
    }


    // --- REACTIVATE USER CLIENT

    public boolean reactivateClient(Long ID) {

        ClientEntity client = clientDao.getClientById(ID);

        if (client == null) {
           return false;
        }

        return adminDao.reactivateClient(client);
    }


    // --- HARD DELETE USER CLIENT

    public boolean deleteClient(Long ID) {

        ClientEntity client = clientDao.getClientById(ID);

        if (client == null) {
            return false;
        }

        return adminDao.hardDeleteClient(ID);
    }


    // --- REACTIVATE USER LEAD

    public boolean reactivateLead(Long ID) {

        LeadEntity lead = leadDao.getLeadById(ID);

        if (lead == null) {
            return false;
        }

        return adminDao.reactivateLead(lead);
    }


    // --- HARD DELETE USER LEAD

    public boolean deleteLead(Long ID) {

        LeadEntity lead = leadDao.getLeadById(ID);

        if (lead == null) {
            return false;
        }

        return adminDao.hardDeleteLead(ID);
    }
}