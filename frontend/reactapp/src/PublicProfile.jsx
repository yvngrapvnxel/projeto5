import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';
import './Global.css';

const PublicProfile = () => {
    const { username } = useParams();
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.body.classList.add('profile-bg');
        return () => {
            document.body.classList.remove('profile-bg');
        };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/users/public/${username}`, {
                    headers: { 'token': token }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch public profile", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="dashboard-wrapper d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="dashboard-wrapper d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <h1 className="text-white fw-bold bg-danger p-3 rounded shadow-sm">{t('adminPage.forbidden')}</h1>
            </div>
        );
    }

    const { stats } = profile;

    return (
        <div className="dashboard-container">
            <div className="container py-5">
                <div className="row justify-content-center">
                    
                    {/* STATS CARDS */}
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
                        <div className="glass-card shadow-sm border-0 p-4 h-100 d-flex flex-column align-items-center justify-content-center">
                            <div className="text-center mb-4">
                                <img src={profile.photoUrl || '/default-user.png'} alt="Profile" className="rounded-circle mb-3 shadow-sm" style={{ width: '150px', height: '150px', objectFit: 'cover', border: '5px solid #3C78B4' }} />
                                <h2 className="fw-bold mb-1" style={{ color: '#16264A' }}>{profile.firstName} {profile.lastName}</h2>
                                <span className="badge bg-light text-primary border fs-6 py-2 px-3 mt-2">@{profile.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
