package pt.uc.dei.proj5.service;

import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObjectBuilder;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dao.AdminDao;
import pt.uc.dei.proj5.dao.MessageDao;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dao.UserDao;
import pt.uc.dei.proj5.dto.MessageDto;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.MessageEntity;
import pt.uc.dei.proj5.entity.UserEntity;
import pt.uc.dei.proj5.websockets.ChatEndpoint;
import pt.uc.dei.proj5.websockets.NotificationEndpoint;

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

    @Inject
    private AdminDao adminDao;


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
                    m.getText(),
                    m.getTimestamp() != null ? m.getTimestamp().toString() : null,
                    m.isRead()
            ));
        }

        return Response.status(200).entity(chatHistory).build();
    }

    @PUT
    @Path("/read/{theirId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response markAsRead(@PathParam("theirId") Long theirId,
                               @HeaderParam("token") String token) {
        try {
            UserEntity me = tokenDao.getTokensUser(token);
            if (me == null) {
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

            int updatedCount = messageDao.markMessagesAsRead(me.getId(), theirId);

            return Response.ok("{\"updated\": " + updatedCount + "}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error marking as read").build();
        }
    }

    @POST
    @Path("/send")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response sendMessage(MessageDto messageDto,
                                @HeaderParam("token") String token) {

        try {
            // 1. Authenticate sender using the token
            UserEntity sender = tokenDao.getTokensUser(token);
            if (sender == null) {
                return Response.status(Response.Status.UNAUTHORIZED).entity("Invalid token.").build();
            }

            // 2. Fetch the receiver entity
            UserEntity receiver = adminDao.getUserByID(messageDto.getReceiver());
            if (receiver == null) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Receiver not found.").build();
            }

            // 3. Create and save the message to the database
            MessageEntity newMsg = new MessageEntity();
            newMsg.setSender(sender);
            newMsg.setReceiver(receiver);
            newMsg.setText(messageDto.getText());
            newMsg.setRead(false);

            messageDao.saveMessage(newMsg);


            // 4. Send the real-time WebSocket update to the receiver
            ChatEndpoint.sendRealTimeMessage(sender.getId(), receiver.getId(), messageDto.getText());


            // 5. Send Notification to the bell icon
            String notificationMsg = "New message from " + sender.getUsername() + ": " + messageDto.getText();
            NotificationEndpoint.sendNotification(receiver.getId(), notificationMsg);

            return Response.status(Response.Status.OK).entity("Message sent successfully.").build();

        } catch (Exception e) {
            System.err.println("REST Error sending message: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Failed to send message.").build();
        }
    }

    @GET
    @Path("/offline-notifications")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getOfflineNotifications(@HeaderParam("token") String token) {
        UserEntity currentUser = tokenDao.getTokensUser(token);
        if (currentUser == null) {
            return Response.status(401).entity("Invalid token.").build();
        }

        // You will need to add a method to MessageDao to get all UNREAD messages where the receiver is the currentUser
        List<MessageEntity> unreadMessages = messageDao.getAllUnreadMessagesForUser(currentUser.getId());

        // We will format them into a JSON array that matches your frontend store structure
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

        for (MessageEntity m : unreadMessages) {
            String notificationMsg = "New message from " + m.getSender().getUsername() + ": " + m.getText();

            JsonObjectBuilder notifObj = Json.createObjectBuilder()
                    .add("id", m.getId()) // Use the message ID as the unique key
                    .add("message", notificationMsg)
                    .add("read", false);

            arrayBuilder.add(notifObj);
        }

        return Response.status(200).entity(arrayBuilder.build().toString()).build();
    }
}