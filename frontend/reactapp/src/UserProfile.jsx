import React, { useState } from 'react';
import userStore from './stores/userStore';
import { API_URL } from './config';
import './Global.css';

const ProfilePage = () => {
    const { user, setUser } = userStore();
    const [showModal, setShowModal] = useState(false);


    const [formData, setFormData] = useState({
        ...user,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword) {
            alert("Please enter your current password to authorize changes.");
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            alert("New passwords do not match!");
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
                alert("Profile updated successfully!");
            } else {
                const errorMsg = await response.text();
                alert("Error: " + errorMsg);
            }
        } catch (err) {
            console.error("The error is actually:", err);
            alert("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card shadow-sm border-0 p-4">
                            <div className="text-center mb-4">
                                <img src={user.photoUrl || '/default-user.png'} alt="Profile" className="rounded-circle mb-3 shadow-sm" style={{ width: '130px', height: '130px', objectFit: 'cover', border: '4px solid #3C78B4' }} />
                                <h3 className="fw-bold mb-0">{user.firstName} {user.lastName}</h3>
                                <span className="badge bg-light text-primary border">@{user.username}</span>
                            </div>
                            <div className="border-top pt-4 px-2">
                                <div className="mb-3">
                                    <label className="text-muted small fw-bold text-uppercase">Email</label>
                                    <p className="mb-0 fw-semibold">{user.email || 'N/A'}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small fw-bold text-uppercase">Phone</label>
                                    <p className="mb-0 fw-semibold">{user.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="btn btn-primary w-100 fw-bold" style={{ backgroundColor: '#2D5A88' }}
                                    onClick={() => { setFormData({ ...user, currentPassword: '', newPassword: '', confirmNewPassword: '' }); setShowModal(true); }}>
                                    Edit Profile Information
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* edit modal */}
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

                                    <h6 className="fw-bold mb-3" style={{ color: `#2D5A88` }}>General Information</h6>
                                    <div className="row mb-3">
                                        <div className="col"><input type="text" name="firstName" className="form-control" placeholder="First Name" value={formData.firstName} onChange={handleChange} required /></div>
                                        <div className="col"><input type="text" name="lastName" className="form-control" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required /></div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col">
                                            <input type="email" name="email" className="form-control" placeholder="Email" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className="col">
                                            <input type="text" name="phone" className="form-control" placeholder="Phone Number" value={formData.phone || ''} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="mb-4"><input type="url" name="photoUrl" className="form-control" placeholder="Photo URL" value={formData.photoUrl} onChange={handleChange} /></div>

                                    <hr />

                                    <h6 className="fw-bold mb-3" style={{ color: `#2D5A88` }}>Security & Passwords</h6>
                                    <div className="p-3 bg-light rounded border mb-3">
                                        <label className="form-label small fw-bold">Change Password<br></br>(leave blank to keep current password)</label>
                                        <input type="password" name="newPassword"
                                            className="form-control mb-2" placeholder="New Password"
                                            value={formData.newPassword} onChange={handleChange} />
                                        <input type="password" name="confirmNewPassword"
                                            className="form-control" placeholder="Confirm New Password"
                                            value={formData.confirmNewPassword} onChange={handleChange} />
                                    </div>

                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-danger">Confirm Identity</label>
                                        <input type="password" name="currentPassword"
                                            className="form-control border-danger"
                                            placeholder="Enter Current Password to Save"
                                            value={formData.currentPassword} onChange={handleChange} required />
                                    </div>

                                </div>

                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: '#2D5A88' }}>
                                        {loading ? 'Processing...' : 'Save Updates'}
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