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


    public UserEntity getUserByID(Long ID) {
        try {
            return em.createQuery("SELECT u FROM UserEntity u WHERE u.id = :ID", UserEntity.class)
                    .setParameter("ID", ID)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }


    public List<UserEntity> getAllUsers() {
        return em.createQuery("SELECT u FROM UserEntity u WHERE u.isAdmin = false", UserEntity.class)
                .getResultList();
    }

    public List<UserEntity> getPaginatedUsers(int page, int limit, String search) {
        String queryStr = "SELECT u FROM UserEntity u WHERE u.isAdmin = false";
        if (search != null && !search.trim().isEmpty()) {
            queryStr += " AND (LOWER(u.username) LIKE :search OR LOWER(u.email) LIKE :search OR LOWER(u.firstName) LIKE :search OR LOWER(u.lastName) LIKE :search)";
        }
        queryStr += " ORDER BY u.isActive DESC, u.firstName ASC";
        var query = em.createQuery(queryStr, UserEntity.class);
        if (search != null && !search.trim().isEmpty()) {
            query.setParameter("search", "%" + search.toLowerCase() + "%");
        }
        return query.setFirstResult((page - 1) * limit)
                    .setMaxResults(limit)
                    .getResultList();
    }

    public long countAllUsers(String search) {
        String queryStr = "SELECT COUNT(u) FROM UserEntity u WHERE u.isAdmin = false";
        if (search != null && !search.trim().isEmpty()) {
            queryStr += " AND (LOWER(u.username) LIKE :search OR LOWER(u.email) LIKE :search OR LOWER(u.firstName) LIKE :search OR LOWER(u.lastName) LIKE :search)";
        }
        var query = em.createQuery(queryStr, Long.class);
        if (search != null && !search.trim().isEmpty()) {
            query.setParameter("search", "%" + search.toLowerCase() + "%");
        }
        return query.getSingleResult();
    }



    public boolean reactivateUser(UserEntity user) {
        int rows = em.createQuery("UPDATE UserEntity u SET u.isActive = true WHERE u.id = :ID")
                .setParameter("ID", user.getId())
                .executeUpdate();
        return rows > 0;
    }


    public boolean softDeleteUser(UserEntity user) {
        int rows = em.createQuery("UPDATE UserEntity u SET u.isActive = false WHERE u.id = :ID")
                .setParameter("ID", user.getId())
                .executeUpdate();
        return rows > 0;
    }


    public boolean hardDeleteUser(UserEntity user) {
        UserEntity userDB = em.find(UserEntity.class, user.getId());

        if (userDB == null) {
            return false;
        }

        em.remove(user);
        return true;
    }


    public boolean reactivateClient(ClientEntity client) {
        int rows = em.createQuery("UPDATE ClientEntity c SET c.isActive = true WHERE c.id = :ID")
                .setParameter("ID", client.getId())
                .executeUpdate();
        return rows > 0;
    }


    public boolean hardDeleteClient(Long ID) {
        ClientEntity clientDB = em.find(ClientEntity.class, ID);

        if (clientDB == null) {
            return false;
        }

        em.remove(clientDB);
        return true;
    }


    public boolean reactivateLead(LeadEntity lead) {
        int rows = em.createQuery("UPDATE LeadEntity l SET l.isActive = true WHERE l.id = :ID")
                .setParameter("ID", lead.getId())
                .executeUpdate();
        return rows > 0;
    }


    public boolean hardDeleteLead(Long ID) {
        LeadEntity leadDB = em.find(LeadEntity.class, ID);

        if (leadDB == null) {
            return false;
        }

        em.remove(leadDB);
        return true;
    }
}