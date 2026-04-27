package pt.uc.dei.proj5.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dao.MessageDao;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dao.UserDao;
import pt.uc.dei.proj5.dto.MessageDto;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.MessageEntity;
import pt.uc.dei.proj5.entity.UserEntity;

import java.util.ArrayList;
import java.util.List;

@Path("/chat")
public class ChatService {

    @Inject
    private UserDao userDao;

    @Inject
    private UserBean userBean;

    @Inject
    private MessageDao messageDao;

    @Inject
    private TokenDao tokenDao;


    @GET
    @Path("/users/{senderID}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUsers(@HeaderParam("token") String token,
                             @PathParam("senderID") Long senderID) {

        UserEntity currentUser = tokenDao.getTokensUser(token);

        if (currentUser == null) {
            return Response.status(401).entity("Invalid token.").build();
        }

        List<UserEntity> entityList = userDao.getAllUsers(senderID);

        if (entityList.isEmpty()) {
            return null;
        }

        List<UserDto> usersList = new ArrayList<>();

        for (UserEntity u : entityList) {
            usersList.add(userBean.fromEntityToDto(u));
        }

        return Response.status(200).entity(usersList).build();
    }

    @GET
    @Path("/history/{receiverID}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getChatHistory(@HeaderParam("token") String token,
                                   @PathParam("receiverID") Long receiverID) {


        UserEntity currentUser = tokenDao.getTokensUser(token);

        if (currentUser == null) {
            return Response.status(401).entity("Invalid token.").build();
        }

        List<MessageEntity> messagesDB = messageDao.getChatHistory(currentUser.getId(), receiverID);

        List<MessageDto> chatHistory = new ArrayList<>();
        for (MessageEntity m : messagesDB) {
            chatHistory.add(new MessageDto(
                    m.getSender().getId(),
                    m.getReceiver().getId(),
                    m.getText()
            ));
        }


        return Response.status(200).entity(chatHistory).build();
    }
}