package pt.uc.dei.proj5.dao;


import jakarta.ejb.TransactionAttribute;
import jakarta.ejb.TransactionAttributeType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.io.Serializable;


@TransactionAttribute(TransactionAttributeType.REQUIRED)
public abstract class DefaultDao<T extends Serializable> implements Serializable {

    private static final long serialVersionUID = 1L;

    private final Class<T> clazz;

    @PersistenceContext(unitName = "projeto5")
    public EntityManager em;


    public DefaultDao(Class<T> clazz) {
        this.clazz = clazz;
    }

    public void persist(T entity) {
        em.persist(entity);
    }

    public T merge(T entity) {
        return em.merge(entity);
    }

    public void remove(T entity) {
        em.remove(em.contains(entity) ? entity : em.merge(entity));
    }
}