import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from "react";
import LoginPage from './Login';
import RegisterPage from './Register';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import ClientsPage from './Clients';
import LeadsPage from './Leads';
import ProfilePage from './UserProfile';
import AdminPage from './AdminPage';
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


function App() {

    const id = useUserStore((state) => state.user.id);
    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {

        if (!id) return;

        // 'ws://' instead of 'http://'
        const socket = new WebSocket(`ws://localhost:8080/notifications/${id}`);


        socket.onopen = () => {
            console.log("Connected to WebSocket for notifications.");
        };


        socket.onmessage = (event) => {
            addNotification(event.data);
        };


        return () => {
            if (socket.readyState === WebSocket.CONNECTING) {
                // If it's still connecting, wait for it to open, then close it safely
                socket.addEventListener('open', () => socket.close());
            } else {
                // Otherwise, close it normally
                socket.close();
            }
        };
    }, [id, addNotification]);


    return (
        <BrowserRouter>

            <Navbar />
            <ChatBox />

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* user profile */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                {/* dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* clientes */}
                <Route path="/clients" element={
                    <ProtectedRoute>
                        <ClientsPage />
                    </ProtectedRoute>
                }
                />

                {/* leads */}
                <Route path="/leads" element={
                    <ProtectedRoute>
                        <LeadsPage />
                    </ProtectedRoute>
                }
                />

                {/* admin */}
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminPage />
                    </ProtectedRoute>
                }
                />


                {/* no path consoante token */}
                <Route
                    path="/"
                    element={
                        localStorage.getItem('token')
                            ? <Navigate to="/dashboard" />
                            : <Navigate to="/login" />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}


export default App;