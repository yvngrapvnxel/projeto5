package pt.uc.dei.proj5.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.bean.UserBean;
import pt.uc.dei.proj5.bean.LeadBean;
import pt.uc.dei.proj5.bean.ClientBean;
import pt.uc.dei.proj5.bean.TokenBean;
import pt.uc.dei.proj5.bean.AdminBean;
import pt.uc.dei.proj5.dao.AdminDao;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dto.ClientDto;
import pt.uc.dei.proj5.dto.LeadDto;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.UserEntity;

import java.util.List;
import java.util.Map;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Path("/admin")
public class AdminService {

    private static final Logger logger = LogManager.getLogger(AdminService.class);

    @Inject
    AdminBean adminBean;

    @Inject
    TokenBean tokenBean;

    @Inject
    TokenDao tokenDao;

    @Inject
    UserBean userBean;

    @Inject
    AdminDao adminDao;

    @Inject
    ClientBean clientBean;

    @Inject
    LeadBean leadBean;


    // --- INVITE USERS

    @POST
    @Path("/users/invite")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response inviteUser(@HeaderParam("token") String token, Map<String, String> payload) {

        if (tokenBean.invalidToken(token)) {
            return Response.status(401).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);
        if (admin == null || !admin.isAdmin()) {
            return Response.status(403).entity("Unauthorized.").build();
        }

        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return Response.status(400).entity("Email is required.").build();
        }

        // Create inactive user and generate 12-hour token
        String inviteToken = adminBean.createInvitation(email);

        // TODO Logic to send email via MailHog
        String link = "http://localhost:3000/register?mode=confirm&email=" + email + "&token=" + inviteToken;

        String subject = "Dunder Mifflin CRM - Account Invitation";
        String body = "<h3>Welcome to Dunder Mifflin!</h3>" +
                "<p>You have been invited to join the CRM. Please click the link below to set up your account:</p>" +
                "<a href=" + link + ">Confirm Account</a>";

        boolean sent = adminBean.sendEmail(email, subject, body);

