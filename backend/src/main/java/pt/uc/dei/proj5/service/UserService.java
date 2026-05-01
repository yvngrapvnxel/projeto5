package pt.uc.dei.proj5.service;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.beans.TokenBean;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dao.UserDao;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.UserEntity;

import java.util.Map;


@Path("/users")
public class UserService {


    @Inject
    UserBean userBean;

    @Inject
    UserDao userDao;

    @Inject
    TokenBean tokenBean;

    @Inject
    TokenDao tokenDao;


    // --- LOGIN

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(UserDto user) {

        String username = user.getUsername();
        String password = user.getPassword();

        // validação de campos vazios
        if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
            return Response.status(401).entity("Incomplete data.").build();
        }

        // verifica o login e devolve null ou token consoante o sucesso do login
        String token = userBean.authenticate(username, password);

        if (token == null) {
            return Response.status(401).entity("Incorrect data.").build();
        }

        // devolve o token ao frontend em formato JSON
//        Map<String, String> mapaToken = Map.of("token", token);
        return Response.status(200).entity(token).build();

    }


    // --- LOGOUT

    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("token") String token) {
        userBean.logout(token);
        return Response.status(200).entity("Logged out successfully.").build();
    }


    // --- CONFIRM ACCOUNT REGISTER

    @POST
    @Path("/confirm-account")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response confirmAccount(Map<String, String> payload) {
        String token = payload.get("token");
        String email = payload.get("email");
        String newUsername = payload.get("username");

        if (token == null || email == null) {
            return Response.status(400).entity("Missing security token or email.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);
        if (user == null || !user.getEmail().equals(email) || user.isActive()) {
            return Response.status(403).entity("Account not found or is already active.").build();
        }

        if (newUsername == null || newUsername.trim().isEmpty()) {
            return Response.status(400).entity("Username is required.").build();
        }

        if (!email.equals(newUsername)) {
            if (userDao.usernameAlreadyExists(newUsername)) {
                return Response.status(400).entity("That username is already taken. Please choose another.").build();
            }
            user.setUsername(newUsername);
        }

        boolean success = userBean.confirmAccount(payload);

        if (!success) {
            return Response.status(400).entity("Invalid or expired invitation token.").build();
        }

        return Response.status(200).entity("Account confirmed successfully!").build();
    }

    // --- FORGOT PASSWORD REQUEST

    @POST
    @Path("/forgot-password")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response forgotPassword(Map<String, String> payload) {

        String email = payload.get("email");

        if (email == null || email.trim().isEmpty()) {
            return Response.status(400).entity("E-mail is required.").build();
        }

        boolean success = userBean.requestPasswordReset(email);

        if (success) {
            return Response.status(200).entity("Recovery e-mail sent.").build();
        }

        return Response.status(200).entity("If the e-mail exists, a link was sent.").build();
    }

    // --- RESET PASSWORD

    @POST
    @Path("/reset-password")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetPassword(Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || newPassword == null || newPassword.trim().isEmpty()) {
            return Response.status(400).entity("Incomplete data.").build();
        }

        boolean success = userBean.resetPassword(token, newPassword);

        if (!success) {
            return Response.status(400).entity("Invalid or expired reset token.").build();
        }

        return Response.status(200).entity("Password updated successfully.").build();
    }


    // --- GET PROFILE

    @GET
    @Path("/profile")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserProfile(@HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto user = userBean.getTokensUser(token);

        if (user == null) {
            return Response.status(404).entity("User not found.").build();
        }

        return Response.status(200).entity(user).build();
    }


    // --- SAVE PROFILE CHANGES

    @PATCH
    @Path("/profile")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateProfile(@HeaderParam("token") String token,
                                  @HeaderParam("confirmationPassword") String password,
                                  UserDto dadosNovos) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        // verificar se passwords coincidem
        UserDto user = userBean.getTokensUser(token);

        if (user == null || password == null) {
            return Response.status(401).entity("Invalid data.").build();
        }

        if (userBean.passwordsDontMatch(token, password)) {
            return Response.status(401).entity("Wrong password.").build();
        }

        // fazer e verificar update
        UserDto updated = userBean.updateUser(token, dadosNovos);

        if (updated == null) {
            return Response.status(401).entity("There was an error saving your profile.").build();
        }

        return Response.status(200).entity(updated).build();
    }


    //  --- CHECK MATCHING PASSWORDS

//    @GET
//    @Path("/checkPassword")
//    @Produces(MediaType.APPLICATION_JSON)
//    public Response verificaPassword(@HeaderParam("token") String token,
//                                    @HeaderParam("confirmationPassword") String password) {
//
//        UserDto user = userBean.getTokensUser(token);
//
//        if (user == null || password == null) {
//            return Response.status(401).entity("Invalid data.").build();
//        }
//
//        if (userBean.passwordsDontMatch(user.getUsername(), password)) {
//            return Response.status(403).entity("Passwords don't match.").build();
//        }
//
//        return Response.ok("Passwords match.").build();
//    }
}