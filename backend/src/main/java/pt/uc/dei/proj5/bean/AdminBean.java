package pt.uc.dei.proj5.bean;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import pt.uc.dei.proj5.dao.*;
import pt.uc.dei.proj5.entity.ClientEntity;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.LeadEntity;
import pt.uc.dei.proj5.entity.UserEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Properties;

@Stateless
public class AdminBean implements Serializable {

    private static final Logger logger = LogManager.getLogger(AdminBean.class);

    @Inject
    AdminDao adminDao;

    @Inject
    UserBean userBean;

    @Inject
    ClientDao clientDao;

    @Inject
    LeadDao leadDao;

    @Inject
    TokenBean tokenBean;

    @Inject
    TokenDao tokenDao;

    @Inject
    UserDao userDao;



    public UserDto getUser(Long userID) {
        UserEntity user = adminDao.getUserByID(userID);
        return userBean.fromEntityToDto(user);
    }



    public List<UserDto> getAllUsers() {

        List<UserEntity> users = adminDao.getAllUsers();
        List<UserDto> dtos = new ArrayList<>();

        for(UserEntity u : users) {
            dtos.add(userBean.fromEntityToDto(u));
        }
        return dtos;
    }

    public pt.uc.dei.proj5.dto.PaginatedUsersDto getPaginatedUsers(int page, int limit, String search) {
        List<UserEntity> users = adminDao.getPaginatedUsers(page, limit, search);
        long total = adminDao.countAllUsers(search);

        List<UserDto> dtos = new ArrayList<>();
        for(UserEntity u : users) {
            dtos.add(userBean.fromEntityToDto(u));
        }

        return new pt.uc.dei.proj5.dto.PaginatedUsersDto(dtos, total);
    }



    // Creates a placeholder user account with empty profile fields until the invitee confirms
    public String createInvitation(String email) {

        if (userDao.usernameAlreadyExists(email)) return null;

        UserEntity newUser = new UserEntity();
        newUser.setEmail(email);
        newUser.setUsername(email);
        newUser.setIsActive(false);
        newUser.setLang("en");
        newUser.setPassword("");
        newUser.setFirstName("");
        newUser.setLastName("");
        newUser.setPhone("");
        newUser.setPhotoUrl("");

        adminDao.persist(newUser);

        String rawToken = tokenBean.generateToken();
        tokenDao.guardarTokenDB(rawToken, newUser, 12); // 12-hour invitation token

        return rawToken;
    }



    public boolean reactivateUser(Long ID) {

        UserEntity user = adminDao.getUserByID(ID);

        if (user == null) {
            return false;
        }

        return adminDao.reactivateUser(user);
    }



    public boolean softDeleteUser(Long ID) {

        UserEntity user = adminDao.getUserByID(ID);
        if (user == null) {
            return false;
        }

        return adminDao.softDeleteUser(user);
    }



    public boolean hardDeleteUser(Long ID) {

        UserEntity user = adminDao.getUserByID(ID);
        if (user == null) {
            return false;
        }

        return adminDao.hardDeleteUser(user);
    }



    public boolean reactivateClient(Long ID) {

        ClientEntity client = clientDao.getClientById(ID);

        if (client == null) {
           return false;
        }

        return adminDao.reactivateClient(client);
    }



    public boolean deleteClient(Long ID) {

        ClientEntity client = clientDao.getClientById(ID);

        if (client == null) {
            return false;
        }

        return adminDao.hardDeleteClient(ID);
    }



    public boolean reactivateLead(Long ID) {

        LeadEntity lead = leadDao.getLeadById(ID);

        if (lead == null) {
            return false;
        }

        return adminDao.reactivateLead(lead);
    }



    public boolean deleteLead(Long ID) {

        LeadEntity lead = leadDao.getLeadById(ID);

        if (lead == null) {
            return false;
        }

        return adminDao.hardDeleteLead(ID);
    }



    // Sends HTML emails through the local MailHog SMTP relay (port 1025)
    public boolean sendEmail(String receiver, String subject, String bodyHTML) {
        try {
            Properties props = new Properties();
            props.put("mail.smtp.host", "localhost");
            props.put("mail.smtp.port", "1025");
            props.put("mail.smtp.auth", "false");
            props.put("mail.smtp.starttls.enable", "false");

            Session session = Session.getInstance(props);

            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress("no-reply@dundermifflin.com", "CRM Admin"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(receiver));
            message.setSubject(subject);
            message.setSentDate(new Date());
            message.setContent(bodyHTML, "text/html; charset=UTF-8");

            Transport.send(message);


            logger.info("E-mail successfully sent to: " + receiver);
            return true;

        } catch (Exception e) {
            logger.error("Error sending e-mail to: " + receiver, e);
            return false;
        }
    }

}