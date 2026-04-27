package pt.uc.dei.proj5.dao;

import jakarta.ejb.Stateless;
import jakarta.persistence.TypedQuery;
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


    public List<MessageEntity> getChatHistory(Long user1Id, Long user2Id) {

        // It also orders them chronologically (oldest at the top, newest at the bottom).
        String jpql = "SELECT m FROM MessageEntity m " +
                "WHERE (m.sender.id = :u1 AND m.receiver.id = :u2) " +
                "   OR (m.sender.id = :u2 AND m.receiver.id = :u1) " +
                "ORDER BY m.timestamp ASC";

        TypedQuery<MessageEntity> query = em.createQuery(jpql, MessageEntity.class);
        query.setParameter("u1", user1Id);
        query.setParameter("u2", user2Id);

        return query.getResultList();
    }
}