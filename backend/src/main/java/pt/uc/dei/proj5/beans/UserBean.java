package pt.uc.dei.proj5.beans;
import java.io.Serializable;
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
        tokenDao.guardarTokenDB(token, u);

        // retorna o token
        return token;
    }


    // --- LOGOUT

    public void logout(String token) {
        tokenDao.setExpired(token);
    }


    // --- REGISTER

    public boolean register(UserDto newUser) {

        String username = newUser.getUsername();

        // verifica se o username já existe
        if (userDao.usernameAlreadyExists(username)) {
            return false;
        }

        // regista o utilizador na DB
        userDao.novoUserDB(newUser);
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

        return dto;
    }


    // --- DTO PARA ENTITY

    public UserEntity fromDtoToEntity(UserDto user) {
        return userDao.findEntity(user.getId());
    }


    // --- GET USER OF TOKEN

    // get user Entity convertida para DTO (não contém password)
    public UserDto getTokensUser(String token) {
        UserEntity entity = tokenDao.getTokensUser(token);
        if (entity == null) return null;
        return fromEntityToDto(entity);
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

        if (firstName == null || lastName == null || email == null || phone == null || photoUrl == null) {
            return null;
        }

        userDao.updateUserDB(user, newData);

        return fromEntityToDto(user);

    }


    // --- CHECK MATCHING PASSWORDS

    public boolean passwordsDontMatch(String token, String password) {

        UserEntity user = tokenDao.getTokensUser(token);

        String userPass = user.getPassword().trim();
        return !userPass.equals(password.trim());
    }

}