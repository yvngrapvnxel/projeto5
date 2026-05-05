import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';
import './Global.css';

const RegisterPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const mode = searchParams.get('mode') || 'confirm';
    const emailFromUrl = searchParams.get('email') || '';
    const tokenFromUrl = searchParams.get('token');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
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
            setMessage({ text: t('auth.passwordsDoNotMatch'), type: 'error' });
            return;
        }

        if (mode === 'confirm' && (!formData.email || !formData.phone)) {
            setMessage({ text: t('auth.inputMissing'), type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        const endpoint = mode === 'reset' ? '/users/reset-password' : '/users/confirm-account';

        const payload = mode === 'reset'
            ? { token: tokenFromUrl, newPassword: formData.password }
            : { ...formData, token: tokenFromUrl };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log(payload);
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
                    <h3 className="text-danger">{t('auth.invalidLink')}</h3>
                    <p>{t('auth.noSecurityToken')}</p>
                    <Link to="/login" className="btn auth-button mt-3">{t('auth.backToLogin')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper d-flex align-items-center justify-content-center p-3">
            <div style={{ width: '100%', maxWidth: mode === 'reset' ? '450px' : '700px', marginTop: '40px' }}>
                <div className="auth-card p-4 p-md-5">

                    <h2 className="auth-title text-center mb-4">
                        {mode === 'reset' ? t('auth.newPassword') : t('auth.confirmAccount')}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        {mode === 'confirm' && (
                            <>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label className="form-label">{t('auth.firstName')}</label>
                                        <input type="text" name="firstName" required className="form-control form-input"
                                               value={formData.firstName} onChange={handleChange} />
                                    </div>
                                    <div className="col">
                                        <label className="form-label">{t('auth.lastName')}</label>
                                        <input type="text" name="lastName" required className="form-control form-input"
                                               value={formData.lastName} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">{t('auth.chooseUsername')}</label>
                                    <input type="text" name="username" required className="form-control form-input"
                                           value={formData.username} onChange={handleChange} />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-7">
                                        <label className="form-label">{t('auth.email')}</label>
                                        <input type="email" name="email" readOnly className="form-control form-input bg-light text-muted"
                                               value={formData.email} />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label">{t('auth.phone')}</label>
                                        <input type="tel" name="phone" className="form-control form-input"
                                               value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">{t('auth.photoUrl')}</label>
                                    <input type="url" name="photoUrl" className="form-control form-input"
                                           value={formData.photoUrl} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        <div className={`row mb-4 ${mode === 'reset' ? 'd-flex flex-column gap-3' : ''}`}>
                            <div className="col">
                                <label className="form-label">{mode === 'reset' ? t('auth.newPassword') : t('auth.setPassword')}</label>
                                <input type="password" name="password" required className="form-control form-input"
                                       value={formData.password} onChange={handleChange} />
                            </div>
                            <div className="col">
                                <label className="form-label">{t('auth.confirmPassword')}</label>
                                <input type="password" name="confirmPassword" required className="form-control form-input"
                                       value={formData.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn auth-button w-100 py-2">
                            {isLoading ? t('auth.processing') : (mode === 'reset' ? t('auth.updatePassword') : t('auth.activateAccount'))}
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