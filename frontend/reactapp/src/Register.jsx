import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { API_URL } from './config';
import './Global.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Determine the mode from the URL: 'confirm' (default) or 'reset'
    const mode = searchParams.get('mode') || 'confirm';
    const emailFromUrl = searchParams.get('email') || '';
    const tokenFromUrl = searchParams.get('token');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: emailFromUrl,
        phone: '',
        password: '',
        confirmPassword: '',
        photoUrl: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: 'Passwords do not match!', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        // Determine endpoint and payload based on the mode
        const endpoint = mode === 'reset' ? '/users/reset-password' : '/users/confirm-account';

        const payload = mode === 'reset'
            ? { token: tokenFromUrl, newPassword: formData.password }
            : { ...formData, token: tokenFromUrl }; // Sends all profile data + token

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const successMsg = mode === 'reset'
                    ? "Password reset successfully! You can now log in."
                    : "Account activated successfully! You can now log in.";
                alert(successMsg);
                navigate('/login');
            } else {
                const errorText = await response.text();
                setMessage({ text: errorText || 'Operation failed.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Connection to server failed.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!tokenFromUrl) {
        return (
            <div className="auth-wrapper d-flex align-items-center justify-content-center p-3">
                <div className="auth-card p-4 text-center">
                    <h3 className="text-danger">Invalid Link</h3>
                    <p>No security token found. Please request a new link.</p>
                    <Link to="/login" className="btn auth-button mt-3">Back to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper d-flex align-items-center justify-content-center p-3">
            <div style={{ width: '100%', maxWidth: mode === 'reset' ? '450px' : '700px', marginTop: '40px' }}>
                <div className="auth-card p-4 p-md-5">

                    <h2 className="auth-title text-center mb-4">
                        {mode === 'reset' ? 'NEW PASSWORD' : 'CONFIRM ACCOUNT'}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        {/* ONLY SHOW PROFILE FIELDS IF IN 'CONFIRM' MODE */}
                        {mode === 'confirm' && (
                            <>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label className="form-label">First Name</label>
                                        <input type="text" name="firstName" required className="form-control form-input"
                                               value={formData.firstName} onChange={handleChange} />
                                    </div>
                                    <div className="col">
                                        <label className="form-label">Last Name</label>
                                        <input type="text" name="lastName" required className="form-control form-input"
                                               value={formData.lastName} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-7">
                                        <label className="form-label">Email</label>
                                        <input type="email" name="email" readOnly className="form-control form-input bg-light text-muted"
                                               value={formData.email} />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label">Phone</label>
                                        <input type="tel" name="phone" className="form-control form-input"
                                               value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Profile Photo URL</label>
                                    <input type="url" name="photoUrl" className="form-control form-input"
                                           value={formData.photoUrl} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        {/* PASSWORD FIELDS ARE SHOWN IN BOTH MODES */}
                        <div className={`row mb-4 ${mode === 'reset' ? 'd-flex flex-column gap-3' : ''}`}>
                            <div className="col">
                                <label className="form-label">{mode === 'reset' ? 'New Password' : 'Set Password'}</label>
                                <input type="password" name="password" required className="form-control form-input"
                                       value={formData.password} onChange={handleChange} />
                            </div>
                            <div className="col">
                                <label className="form-label">Confirm Password</label>
                                <input type="password" name="confirmPassword" required className="form-control form-input"
                                       value={formData.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn auth-button w-100 py-2">
                            {isLoading ? 'Processing...' : (mode === 'reset' ? 'Update Password' : 'Activate Account')}
                        </button>

                    </form>

                    {message.text && (
                        <div className={`alert mt-4 text-center border-0 ${message.type === 'error' ? 'alert-dunder-error' : 'alert-dunder-success'}`}>
                            {message.text}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default RegisterPage;