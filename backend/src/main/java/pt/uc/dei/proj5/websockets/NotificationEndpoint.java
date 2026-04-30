package pt.uc.dei.proj5.websockets;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/notifications/{ID}")
public class NotificationEndpoint {

    // Map a User ID to a thread-safe Set of active Sessions
    private static final Map<Long, Set<Session>> activeSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("ID") Long ID) {
        activeSessions.computeIfAbsent(ID, k -> ConcurrentHashMap.newKeySet()).add(session);
        System.out.println("User connected. ID: " + ID + " | Session: " + session.getId());
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
        System.out.println("User disconnected. ID: " + ID + " | Session: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("WebSocket error: " + throwable.getMessage());
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