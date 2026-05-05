package pt.uc.dei.proj5.dao;


import jakarta.ejb.Stateless;
import pt.uc.dei.proj5.dto.ClientDto;
import pt.uc.dei.proj5.entity.ClientEntity;
import pt.uc.dei.proj5.entity.UserEntity;

import java.io.Serializable;
import java.util.List;


@Stateless
public class ClientDao extends DefaultDao<ClientEntity> implements Serializable {


    public ClientDao() {
        super(ClientEntity.class);
    }


    // Checks for a duplicate active client with the same name+company, excluding the current record (for edits)
    public boolean nameAndCompanyAlreadyExist(String name, String company, Long ID) {
        Long count = em.createQuery(
                        "SELECT COUNT(c) FROM ClientEntity c WHERE LOWER(c.name) = LOWER(:name) AND LOWER(c.company) = LOWER(:company) AND c.isActive = true AND c.id != :ID", Long.class)
                .setParameter("name", name)
                .setParameter("company", company)
                .setParameter("ID", ID)
                .getSingleResult();
        return count > 0;
    }


    public void addClienteDB(ClientDto newClient, UserEntity user) {

        ClientEntity finalClient = new ClientEntity();

        finalClient.setName(newClient.getName());
        finalClient.setEmail(newClient.getEmail());
        finalClient.setPhone(newClient.getPhone());
        finalClient.setCompany(newClient.getCompany());
        finalClient.setUser(user);
        finalClient.setIsActive(true);

        persist(finalClient);
    }


    // Returns all clients for a user, including inactive ones (for admin visibility)
    public List<ClientEntity> getAllUserClients(UserEntity user) {
        return em.createQuery(
                        "SELECT c FROM ClientEntity c WHERE c.users.id = :ID", ClientEntity.class)
                .setParameter("ID", user.getId())
                .getResultList();
    }


    public ClientEntity getClientById(Long ID) {
        return em.find(ClientEntity.class, ID);
    }


    public int updateClient(Long ID, ClientDto newData) {
        return em.createQuery("UPDATE ClientEntity c SET c.name = :name, c.email = :email, c.phone = :phone, c.company = :company WHERE c.id = :ID")
                .setParameter("name", newData.getName())
                .setParameter("email", newData.getEmail())
                .setParameter("phone", newData.getPhone())
                .setParameter("company", newData.getCompany())
                .setParameter("ID", ID)
                .executeUpdate();
    }


    public boolean softDeleteClient(Long ID) {
        ClientEntity clientDB = em.find(ClientEntity.class, ID);
        if (clientDB != null) {
            clientDB.setIsActive(false);
            return true;
        } else {
            return false;
        }
    }


}