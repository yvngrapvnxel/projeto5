import useUserStore from "./stores/userStore";


export const API_URL = "http://localhost:8080/rest";


export const handleAuthError = async (response) => {
    const message = await response.text();

    if (message.trim() === 'Invalid token.') {
        alert("Your session has expired. Please log in again.");
        
        localStorage.removeItem('token');
        useUserStore.getState().logout();
        window.location.href = '/login';
        
        return true;
    }
    
    return false;
};