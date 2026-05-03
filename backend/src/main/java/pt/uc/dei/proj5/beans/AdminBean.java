package pt.uc.dei.proj5.beans;

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


    // --- INVITE USER

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
        // Password and other details are left null/empty until the user registers

        adminDao.persist(newUser);

        String rawToken = tokenBean.generateToken();
        tokenDao.guardarTokenDB(rawToken, newUser, 12);

        return rawToken;
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


    // --- SEND INVITATION EMAIL

    public boolean sendEmail(String receiver, String subject, String bodyHTML) {
        try {
            // config mailhog
            Properties props = new Properties();
            props.put("mail.smtp.host", "localhost");
            props.put("mail.smtp.port", "1025");
            props.put("mail.smtp.auth", "false");
            props.put("mail.smtp.starttls.enable", "false");

            Session session = Session.getInstance(props);

            // mensagem
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