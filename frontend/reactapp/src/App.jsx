import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useRef } from "react";
import { API_URL } from "./config";
import LoginPage from './Login';
import RegisterPage from './Register';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import ClientsPage from './Clients';
import LeadsPage from './Leads';
import ProfilePage from './UserProfile';
import PublicProfile from './PublicProfile';
import AdminPage from './AdminPage';
import {ForgotPassword} from './ForgotPassword';
import useUserStore from "./stores/userStore";
import useNotificationStore from './stores/notifStore';
import './Global.css';
import ChatBox from "./ChatBox";

/* qualquer path sem token redireciona para login */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// 1. Hook de inatividade corrigido (funções movidas para dentro do useEffect)
const useIdleTimeout = (timeoutMinutes = 15) => {
    const timeoutRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Movemos as funções para dentro para evitar o missing dependency warning
        const logoutUser = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            alert("Sessão expirada por inatividade. Por favor, faça login novamente.");
            localStorage.removeItem('token');
            useUserStore.getState().logout();
            window.location.href = '/login';
        };

        const resetTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(logoutUser, timeoutMinutes * 60 * 1000);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        resetTimer();

        events.forEach((event) => window.addEventListener(event, resetTimer));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [timeoutMinutes]);
};


// 2. GlobalApp continua igual
function GlobalApp() {

    const id = useUserStore((state) => state.user.id);
    const addNotification = useNotificationStore((state) => state.addNotification);
    const setNotifications = useNotificationStore((state) => state.setNotifications);

    // Inicia o timer de inatividade (15 minutos)
    useIdleTimeout(15);

    useEffect(() => {
        if (!id || id === 'undefined') {
            return;
        }

        // 1. FETCH OFFLINE NOTIFICATIONS
        const fetchOfflineNotifications = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/chat/offline-notifications`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    }
                });

                if (response.ok) {
                    const offlineData = await response.json();
                    setNotifications(offlineData);
                }
            } catch (error) {
                console.error("Failed to fetch offline notifications:", error);
            }
        };

        fetchOfflineNotifications();

        // 2. THEN CONNECT TO WEBSOCKET FOR LIVE NOTIFICATIONS
        const socket = new WebSocket(`ws://localhost:8080/notifications/${id}`);

        socket.onopen = () => console.log("Connected to WebSocket for notifications.");

        socket.onmessage = (event) => {
            // Live notifications are just plain text strings from your backend
            addNotification(event.data);
        };

        socket.onerror = (error) => console.error("Notification WS Error:", error);

        return () => {
            if (socket.readyState === WebSocket.CONNECTING) {
                socket.addEventListener('open', () => socket.close());
            } else {
                socket.close();
            }
        };
    }, [id, addNotification, setNotifications]);


    return (
        <>
            <Navbar />
            {localStorage.getItem('token') && window.location.pathname !== '/register' ? <ChatBox /> : null}

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/profile/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route
                    path="/"
                    element={
                        localStorage.getItem('token')
                            ? <Navigate to="/dashboard" />
                            : <Navigate to="/login" />
                    }
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <GlobalApp />
        </BrowserRouter>
    );
}

export default App;