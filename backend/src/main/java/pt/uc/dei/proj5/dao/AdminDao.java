package pt.uc.dei.proj5.dao;

import jakarta.ejb.Stateless;
import jakarta.persistence.NoResultException;
import pt.uc.dei.proj5.entity.ClientEntity;
import pt.uc.dei.proj5.entity.LeadEntity;
import pt.uc.dei.proj5.entity.UserEntity;

import java.io.Serializable;
import java.util.List;

@Stateless
public class AdminDao extends DefaultDao<UserEntity> implements Serializable {

    public AdminDao() {
        super(UserEntity.class);
    }


    // get 1 user by ID from DB
    public UserEntity getUserByID(Long ID) {
        try {
            return em.createQuery("SELECT u FROM UserEntity u WHERE u.id = :ID", UserEntity.class)
                    .setParameter("ID", ID)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }


    // get all non-admin users from DB
    public List<UserEntity> getAllUsers() {
        return em.createQuery("SELECT u FROM UserEntity u WHERE u.isAdmin = false", UserEntity.class)
                .getResultList();
    }


    // reactivate user
    public boolean reactivateUser(UserEntity user) {
        int rows = em.createQuery("UPDATE UserEntity u SET u.isActive = true WHERE u.id = :ID")
                .setParameter("ID", user.getId())
                .executeUpdate();
        return rows > 0;
    }


    // soft delete user
    public boolean softDeleteUser(UserEntity user) {
        int rows = em.createQuery("UPDATE UserEntity u SET u.isActive = false WHERE u.id = :ID")
                .setParameter("ID", user.getId())
                .executeUpdate();
        return rows > 0;
    }


    // hard delete user
    public boolean hardDeleteUser(UserEntity user) {
        UserEntity userDB = em.find(UserEntity.class, user.getId());

        if (userDB == null) {
            return false;
        }

        em.remove(user);
        return true;
    }


    // reactivate user client
    public boolean reactivateClient(ClientEntity client) {
        int rows = em.createQuery("UPDATE ClientEntity c SET c.isActive = true WHERE c.id = :ID")
                .setParameter("ID", client.getId())
                .executeUpdate();
        return rows > 0;
    }


    // hard delete user client
    public boolean hardDeleteClient(Long ID) {
        ClientEntity clientDB = em.find(ClientEntity.class, ID);

        if (clientDB == null) {
            return false;
        }

        em.remove(clientDB);
        return true;
    }


    // reactivate user lead
    public boolean reactivateLead(LeadEntity lead) {
        int rows = em.createQuery("UPDATE LeadEntity l SET l.isActive = true WHERE l.id = :ID")
                .setParameter("ID", lead.getId())
                .executeUpdate();
        return rows > 0;
    }


    // hard delete user lead
    public boolean hardDeleteLead(Long ID) {
        LeadEntity leadDB = em.find(LeadEntity.class, ID);

        if (leadDB == null) {
            return false;
        }

        em.remove(leadDB);
        return true;
    }
}