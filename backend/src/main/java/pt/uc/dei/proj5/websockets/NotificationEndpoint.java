package pt.uc.dei.proj5.websockets;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@ServerEndpoint("/notifications/{ID}")
public class NotificationEndpoint {

    private static final Logger logger = LogManager.getLogger(NotificationEndpoint.class);

    // Map a User ID to a thread-safe Set of active Sessions
    private static final Map<Long, Set<Session>> activeSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("ID") Long ID) {
        activeSessions.computeIfAbsent(ID, k -> ConcurrentHashMap.newKeySet()).add(session);
        logger.info("User connected. ID: " + ID + " | Session: " + session.getId());
    }

    @OnClose
    public void onClose(Session session, @PathParam("ID") Long ID) {
        Set<Session> userSessions = activeSessions.get(ID);
        if (userSessions != null) {
            userSessions.remove(session);
            if (userSessions.isEmpty()) {
                activeSessions.remove(ID);
            }
        }
        logger.info("User disconnected. ID: " + ID + " | Session: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        logger.error("WebSocket error: " + throwable.getMessage(), throwable);
    }

    public static void sendNotification(Long id, String message) {
        Set<Session> userSessions = activeSessions.get(id);

        if (userSessions != null) {
            // Broadcast the message to EVERY open tab this user has
            for (Session session : userSessions) {
                if (session.isOpen()) {
                    try {
                        session.getBasicRemote().sendText(message);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}