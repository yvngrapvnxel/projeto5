package pt.uc.dei.proj5.service;


import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.beans.LeadBean;
import pt.uc.dei.proj5.beans.TokenBean;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dto.LeadDto;
import pt.uc.dei.proj5.dto.OwnerDto;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.UserEntity;

import java.util.List;

//test


@Path("/leads")
public class LeadService {


    @Inject
    private LeadBean leadBean;

    @Inject
    private UserBean userBean;

    @Inject
    private TokenBean tokenBean;

    @Inject
    private TokenDao tokenDao;


    // --- ADD NEW LEAD

    @POST
    @Path("/add")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addNewLead(@HeaderParam("token") String token,
                            LeadDto newData) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        if (newData == null) {
            return Response.status(401).entity("Incomplete data.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(401).entity("User not found.").build();
        }


        try {
            UserDto u = userBean.fromEntityToDto(user);
            OwnerDto owner = new OwnerDto(u.getId(), u.getUsername(), u.isAdmin());
            newData.setUser(owner);
            LeadDto lead = leadBean.createLead(newData);
            return Response.status(201).entity(lead).build();
        } catch (Exception e) {
            return Response.status(409).entity(e.getMessage()).build();
        }
    }


    // --- GET ALL LEADS

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeads(@HeaderParam("token") String token) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(401).entity("User not found.").build();
        }

        List<LeadDto> leads = leadBean.getAllLeads(user.getId());
        if (leads == null) {
            return Response.status(401).entity("No leads found.").build();
        }
        return Response.status(200).entity(leads).build();
    }


    // --- EDIT LEAD

    @PATCH
    @Path("/{ID}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response editLead(@PathParam("ID") Long ID,
                             @HeaderParam("token") String token,
                             LeadDto newData) {

        // verificar se token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        if (newData == null || newData.getTitle() == null || newData.getTitle().trim().isEmpty() || newData.getDescription() == null || newData.getDescription().trim().isEmpty()) {
            return Response.status(400).entity("Incomplete data.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(403).entity("User not found.").build();
        }

        LeadDto updated = leadBean.editLead(user, ID, newData);

        if (updated != null) {
            return Response.status(200).entity(updated).build();
        }

        return Response.status(403).entity("Forbidden.").build();
    }


    // --- SOFT DELETE LEAD

    @DELETE
    @Path("/{ID}")
    public Response softDeleteLead(@PathParam("ID") Long ID,
                                   @HeaderParam("token") String token) {

        // verificar se o token está válido
        if (tokenBean.invalidToken(token)) {
            return Response.status(400).entity("Invalid token.").build();
        }

        UserEntity user = tokenDao.getTokensUser(token);

        if (user == null) {
            return Response.status(403).entity("User not found.").build();
        }

        boolean inactive = leadBean.softDeleteLead(user, ID);

        if (inactive) {
            return Response.status(200).entity("Lead is now inactive.").build();
        }

        return Response.status(404).entity("Lead already inactive or not found. ID: " + ID).build();
    }

}