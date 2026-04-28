package pt.uc.dei.proj5.websockets;

import jakarta.inject.Inject;
import jakarta.persistence.Id;
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
import pt.uc.dei.proj5.dao.MessageDao;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.MessageEntity;
import pt.uc.dei.proj5.entity.UserEntity;


@ServerEndpoint("/chat/{id}")
public class ChatEndpoint {

    @Inject
    private AdminDao adminDao;

    @Inject
    private UserBean userBean;

    @Inject
    private MessageDao messageDao;


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
        // Log the exact payload so we know what is triggering events
        System.out.println("WS Received from " + senderID + ": " + jsonMessage);

        try (JsonReader reader = Json.createReader(new StringReader(jsonMessage))) {
            JsonObject incomingJson = reader.readObject();

            // 1. SAFELY extract 'type'
            String type = "MESSAGE"; // default
            if (incomingJson.containsKey("type") && !incomingJson.isNull("type")) {
                type = incomingJson.getString("type");
            }

            // 2. SAFELY extract receiver ID
            Long receiverID = null;
            if (incomingJson.containsKey("receiver") && !incomingJson.isNull("receiver")) {
                try {
                    receiverID = incomingJson.getJsonNumber("receiver").longValue();
                } catch (ClassCastException e) {
                    receiverID = Long.parseLong(incomingJson.getString("receiver"));
                }
            }

            // Abort if the message makes no sense (no receiver)
            if (receiverID == null) {
                System.out.println("Abort: No valid receiver ID found.");
                return;
            }

            // Use equalsIgnoreCase to be safe against accidental casing issues
            if ("READ".equalsIgnoreCase(type.trim())) {
                System.out.println("Processing READ receipt. Updater: " + senderID + ", Target: " + receiverID);

                // Update DB
                messageDao.markMessagesAsRead(senderID, receiverID);

                // Notify original sender
                Session originalSenderSession = chatSessions.get(receiverID);
                if (originalSenderSession != null && originalSenderSession.isOpen()) {
                    JsonObject outgoingJson = Json.createObjectBuilder()
                            .add("type", "READ")
                            .add("readerId", senderID)
                            .build();

                    System.out.println("Forwarding READ receipt to session " + receiverID);
                    originalSenderSession.getBasicRemote().sendText(outgoingJson.toString());
                } else {
                    System.out.println("Target session " + receiverID + " is offline. Skipping real-time forward.");
                }

            } else {
                // --- HANDLE NORMAL TEXT MESSAGE ---

                // 3. SAFELY extract 'text'
                if (!incomingJson.containsKey("text") || incomingJson.isNull("text")) {
                    System.out.println("Abort: Normal message received but no 'text' field was found.");
                    return;
                }
                String text = incomingJson.getString("text");

                UserEntity senderEntity = adminDao.getUserByID(senderID);
                UserEntity receiverEntity = adminDao.getUserByID(receiverID);

                if (senderEntity != null && receiverEntity != null) {
                    MessageEntity newMsg = new MessageEntity();
                    newMsg.setSender(senderEntity);
                    newMsg.setReceiver(receiverEntity);
                    newMsg.setText(text);
                    newMsg.setRead(false);
                    messageDao.saveMessage(newMsg);
                }

                Session receiverSession = chatSessions.get(receiverID);
                if (receiverSession != null && receiverSession.isOpen()) {
                    JsonObject outgoingJson = Json.createObjectBuilder()
                            .add("type", "MESSAGE")
                            .add("sender", senderID)
                            .add("receiver", receiverID)
                            .add("text", text)
                            .build();

                    receiverSession.getBasicRemote().sendText(outgoingJson.toString());
                }

                if (senderEntity != null) {
                    String notificationMsg = "New message from " + senderEntity.getUsername() + ": " + text;
                    NotificationEndpoint.sendNotification(receiverID, notificationMsg);
                }
            }

        } catch (Exception e) {
            System.err.println("Error processing chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // NEW: Helper method so the REST API can trigger a WebSocket push
    public static void sendRealTimeMessage(Long senderId, Long receiverId, String text) {
        Session receiverSession = chatSessions.get(receiverId);

        if (receiverSession != null && receiverSession.isOpen()) {
            try {
                JsonObject outgoingJson = Json.createObjectBuilder()
                        .add("type", "MESSAGE")
                        .add("sender", senderId)
                        .add("receiver", receiverId)
                        .add("text", text)
                        .build();

                receiverSession.getBasicRemote().sendText(outgoingJson.toString());
                System.out.println("REST explicitly pushed message to WS session: " + receiverId);
            } catch (Exception e) {
                System.err.println("Failed to push real-time message from REST: " + e.getMessage());
            }
        }
    }
}