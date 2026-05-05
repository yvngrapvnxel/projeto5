package pt.uc.dei.proj5.dao;
import jakarta.ejb.Stateless;
import jakarta.persistence.NoResultException;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.UserEntity;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Stateless
public class UserDao extends DefaultDao<UserEntity> implements Serializable {


    public UserDao() {
        super(UserEntity.class);
    }


    // Returns the user only if credentials match AND the account is active; prevents inactive logins
    public UserEntity verifyLogin(String username, String password) {
        try {
            return em.createQuery("SELECT u FROM UserEntity u WHERE u.username = :username AND u.password = :password AND u.isActive = true", UserEntity.class)
                    .setParameter("username", username)
                    .setParameter("password", password)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null; 
        }
    }

    public List<UserEntity> getAllUsers(Long userID) {

        UserEntity user = em.find(UserEntity.class, userID);

        if (user == null) {
            return null;
        }

        return em.createQuery("SELECT u FROM UserEntity u WHERE u.id != :userID", UserEntity.class)
                .setParameter("userID", userID)
                .getResultList();
    }


    public boolean usernameAlreadyExists(String username) {
        Long count = em.createQuery("SELECT COUNT(u) FROM UserEntity u WHERE u.username = :username", Long.class)
                    .setParameter("username", username)
                    .getSingleResult();
        return count > 0;
    }


    public void novoUserDB(UserDto novoUser) {

        UserEntity user = new UserEntity();

        user.setFirstName(novoUser.getFirstName());
        user.setLastName(novoUser.getLastName());
        user.setPhone(novoUser.getPhone());
        user.setEmail(novoUser.getEmail());
        user.setPhotoUrl(novoUser.getPhotoUrl());
        user.setUsername(novoUser.getUsername());
        user.setPassword(novoUser.getPassword());
        user.setIsActive(true);
        user.setLang("en");

        persist(user);
    }


    public void updateUserDB(UserEntity user, UserDto newData){

        UserEntity u = em.find(UserEntity.class, user.getId());

        String firstName = newData.getFirstName();
        String lastName = newData.getLastName();
        String email = newData.getEmail();
        String phone = newData.getPhone();
        String photoUrl = newData.getPhotoUrl();

        if (!firstName.isEmpty()) u.setFirstName(firstName);
        if (!lastName.isEmpty()) u.setLastName(lastName);
        if (!email.isEmpty()) u.setEmail(email);
        if (!phone.isEmpty()) u.setPhone(phone);
        if (!photoUrl.isEmpty()) u.setPhotoUrl(photoUrl);

        if (newData.getPassword() != null && !newData.getPassword().trim().isEmpty()) {
            u.setPassword(newData.getPassword());
        }

        em.merge(u);
    }

    public List<UserEntity> passwordReset(String email) {
        return em.createQuery("SELECT u FROM UserEntity u WHERE u.email = :email", UserEntity.class)
                .setParameter("email", email)
                .getResultList();
    }

    public UserEntity findEntity(Long ID) {
        return em.find(UserEntity.class, ID);
    }


    public UserEntity getUserByUsername(String username) {
        try {
            return em.createQuery("SELECT u FROM UserEntity u WHERE u.username = :username", UserEntity.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null; 
        }
    }

    public long countUserLeads(Long userId) {
        return em.createQuery("SELECT COUNT(l) FROM LeadEntity l WHERE l.users.id = :userId", Long.class)
                 .setParameter("userId", userId)
                 .getSingleResult();
    }

    public long countUserClients(Long userId) {
        return em.createQuery("SELECT COUNT(c) FROM ClientEntity c WHERE c.users.id = :userId", Long.class)
                 .setParameter("userId", userId)
                 .getSingleResult();
    }

    // State 4 = "Won" in the lead pipeline
    public long countUserWonLeads(Long userId) {
        return em.createQuery("SELECT COUNT(l) FROM LeadEntity l WHERE l.users.id = :userId AND l.state = 4", Long.class)
                 .setParameter("userId", userId)
                 .getSingleResult();
    }
}