import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from './config';
import './Global.css';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(email)
            });

            if (res.ok) {
                setMessage({ text: "Recovery link sent! Please check your email (MailHog).", type: 'success' });
            } else {
                setMessage({ text: "Failed to send recovery link. Check if the email is correct.", type: 'error' });
            }
        } catch (error) {
            setMessage({ text: "Connection error.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper d-flex align-items-center justify-content-center p-3">
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div className="auth-card p-4 p-md-5">

                    <h2 className="auth-title text-center mb-4">RECOVER PASSWORD</h2>

                    <p className="text-center text-muted small mb-4">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleResetRequest}>
                        <div className="form-group mb-4">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className="btn auth-button w-100">
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    {message.text && (
                        <p className={`message mt-3 alert text-center ${message.type === 'error' ? 'alert-dunder-error' : 'alert-dunder-success'}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/login" className="fw-bold" style={{ color: '#2D5A88', textDecoration: 'none' }}>
                            <i className="bi bi-arrow-left me-1"></i> Back to Login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;