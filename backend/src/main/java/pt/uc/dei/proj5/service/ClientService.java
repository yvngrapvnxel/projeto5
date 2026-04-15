package pt.uc.dei.proj5.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.beans.ClientBean;
import pt.uc.dei.proj5.beans.TokenBean;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dto.ClientDto;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.UserEntity;

import java.util.List;


@Path("/clients")
public class ClientService {


    @Inject
    private ClientBean clientBean;

    @Inject
    private UserBean userBean;

    @Inject
    private TokenBean tokenBean;

    @Inject
    private TokenDao tokenDao;


    // --- ADD NEW CLIENT

    @POST
    @Path("/add")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addNewClient(@HeaderParam("token") String token,
                                 ClientDto newData) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserDto user = userBean.getTokensUser(token);

        if (user == null) {
            return Response.status(404).entity("User not found.").build();
        }

        boolean verifications = clientBean.verifyData(newData);

        if (verifications) {
            return Response.status(400).entity("Incomplete data.").build();
        }

        try {
            // tenta registar o cliente, verifica tb se nome+empresa já existe
            ClientDto newClient = clientBean.newClient(newData, token);
            if (newClient == null) {
                return Response.status(400).entity("This Company's Client is already registered.").build();
            }
            return Response.status(201).entity(newClient).build();
        } catch (Exception e) {
            return Response.status(409).entity(e.getMessage()).build();
        }
    }


    // --- GET ALL CLIENTS

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getClients(@HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(404).entity("User not found.").build();
        }

        List<ClientDto> clients = clientBean.getAllClients(user);

        if (clients == null) {
            return Response.status(404).entity("No clients found.").build();
        }

        return Response.status(200).entity(clients).build();
    }


    // --- EDIT CLIENT

    @PATCH
    @Path("/{ID}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response editClient(@PathParam("ID") Long ID,
                               @HeaderParam("token") String token,
                               ClientDto newData) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(404).entity("User not found.").build();
        }

        boolean verifications = clientBean.verifyData(newData);

        if (verifications) {
            return Response.status(401).entity("Incomplete data.").build();
        }

        ClientDto updated = clientBean.editClient(user, ID, newData);

        if (updated != null) {
            return Response.status(200).entity(updated).build();
        }

        return Response.status(401).entity("Client not found.").build();
    }


    // --- SOFT DELETE CLIENT

    @DELETE
    @Path("/{ID}")
    public Response removeClient(@PathParam("ID") Long ID,
                                 @HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(403).entity("User not found.").build();
        }

        boolean inactive = clientBean.softDeleteClient(user, ID);

        if (inactive) {
            return Response.status(200).entity("Client is now inactive.").build();
        }

        return Response.status(404).entity("Client already inactive or not found. ID: " + ID).build();
    }

}