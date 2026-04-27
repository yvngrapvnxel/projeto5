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


    // verifica as credenciais do login
    public UserEntity verifyLogin(String username, String password) {
        try {
            return em.createQuery("SELECT u FROM UserEntity u WHERE u.username = :username AND u.password = :password AND u.isActive = true", UserEntity.class)
                    .setParameter("username", username)
                    .setParameter("password", password)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null; // retorna null se não existir o conjunto username+password na DB ou se user estiver inativo
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


    // verifica se um username já existe na DB
    public boolean usernameAlreadyExists(String username) {
        Long count = em.createQuery("SELECT COUNT(u) FROM UserEntity u WHERE u.username = :username", Long.class)
                    .setParameter("username", username)
                    .getSingleResult();
        return count > 0;
    }


    // regista um novo utilizador na DB
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


    // guarda as mudanças no perfil
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

    public UserEntity findEntity(Long ID) {
        return em.find(UserEntity.class, ID);
    }


    // retorna a userEntity correspondente ou null
//    public UserEntity getUserByUsername(String username) {
//        try {
//            return em.createQuery("SELECT u FROM UserEntity u WHERE u.username = :username", UserEntity.class)
//                    .setParameter("username", username)
//                    .getSingleResult();
//        } catch (NoResultException e) {
//            return null; // retorna null se não encontrar ninguém
//        }
//    }


    // --- METODOS ADMIN


//    public List<UserEntity> findAllActiveUsers() {
//        return em.createQuery("SELECT u FROM UserEntity u WHERE u.isActive = true", UserEntity.class)
//                .getResultList();
//    }



//    public List<LeadEntity> getAllActiveLeads(UserEntity user) {
//        return em.createQuery("SELECT l FROM LeadEntity l WHERE users = :user AND isActive = true", LeadEntity.class)
//                .setParameter("user", user)
//                .getResultList();
//    }
}