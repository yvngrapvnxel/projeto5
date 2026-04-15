package pt.uc.dei.proj5.service;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.beans.TokenBean;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dto.UserDto;


@Path("/users")
public class UserService {


    @Inject
    UserBean userBean;

    @Inject
    TokenBean tokenBean;


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


    // --- REGISTER

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response register(UserDto newUser) {

        boolean success = userBean.register(newUser);

        if (!success) {
            return Response.status(404).entity("There was an error registering a new user.").build();
        }

        return Response.status(201).entity("User registered successfully!").build();

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