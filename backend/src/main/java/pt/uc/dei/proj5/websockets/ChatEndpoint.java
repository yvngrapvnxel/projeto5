package pt.uc.dei.proj5.websockets;

import jakarta.inject.Inject;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import java.io.StringReader;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import pt.uc.dei.proj5.bean.UserBean;
import pt.uc.dei.proj5.dao.AdminDao;
import pt.uc.dei.proj5.dao.MessageDao;
import pt.uc.dei.proj5.entity.MessageEntity;
import pt.uc.dei.proj5.entity.UserEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@ServerEndpoint("/chat/{id}")
public class ChatEndpoint {

    private static final Logger logger = LogManager.getLogger(ChatEndpoint.class);

    @Inject
    private AdminDao adminDao;

    @Inject
    private UserBean userBean;

    @Inject
    private MessageDao messageDao;

    // CHANGED: Now maps a User ID to a Set of Sessions to support multiple tabs
    private static final Map<Long, Set<Session>> chatSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("id") Long senderID) {
        // Create the Set if it doesn't exist, then add the new tab's session
        chatSessions.computeIfAbsent(senderID, k -> ConcurrentHashMap.newKeySet()).add(session);
        logger.info("User joined chat. ID: " + senderID + " | Session: " + session.getId());
    }

    @OnClose
    public void onClose(Session session, @PathParam("id") Long senderID) {
        Set<Session> userSessions = chatSessions.get(senderID);
        if (userSessions != null) {
            userSessions.remove(session);
            if (userSessions.isEmpty()) {
                chatSessions.remove(senderID);
            }
        }
        logger.info("User left chat. ID: " + senderID + " | Session: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        logger.error("Chat WebSocket error: " + throwable.getMessage(), throwable);
    }

    @OnMessage
    public void onMessage(String jsonMessage, @PathParam("id") Long senderID) {
        logger.debug("WS Received from " + senderID + ": " + jsonMessage);

        try (JsonReader reader = Json.createReader(new StringReader(jsonMessage))) {
            JsonObject incomingJson = reader.readObject();

            String type = null;
            if (incomingJson.containsKey("type") && !incomingJson.isNull("type")) {
                type = incomingJson.getString("type");
            }

            Long receiverID = null;
            if (incomingJson.containsKey("receiver") && !incomingJson.isNull("receiver")) {
                try {
                    receiverID = incomingJson.getJsonNumber("receiver").longValue();
                } catch (ClassCastException e) {
                    receiverID = Long.parseLong(incomingJson.getString("receiver"));
                }
            }

            if (receiverID == null) {
                logger.warn("Abort: No valid receiver ID found.");
                return;
            }

            if ("READ".equalsIgnoreCase(type != null ? type.trim() : "")) {
                logger.debug("Processing READ receipt. Updater: " + senderID + ", Target: " + receiverID);

                messageDao.markMessagesAsRead(senderID, receiverID);

                // CHANGED: Send READ receipt to ALL open tabs of the original sender
                Set<Session> originalSenderSessions = chatSessions.get(receiverID);
                if (originalSenderSessions != null) {
                    JsonObject outgoingJson = Json.createObjectBuilder()
                            .add("type", "READ")
                            .add("readerId", senderID)
                            .build();

                    for (Session s : originalSenderSessions) {
                        if (s.isOpen()) {
                            s.getBasicRemote().sendText(outgoingJson.toString());
                        }
                    }
                } else {
                    logger.debug("Target session " + receiverID + " is offline. Skipping real-time forward.");
                }

            } else {
                if (!incomingJson.containsKey("text") || incomingJson.isNull("text")) {
                    logger.warn("Abort: Normal message received but no 'text' field was found.");
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

                // CHANGED: Send MESSAGE to ALL open tabs of the receiver
                Set<Session> receiverSessions = chatSessions.get(receiverID);
                if (receiverSessions != null) {
                    JsonObject outgoingJson = Json.createObjectBuilder()
                            .add("type", "MESSAGE")
                            .add("sender", senderID)
                            .add("receiver", receiverID)
                            .add("text", text)
                            .build();

                    for (Session s : receiverSessions) {
                        if (s.isOpen()) {
                            s.getBasicRemote().sendText(outgoingJson.toString());
                        }
                    }
                }

                if (senderEntity != null) {
                    String notificationMsg = "New message from " + senderEntity.getUsername() + ": " + text;
                    NotificationEndpoint.sendNotification(receiverID, notificationMsg);
                }
            }

        } catch (Exception e) {
            logger.error("Error processing chat message: " + e.getMessage(), e);
        }
    }

    // Helper method so the REST API can trigger a WebSocket push
    public static void sendRealTimeMessage(Long senderId, Long receiverId, String text) {
        // CHANGED: Send REST push to ALL open tabs of the receiver
        Set<Session> receiverSessions = chatSessions.get(receiverId);

        if (receiverSessions != null) {
            try {
                JsonObject outgoingJson = Json.createObjectBuilder()
                        .add("type", "MESSAGE")
                        .add("sender", senderId)
                        .add("receiver", receiverId)
                        .add("text", text)
                        .build();

                for (Session s : receiverSessions) {
                    if (s.isOpen()) {
                        s.getBasicRemote().sendText(outgoingJson.toString());
                    }
                }
                logger.debug("REST explicitly pushed message to WS sessions of user: " + receiverId);
            } catch (Exception e) {
                logger.error("Failed to push real-time message from REST: " + e.getMessage(), e);
            }
        }
    }
}