package pt.uc.dei.proj5.bean;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dao.UserDao;
import pt.uc.dei.proj5.entity.UserEntity;
import pt.uc.dei.proj5.dto.UserDto;


@Stateless
public class UserBean implements Serializable {


    @Inject
    UserDao userDao;

    @Inject
    TokenDao tokenDao;

    @Inject
    TokenBean tokenBean;

    @Inject
    AdminBean adminBean;


    // --- LOGIN
    public String authenticate(String username, String password) {
        // retorna a Entity correspondente ao username+password ou null em caso contrário
        UserEntity u = userDao.verifyLogin(username, password);

        // se user é null ou está inativo, o login não é efetuado então retorna null
        if (u == null || !u.isActive()) {
            return null;
        }

        // gera e guarda o token
        String token = tokenBean.generateToken();
        tokenDao.guardarTokenDB(token, u, 1);

        // retorna o token
        return token;
    }


    // --- LOGOUT

    public void logout(String token) {
        tokenDao.setExpired(token);
    }


    // --- CONFIRM ACCOUNT REGISTER

    public boolean confirmAccount(Map<String, String> payload) {
        String token = payload.get("token");

        if (tokenBean.invalidToken(token)) {
            return false;
        }

        UserEntity user = tokenDao.getTokensUser(token);

        user.setFirstName(payload.get("firstName"));
        user.setLastName(payload.get("lastName"));
        user.setPhone(payload.get("phone"));
        user.setPassword(payload.get("password"));
        user.setUsername(payload.get("username"));
        if (payload.get("photoUrl") != null) {
            user.setPhotoUrl(payload.get("photoUrl"));
        }

        user.setIsActive(true);
        userDao.merge(user);

        tokenDao.setExpired(token);
        return true;
    }

    // --- REQUEST PASSWORD RESET
    public boolean requestPasswordReset(String email) {
        List<UserEntity> users = userDao.passwordReset(email);
        if (users.isEmpty()) {
            return false;
        }

        UserEntity user = users.getFirst();
        if (user == null) {
            return false;
        }

        String rawToken = tokenBean.generateToken();
        tokenDao.guardarTokenDB(rawToken, user, 1);

        String link = "http://localhost:3000/register?mode=reset&email=" + email + "&token=" + rawToken;
        String subject = "Dunder Mifflin CRM - Password Recovery";
        String body = "<h3>Password Reset Request</h3>" +
                "<p>Click the link below to securely reset your password. This link expires in 1 hour.</p>" +
                "<a href=" + link + ">Reset My Password</a>";

        return adminBean.sendEmail(email, subject, body);
    }


    // --- RESET PASSWORD

    public boolean resetPassword(String token, String newPassword) {

        if (tokenBean.invalidToken(token)) {
            return false;
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return false;
        }

        user.setPassword(newPassword);
        userDao.merge(user);

        tokenDao.setExpired(token);
        return true;
    }


    // --- ENTITY PARA DTO

    public UserDto fromEntityToDto(UserEntity e) {
        UserDto dto = new UserDto();

        dto.setId(e.getId());
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setEmail(e.getEmail());
        dto.setPhone(e.getPhone());
        dto.setUsername(e.getUsername());
        dto.setPhotoUrl(e.getPhotoUrl());
        dto.setAdmin(e.isAdmin());
        dto.setActive(e.isActive());
        dto.setLang(e.getLang());

        return dto;
    }


    // --- DTO PARA ENTITY

    public UserEntity fromDtoToEntity(UserDto user) {
        return userDao.findEntity(user.getId());
    }


    // get user Entity convertida para DTO (não contém password)
    public UserDto getTokensUser(String token) {
        UserEntity entity = tokenDao.getTokensUser(token);
        if (entity == null) return null;
        return fromEntityToDto(entity);
    }

    public pt.uc.dei.proj5.dto.UserStatsDto getUserStats(String token) {
        UserEntity entity = tokenDao.getTokensUser(token);
        if (entity == null) return null;

        long leads = userDao.countUserLeads(entity.getId());
        long clients = userDao.countUserClients(entity.getId());
        long wonLeads = userDao.countUserWonLeads(entity.getId());

        return new pt.uc.dei.proj5.dto.UserStatsDto(leads, clients, wonLeads);
    }

    public pt.uc.dei.proj5.dto.PublicProfileDto getPublicProfile(String username) {
        UserEntity entity = userDao.getUserByUsername(username);
        if (entity == null || !entity.isActive()) return null;

        long leads = userDao.countUserLeads(entity.getId());
        long clients = userDao.countUserClients(entity.getId());
        long wonLeads = userDao.countUserWonLeads(entity.getId());

        pt.uc.dei.proj5.dto.PublicProfileDto publicDto = new pt.uc.dei.proj5.dto.PublicProfileDto();
        publicDto.setFirstName(entity.getFirstName());
        publicDto.setLastName(entity.getLastName());
        publicDto.setUsername(entity.getUsername());
        publicDto.setPhotoUrl(entity.getPhotoUrl());
        publicDto.setStats(new pt.uc.dei.proj5.dto.UserStatsDto(leads, clients, wonLeads));

        return publicDto;
    }


    // --- SAVE PROFILE CHANGES

    public UserDto updateUser(String token, UserDto newData) {
        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return null;
        }

        String firstName = newData.getFirstName();
        String lastName = newData.getLastName();
        String email = newData.getEmail();
        String phone = newData.getPhone();
        String photoUrl = newData.getPhotoUrl();
        String lang = newData.getLang();
        if (lang != null && (lang.equals("en") || lang.equals("pt"))) {
            user.setLang(lang);
        }

        if (firstName == null || lastName == null || email == null || phone == null || photoUrl == null) {
            return null;
        }

        userDao.updateUserDB(user, newData);

        return fromEntityToDto(user);

    }


    // --- UPDATE LANGUAGE

    public UserDto updateLanguage(String token, String lang) {
        UserEntity user = tokenDao.getTokensUser(token);
        if (user == null) {
            return null;
        }

        user.setLang(lang);
        userDao.merge(user);

        return fromEntityToDto(user);
    }


    // --- CHECK MATCHING PASSWORDS

    public boolean passwordsDontMatch(String token, String password) {

        UserEntity user = tokenDao.getTokensUser(token);

        String userPass = user.getPassword().trim();
        return !userPass.equals(password.trim());
    }

}