package pt.uc.dei.proj5.websockets;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import java.io.StringReader;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dao.AdminDao;
import pt.uc.dei.proj5.dto.UserDto;


@ServerEndpoint("/chat/{id}")
public class ChatEndpoint {

    private static AdminDao adminDao;
    private static UserBean userBean;
    private static final Map<Long, Session> chatSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("id") Long senderID) {
        chatSessions.put(senderID, session);
        System.out.println("User joined chat. ID: " + senderID);
    }

    @OnClose
    public void onClose(Session session, @PathParam("id") Long senderID) {
        chatSessions.remove(senderID);
        System.out.println("User left chat. ID: " + senderID);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("Chat WebSocket error: " + throwable.getMessage());
    }

    @OnMessage
    public void onMessage(String jsonMessage, @PathParam("id") Long senderID) {
        try (JsonReader reader = Json.createReader(new StringReader(jsonMessage))) {
            // Read the JSON sent from React: {"receiver": {id}, "text": "hello"}
            JsonObject incomingJson = reader.readObject();
            Long receiverID = incomingJson.getJsonNumber("receiver").longValue();
            String text = incomingJson.getString("text");

            // 1. Send the message directly to the receiver's Chat Window (if they have it open)
            Session receiverSession = chatSessions.get(receiverID);
            if (receiverSession != null && receiverSession.isOpen()) {

                // Build the outgoing JSON: {"sender": "admin", "text": "hello"}
                JsonObject outgoingJson = Json.createObjectBuilder()
                        .add("sender", senderID)
                        .add("text", text)
                        .build();

                receiverSession.getBasicRemote().sendText(outgoingJson.toString());
            }

            UserDto user = userBean.fromEntityToDto(adminDao.getUserByID(senderID));
            // 2. ALSO trigger the Bell Notification! (This connects your two systems)
            String notificationMsg = "New message from " + user.getUsername() + ": " + text;
            NotificationEndpoint.sendNotification(receiverID, notificationMsg);

        } catch (Exception e) {
            System.err.println("Error processing chat message: " + e.getMessage());
        }
    }
}