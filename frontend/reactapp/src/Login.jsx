import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import userStore from './stores/userStore';
import { API_URL } from './config';
import './Global.css';


async function request(loginData) {

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const token = await response.text();
            localStorage.setItem('token', token);
            return { text: 'Login successful!', type: 'success' };
        }
        else {
            const errorMsg = await response.text();
            return { text: errorMsg || 'Login failed.', type: 'error' };
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return { text: 'Connection refused.', type: 'error' };
    }
}



const LoginPage = () => {

    const [loginData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const setUser = userStore((state) => state.setUser);


    const handleChange = (e) => {
        setFormData({ ...loginData, [e.target.name]: e.target.value });
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await request(loginData);

        if (result.type === 'success') {
            const token = localStorage.getItem('token');

            try {
                const userResponse = await fetch(`${API_URL}/users/profile`, {
                    headers: { 'token': token }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData); // save in userStore
                    navigate('/dashboard');
                } else {
                    setMessage({ text: "Session started, but profile failed to load.", type: 'error' });
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            }
        } else {
            setMessage(result);
        }
        setIsLoading(false);
    };



    return (
        <div className="auth-wrapper d-flex align-items-center justify-content-center p-3">
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div className="auth-card p-4 p-md-5">

                    <h2 className="auth-title text-center mb-4">LOGIN</h2>

                    <form onSubmit={handleLogin} className="login-form">

                        <div className="form-group mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="form-control form-input"
                                value={loginData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={loginData.password}
                                className="form-control form-input"
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className="btn auth-button w-100">
                            {isLoading ? 'Wait...' : 'Sign In'}
                        </button>


                        <div className="text-center mt-3">
                            <br></br><p>Don't have an account? <Link to="/register" className="fw-bold">Register here</Link></p>
                        </div>

                    </form>

                    {message.text && (
                        <p className={`message mt-3 alert text-center ${message.type === 'error' ? 'alert-dunder-error' : 'alert-dunder-success'}`}>
                            {message.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;