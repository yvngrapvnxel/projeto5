import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import userStore from './stores/userStore';
import { API_URL } from './config';
import './Global.css';

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user, setUser } = userStore();
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        ...user,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingLang, setLoadingLang] = useState(false);
    const [stats, setStats] = useState({ totalLeads: 0, totalClients: 0, wonLeads: 0 });

    React.useEffect(() => {
        document.body.classList.add('profile-bg');
        return () => {
            document.body.classList.remove('profile-bg');
        };
    }, []);

    React.useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/users/profile/stats`, {
                    headers: { 'token': token }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to load user stats", err);
            }
        };
        fetchStats();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLanguageChange = async (newLang) => {
        setLoadingLang(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/language`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({ lang: newLang })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
            } else {
                const errorMsg = await response.text();
                alert("Error updating language: " + errorMsg);
            }
        } catch (err) {
            console.error("Language update error:", err);
            alert(t('profile.connectionError'));
        } finally {
            setLoadingLang(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword) {
            alert(t('profile.enterCurrentToAuthorize'));
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            alert(t('profile.passwordsDoNotMatch'));
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        const payload = {};

        if (formData.firstName) payload.firstName = formData.firstName;
        if (formData.lastName) payload.lastName = formData.lastName;
        if (formData.email) payload.email = formData.email;
        if (formData.photoUrl) payload.photoUrl = formData.photoUrl;
        if (formData.phone) payload.phone = formData.phone;
        if (formData.lang) payload.lang = formData.lang;

        if (formData.newPassword && formData.newPassword.trim() !== "") {
            payload.password = formData.newPassword;
        }

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                    'confirmationPassword': formData.currentPassword
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setShowModal(false);
                alert(t('profile.profileUpdated'));
            } else {
                const errorMsg = await response.text();
                alert("Error: " + errorMsg);
            }
        } catch (err) {
            console.error("The error is actually:", err);
            alert(t('profile.connectionError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="container py-5">
                <div className="row justify-content-center">
                    
                    <div className="col-md-3 mb-4">
                        <div className="d-flex flex-column gap-3 mt-md-4">
                            <div className="glass-card border-0 p-3 position-relative overflow-hidden" style={{ backgroundColor: '#0D1B33' }}>
                                <i className="bi bi-buildings-fill position-absolute" style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.1)', right: '-10px', bottom: '-10px', zIndex: 0 }}></i>
                                <h6 className="text-white fw-bold text-uppercase mb-1 position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1, opacity: 0.85 }}>{t('profile.statsClients', 'Total Clients')}</h6>
                                <h3 className="text-white mb-0 fw-bold position-relative" style={{ zIndex: 1 }}>{stats.totalClients}</h3>
                            </div>
                            
                            <div className="glass-card border-0 p-3 position-relative overflow-hidden" style={{ backgroundColor: '#285182' }}>
                                <i className="bi bi-bullseye position-absolute" style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.1)', right: '-10px', bottom: '-10px', zIndex: 0 }}></i>
                                <h6 className="text-white fw-bold text-uppercase mb-1 position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1, opacity: 0.85 }}>{t('profile.statsLeads', 'Total Leads')}</h6>
                                <h3 className="text-white mb-0 fw-bold position-relative" style={{ zIndex: 1 }}>{stats.totalLeads}</h3>
                            </div>
                            
                            <div className="glass-card border-0 p-3 position-relative overflow-hidden" style={{ backgroundColor: '#5285B8' }}>
                                <i className="bi bi-trophy-fill position-absolute" style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.1)', right: '-10px', bottom: '-10px', zIndex: 0 }}></i>
                                <h6 className="text-white fw-bold text-uppercase mb-1 position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1, opacity: 0.85 }}>{t('profile.statsWon', 'Won Leads')}</h6>
                                <h3 className="text-white mb-0 fw-bold position-relative" style={{ zIndex: 1 }}>{stats.wonLeads}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-5">
                        <div className="glass-card shadow-sm border-0 p-4">
                            <div className="text-center mb-4">
                                <img src={user.photoUrl || '/default-user.png'} alt="Profile" className="rounded-circle mb-3 shadow-sm" style={{ width: '130px', height: '130px', objectFit: 'cover', border: '4px solid #3C78B4' }} />
                                <h3 className="fw-bold mb-0">{user.firstName} {user.lastName}</h3>
                                <span className="badge bg-light text-primary border">@{user.username}</span>
                            </div>
                            <div className="border-top pt-4 px-2">
                                <div className="mb-3">
                                    <label className="text-muted small fw-bold text-uppercase">{t('profile.email')}</label>
                                    <p className="mb-0 fw-semibold">{user.email || 'N/A'}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small fw-bold text-uppercase">{t('profile.phone')}</label>
                                    <p className="mb-0 fw-semibold">{user.phone || 'N/A'}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small fw-bold text-uppercase mb-2">{t('profile.preferredLanguage')}</label>
                                    <select
                                        className="form-select w-auto fw-semibold"
                                        value={user.lang || 'en'}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        disabled={loadingLang}
                                    >
                                        <option value="en">English (EN)</option>
                                        <option value="pt">Portuguese (PT)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="btn w-100 fw-bold text-white" style={{ backgroundColor: '#2D5A88' }}
                                        onClick={() => { setFormData({ ...user, currentPassword: '', newPassword: '', confirmNewPassword: '' }); setShowModal(true); }}>
                                    {t('profile.editProfile')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content border-0">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Edit Account</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <form onSubmit={handleUpdate}>
                                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                                    <h6 className="fw-bold mb-3" style={{ color: `#2D5A88` }}>{t('profile.generalInfo')}</h6>

                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label small text-muted mb-1">{t('profile.firstName')}</label>
                                            <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
                                        </div>
                                        <div className="col">
                                            <label className="form-label small text-muted mb-1">{t('profile.lastName')}</label>
                                            <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label small text-muted mb-1">{t('profile.email')}</label>
                                            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className="col">
                                            <label className="form-label small text-muted mb-1">{t('profile.phone')}</label>
                                            <input type="text" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-8">
                                            <label className="form-label small text-muted mb-1">Photo URL</label>
                                            <input type="url" name="photoUrl" className="form-control" value={formData.photoUrl} onChange={handleChange} />
                                        </div>
                                        <div className="col-4">
                                            <label className="form-label small text-muted mb-1">{t('profile.language')}</label>
                                            <select
                                                name="lang"
                                                className="form-select"
                                                value={formData.lang}
                                                onChange={handleChange}
                                            >
                                                <option value="en">English</option>
                                                <option value="pt">Português</option>
                                            </select>
                                        </div>
                                    </div>

                                    <hr />

                                    <h6 className="fw-bold mb-3" style={{ color: `#2D5A88` }}>{t('profile.security')}</h6>
                                    <div className="p-3 bg-light rounded border mb-3">
                                        <label className="form-label small fw-bold">{t('profile.changePassword')}<br></br>{t('profile.changePasswordHint')}</label>
                                        <input type="password" name="newPassword"
                                               className="form-control mb-2" placeholder={t('profile.newPassword')}
                                               value={formData.newPassword} onChange={handleChange} />
                                        <input type="password" name="confirmNewPassword"
                                               className="form-control" placeholder={t('profile.confirmNewPassword')}
                                               value={formData.confirmNewPassword} onChange={handleChange} />
                                    </div>

                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-danger">{t('profile.confirmIdentity')}</label>
                                        <input type="password" name="currentPassword"
                                               className="form-control border-danger"
                                               placeholder={t('profile.enterCurrentPassword')}
                                               value={formData.currentPassword} onChange={handleChange} required />
                                    </div>

                                </div>

                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('profile.cancel')}</button>
                                    <button type="submit" className="btn text-white fw-bold" disabled={loading} style={{ backgroundColor: '#2D5A88' }}>
                                        {loading ? t('profile.processing') : t('profile.saveUpdates')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;