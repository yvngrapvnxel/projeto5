package pt.uc.dei.proj5.beans;


import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import pt.uc.dei.proj5.dao.ClientDao;
import pt.uc.dei.proj5.dao.TokenDao;
import pt.uc.dei.proj5.dto.ClientDto;
import pt.uc.dei.proj5.dto.OwnerDto;
import pt.uc.dei.proj5.dto.UserDto;
import pt.uc.dei.proj5.entity.ClientEntity;
import pt.uc.dei.proj5.entity.UserEntity;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Stateless
public class ClientBean implements Serializable {


    @Inject
    ClientDao clientDao;

    @Inject
    TokenDao tokenDao;

    @Inject
    UserBean userBean;


    // --- REGISTER NEW CLIENT

    public ClientDto newClient(ClientDto newClient, String token) {

        UserEntity user = tokenDao.getTokensUser(token);
        if (user == null) {
            return null;
        }

        String name = newClient.getName();
        String company = newClient.getCompany();

        if (clientDao.nameAndCompanyAlreadyExist(name, company, null)) {
            return null;
        }

        clientDao.addClienteDB(newClient, user);

        return newClient;
    }


    // --- ENTITY TO DTO

    public ClientDto fromEntityToDto(ClientEntity e) {
        ClientDto client = new ClientDto();

        client.setId(e.getId());
        client.setName(e.getName());
        client.setPhone(e.getPhone());
        client.setEmail(e.getEmail());
        client.setCompany(e.getCompany());

        if (e.getUser() != null) {
            UserDto u = userBean.fromEntityToDto(e.getUser());
            OwnerDto owner = new OwnerDto(u.getId(), u.getUsername(), u.isAdmin());
            client.setUser(owner);
        } else {
            client.setUser(null);
        }

        client.setActive(e.isActive());

        return client;
    }


    // --- DATA VERIFICATIONS

    public boolean verifyData(ClientDto dto) {

        // validar campos obrigatórios
        boolean noName = dto.getName() == null || dto.getName().trim().isEmpty();
        boolean noCompany = dto.getCompany() == null || dto.getCompany().trim().isEmpty();
        boolean noEmail = dto.getEmail() == null || dto.getEmail().trim().isEmpty();
        boolean noPhone = dto.getPhone() == null || dto.getPhone().trim().isEmpty();

        return (noName || noCompany || (noEmail && noPhone));
    }


    // --- GET USER CLIENTS

    public List<ClientDto> getAllClients(UserEntity user) {

        if (user == null) {
            return null;
        }

        List<ClientEntity> entities = clientDao.getAllUserClients(user);

        if (entities.isEmpty()) {
            return null;
        }

        List<ClientDto> myClients = new ArrayList<>();

        for (ClientEntity client : entities) {
            myClients.add(fromEntityToDto(client));
        }

        return myClients;
    }


    // --- EDIT CLIENT

    public ClientDto editClient(UserEntity user, Long ID, ClientDto newData) {

        ClientEntity client = clientDao.getClientById(ID);

        if (client == null) {
            return null;
        }

        if (clientDao.nameAndCompanyAlreadyExist(newData.getName(), newData.getCompany(), newData.getId())) {
            return null;
        }

        if (user.isAdmin() || client.getUser().getId().equals(user.getId())) {
            int rows = clientDao.updateClient(ID, newData);
            if (rows > 0) {
                return fromEntityToDto(clientDao.getClientById(ID));
            }
        }

        return null;
    }


    // --- SOFT DELETE CLIENT

    public boolean softDeleteClient(UserEntity user, Long ID) {

        ClientEntity client = clientDao.getClientById(ID);

        if (client == null) {
            return false;
        }

        System.out.println("client: " + client.getName());

        if (user.isAdmin() || client.getUser().getId().equals(user.getId())) {
            return clientDao.softDeleteClient(ID);
        }

        return false;
    }

}