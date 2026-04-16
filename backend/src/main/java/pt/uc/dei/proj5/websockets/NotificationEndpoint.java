package pt.uc.dei.proj5.websockets;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import pt.uc.dei.proj5.beans.UserBean;
import pt.uc.dei.proj5.dto.UserDto;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// The URL frontend will use to connect. We include a token to know WHO is connecting.
@ServerEndpoint("/notifications/{ID}")
public class NotificationEndpoint {

    private static UserBean userBean;

    // A thread-safe map to store active connections (Sessions) for each user
    private static final Map<Long, Session> activeSessions = new ConcurrentHashMap<>();


    @OnOpen
    public void onOpen(Session session, @PathParam("ID") Long ID) {
        activeSessions.put(ID, session);
        System.out.println("User connected to WebSocket. ID: " + ID);
    }

    @OnClose
    public void onClose(Session session, @PathParam("ID") Long ID) {
        activeSessions.remove(ID);
        System.out.println("User disconnected. ID: " + ID);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("WebSocket error: " + throwable.getMessage());
    }


    public static void sendNotification(Long id, String message) {
        Session session = activeSessions.get(id);
        if (session != null && session.isOpen()) {
            try {
                // Send the message to the specific user's frontend
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}