        logger.info("Admin {} sent invitation to {}", admin.getUsername(), email);
        return Response.ok("Invitation sent to " + email).build();
    }


    // --- GET 1 USER

    @GET
    @Path("/users/{ID}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(@PathParam("ID") Long userID,
                            @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto user = userBean.getTokensUser(token);

        if (user == null || !user.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        UserDto userProfile = adminBean.getUser(userID);
        logger.info("Admin {} viewed profile of user ID {}", user.getUsername(), userID);
        return Response.status(200).entity(userProfile).build();
    }


    // GET ALL USERS

    @GET
    @Path("/users/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllUsers(@HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        List<UserDto> users = adminBean.getAllUsers();

        if (users == null || users.isEmpty()) {
            return Response.status(404).entity("No users found.").build();
        }

        logger.info("Admin {} viewed all users", admin.getUsername());
        return Response.status(200).entity(users).build();
    }

    @GET
    @Path("/users/paginated")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPaginatedUsers(
            @HeaderParam("token") String token,
            @QueryParam("page") @DefaultValue("1") int page,
            @QueryParam("limit") @DefaultValue("10") int limit,
            @QueryParam("search") String search) {

        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        pt.uc.dei.proj5.dto.PaginatedUsersDto result = adminBean.getPaginatedUsers(page, limit, search);

        return Response.status(200).entity(result).build();
    }


    // --- REACTIVATE 1 USER

    @PATCH
    @Path("/users/{ID}/reactivate")
    @Produces(MediaType.APPLICATION_JSON)
    public Response reactivateUser(@PathParam("ID") Long ID,
                                   @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        boolean reactivated = adminBean.reactivateUser(ID);

        if (reactivated) {
            logger.info("Admin {} reactivated user ID {}", admin.getUsername(), ID);
            return Response.status(200).entity("User reactivated successfully.").build();
        }

        logger.warn("Admin {} failed to reactivate user ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("User profile not found.").build();
    }


    // --- SOFT/HARD DELETE 1 USER

    @DELETE
    @Path("/users/{ID}/delete")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteUser(@PathParam("ID") Long ID,
                               @QueryParam("permanent") boolean permanent,
                               @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        if (permanent) {
            boolean deleted = adminBean.hardDeleteUser(ID);
            if (deleted) {
                logger.info("Admin {} permanently deleted user ID {}", admin.getUsername(), ID);
                return Response.status(204).entity("User permanently deleted.").build();
            }
        } else {
            boolean inactive = adminBean.softDeleteUser(ID);
            if (inactive) {
                logger.info("Admin {} soft deleted user ID {}", admin.getUsername(), ID);
                return Response.status(200).entity("User is now inactive.").build();
            }
        }

        logger.warn("Admin {} failed to delete user ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("User profile not found.").build();
    }


    // --- GET ALL USER CLIENTS

    @GET
    @Path("/users/{ID}/clients/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserClients(@PathParam("ID") Long ID,
                                   @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }


        UserEntity user = adminDao.getUserByID(ID);

        if (user == null) {
            return Response.status(404).entity("User not found.").build();
        }

        List<ClientDto> clients = clientBean.getAllClients(user);

        if (clients == null || clients.isEmpty()) {
            return Response.status(404).entity("Clients not found.").build();
        }

        logger.info("Admin {} viewed clients for user ID {}", admin.getUsername(), ID);
        return Response.status(200).entity(clients).build();

    }


    // --- REACTIVATE USER CLIENT

    @PATCH
    @Path("/users/clients/{ID}/reactivate")
    @Produces(MediaType.APPLICATION_JSON)
    public Response reactivateUserClient(@PathParam("ID") Long ID,
                                         @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto admin = userBean.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        boolean active = adminBean.reactivateClient(ID);

        if (active) {
            logger.info("Admin {} reactivated client ID {}", admin.getUsername(), ID);
            return Response.status(200).entity("Client is now active.").build();
        }

        logger.warn("Admin {} failed to reactivate client ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("Client not found.").build();
    }


    // --- EDIT USER CLIENT

    @PATCH
    @Path("users/clients/{ID}/edit")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response editUserClient(@PathParam("ID") Long ID,
                                   @HeaderParam("token") String token,
                                   ClientDto newData) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        if (newData == null) {
            return Response.status(400).entity("Incomplete or invalid data.").build();
        }

        UserEntity admin = tokenDao.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        ClientDto updated = clientBean.editClient(admin, ID, newData);

        if (updated != null) {
            logger.info("Admin {} edited client ID {}", admin.getUsername(), ID);
            return Response.status(200).entity(updated).build();
        }

        logger.warn("Admin {} failed to edit client ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("Client not found.").build();
    }


    // --- DELETE USER CLIENT

    @DELETE
    @Path("/clients/{ID}/delete")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteUserClient(@PathParam("ID") Long ID,
                                     @QueryParam("permanent") boolean permanent,
                                     @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity admin = tokenDao.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        boolean deleted;

        if (permanent) {
            deleted = adminBean.deleteClient(ID);
        } else {
            deleted = clientBean.softDeleteClient(admin, ID);
        }

        if (deleted) {
            logger.info("Admin {} {} deleted client ID {}", admin.getUsername(), permanent ? "permanently" : "soft", ID);
            String message = permanent ? "Client permanently deleted." : "Client is now inactive.";
            return Response.status(204).entity(message).build();
        }

        logger.warn("Admin {} failed to delete client ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("Client not found").build();

    }


    // GET USER LEADS

    @GET
    @Path("/users/{ID}/leads/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserLeads(@PathParam("ID") Long ID,
                                 @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity admin = tokenDao.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        UserEntity user = adminDao.getUserByID(ID);

        if (user == null) {
            return Response.status(404).entity("User not found.").build();
        }

        List<LeadDto> leads = leadBean.getAllLeads(ID);

        if (leads == null || leads.isEmpty()) {
            return Response.status(404).entity("Leads not found.").build();
        }

        logger.info("Admin {} viewed leads for user ID {}", admin.getUsername(), ID);
        return Response.status(200).entity(leads).build();
    }


    // --- EDIT USER LEAD

    @PATCH
    @Path("/leads/{ID}/edit")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response editUserLead(@PathParam("ID") Long ID,
                                 @HeaderParam("token") String token,
                                 LeadDto newData) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity admin = tokenDao.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        if (newData.getTitle() == null || newData.getDescription() == null) {
            return Response.status(400).entity("Incomplete data.").build();
        }

        LeadDto updated = leadBean.editLead(admin, ID, newData);

        if (updated != null) {
            logger.info("Admin {} edited lead ID {}", admin.getUsername(), ID);
            return Response.status(200).entity(updated).build();
        }

        logger.warn("Admin {} failed to edit lead ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("Lead not found.").build();
    }


    @PATCH
    @Path("/leads/{ID}/reactivate")
    @Produces(MediaType.APPLICATION_JSON)
    public Response reactivateUserLead(@PathParam("ID") Long ID,
                                   @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity admin = tokenDao.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        boolean reactivated = adminBean.reactivateLead(ID);

        if (reactivated) {
            logger.info("Admin {} reactivated lead ID {}", admin.getUsername(), ID);
            return Response.status(200).entity("Lead is now active.").build();
        }

        logger.warn("Admin {} failed to reactivate lead ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("Lead not found.").build();
    }


    // --- DELETE USER LEAD

    @DELETE
    @Path("/leads/{ID}/delete")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteUserLead(@PathParam("ID") Long ID,
                                    @QueryParam("permanent") boolean permanent,
                                    @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity admin = tokenDao.getTokensUser(token);

        if (admin == null || !admin.isAdmin()) {
            return Response.status(400).entity("User not authorized.").build();
        }

        boolean deleted;

        if (permanent) {
            deleted = adminBean.deleteLead(ID);
        }
        else {
            deleted = leadBean.softDeleteLead(admin, ID);
        }

        if (deleted) {
            logger.info("Admin {} {} deleted lead ID {}", admin.getUsername(), permanent ? "permanently" : "soft", ID);
            String message = permanent ? "Lead permanently deleted." : "Lead is now inactive.";
            return Response.status(204).entity(message).build();
        }

        logger.warn("Admin {} failed to delete lead ID {}", admin.getUsername(), ID);
        return Response.status(404).entity("Lead not found").build();
    }
}