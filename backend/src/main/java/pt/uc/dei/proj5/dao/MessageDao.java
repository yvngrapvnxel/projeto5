package pt.uc.dei.proj5.dao;

import jakarta.ejb.Stateless;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import pt.uc.dei.proj5.entity.MessageEntity;
import java.io.Serializable;
import java.util.List;

@Stateless
public class MessageDao extends DefaultDao<MessageEntity> implements Serializable {

    public MessageDao() {
        super(MessageEntity.class);
    }

    public void saveMessage(MessageEntity message) {
        persist(message);
    }

    @Transactional
    public int markMessagesAsRead(Long myId, Long theirId) {
        String jpql = "UPDATE MessageEntity m " +
                "SET m.isRead = true " +
                "WHERE m.receiver.id = :myId AND m.sender.id = :theirId AND m.isRead = false";

        Query query = em.createQuery(jpql);

        query.setParameter("myId", myId);
        query.setParameter("theirId", theirId);

        return query.executeUpdate();
    }

    // Returns the full conversation between two users, ordered chronologically (oldest first)
    public List<MessageEntity> getChatHistory(Long user1Id, Long user2Id) {
        String jpql = "SELECT m FROM MessageEntity m " +
                "WHERE (m.sender.id = :u1 AND m.receiver.id = :u2) " +
                "   OR (m.sender.id = :u2 AND m.receiver.id = :u1) " +
                "ORDER BY m.timestamp ASC";

        TypedQuery<MessageEntity> query = em.createQuery(jpql, MessageEntity.class);
        query.setParameter("u1", user1Id);
        query.setParameter("u2", user2Id);

        return query.getResultList();
    }

    // Fetches unread messages for the bell icon's offline notifications (newest first)
    public List<MessageEntity> getAllUnreadMessagesForUser(Long receiverId) {
        String jpql = "SELECT m FROM MessageEntity m " +
                "WHERE m.receiver.id = :receiverId AND m.isRead = false " +
                "ORDER BY m.timestamp DESC";

        TypedQuery<MessageEntity> query = em.createQuery(jpql, MessageEntity.class);
        query.setParameter("receiverId", receiverId);

        return query.getResultList();
    }
}