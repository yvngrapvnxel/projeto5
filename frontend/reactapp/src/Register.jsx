import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from './config';
import './Global.css';


const RegisterPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        photoUrl: 'https://i.etsystatic.com/32551762/r/il/701cc5/3525927780/il_1588xN.3525927780_7lmz.jpg'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        const phoneRegex = /^(\+[0-9]{7,15}|[29][0-9]{6,14})$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            setMessage({ text: 'Please enter a valid phone number (7-15 digits).', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Account created successfully!");
                navigate('/login');
            } else {
                const errorText = await response.text();
                setMessage({ text: errorText || 'Registration failed.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Connection to server failed.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="auth-wrapper d-flex align-items-center justify-content-center p-3">
            <div style={{ width: '100%', maxWidth: '700px', marginTop: '40px' }}>
                <div className="auth-card p-4 p-md-5">

                    <h2 className="auth-title text-center mb-4">CREATE NEW ACCOUNT</h2>

                    <form onSubmit={handleRegister}>

                        {/* first and last name*/}
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

                        {/* email and phone number */}
                        <div className="row mb-3">
                            <div className="col-md-7">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" required className="form-control form-input"
                                    value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label">Phone</label>
                                <input type="tel" name="phone" required className="form-control form-input"
                                    value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>

                        {/* username and password */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label">Username</label>
                                <input type="text" name="username" required className="form-control form-input"
                                    value={formData.username} onChange={handleChange} />
                            </div>
                            <div className="col">
                                <label className="form-label">Password</label>
                                <input type="password" name="password" required className="form-control form-input"
                                    value={formData.password} onChange={handleChange} />
                            </div>
                        </div>

                        {/* photo url */}
                        <div className="mb-4">
                            <label className="form-label">Profile Photo URL</label>
                            <input type="url" name="photoUrl" className="form-control form-input"
                                value={formData.photoUrl} onChange={handleChange} />
                        </div>

                        <button type="submit" disabled={isLoading} className="btn btn-primary auth-button w-100 py-2">
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>

                    </form>

                    {message.text && (
                        <div className={`alert mt-3 ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                            {message.text}
                        </div>
                    )}


                    <div className="text-center mt-3">
                        <p>Already have an account? <Link to="/login" className="fw-bold">Login here</Link></p>
                    </div>

                </div>
            </div>
        </div>

    );
};

export default RegisterPage;