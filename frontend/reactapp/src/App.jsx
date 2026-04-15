import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Login';
import RegisterPage from './Register';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import ClientsPage from './Clients';
import LeadsPage from './Leads';
import ProfilePage from './UserProfile';
import AdminPage from './AdminPage';
import './Global.css';

/* qualquer path sem token redireciona para login */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};


function App() {
    return (
        <BrowserRouter>

            <Navbar />

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