import React, { useEffect, useState, useMemo } from 'react';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import AdminStatistics from './components/AdminStatistics';
import { API_URL } from './config';
import './Global.css';

const Dashboard = () => {
    // 1. Get current user & admin check
    const user = useUserStore((state) => state.user);
    const isAdmin = user?.admin === true || user?.admin === 'true';

    const users = useAdminStore((state) => state.users);
    const fetchUsers = useAdminStore((state) => state.fetchUsers);

    const [allClients, setAllClients] = useState([]);
    const [allLeads, setAllLeads] = useState([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // --- NEW FIX: Ensure the logged-in admin is in the users list ---
    const allPlatformUsers = useMemo(() => {
        // If no user is logged in, just return the list
        if (!user || !user.id) return users;

        // Check if the admin is already in the list
        const adminExists = users.some(u => String(u.id) === String(user.id));

        // If not, append the admin to the list!
        return adminExists ? users : [...users, user];
    }, [users, user]);

    // Fetch the user list on mount
    useEffect(() => {
        if (isAdmin) {
            document.body.classList.add('no-bg');
            fetchUsers();
            return () => document.body.classList.remove('no-bg');
        }
    }, [isAdmin, fetchUsers]);

    // Fetch the master data once we have the users
    useEffect(() => {
        if (isAdmin && allPlatformUsers.length > 0) {
            const fetchPlatformData = async () => {
                setIsLoadingStats(true);
                const token = localStorage.getItem('token');
                let tempClients = [];
                let tempLeads = [];

                // Loop through ALL users
                const promises = allPlatformUsers.map(async (u) => {
                    try {
                        const [cRes, lRes] = await Promise.all([
                            fetch(`${API_URL}/admin/users/${u.id}/clients/all`, { headers: { token } }),
                            fetch(`${API_URL}/admin/users/${u.id}/leads/all`, { headers: { token } })
                        ]);

                        if (cRes.ok) {
                            const cData = await cRes.json();
                            const mappedClients = cData.map(c => ({ ...c, userId: u.id }));
                            tempClients = [...tempClients, ...mappedClients];
                        }
                        if (lRes.ok) {
                            const lData = await lRes.json();
                            const mappedLeads = lData.map(l => ({ ...l, userId: u.id }));
                            tempLeads = [...tempLeads, ...mappedLeads];
                        }
                    } catch (err) {
                        console.error(`Failed to fetch data for user ${u.id}`, err);
                    }
                });

                await Promise.all(promises);
                setAllClients(tempClients);
                setAllLeads(tempLeads);
                setIsLoadingStats(false);
            };

            fetchPlatformData();
        }
    }, [isAdmin, allPlatformUsers]);

    return (
        <div className="dashboard-wrapper">
            {isAdmin ? (
                <main className="dashboard-container dashboard-main-content">

                    {isLoadingStats ? (
                        <div className="d-flex justify-content-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading statistics...</span>
                            </div>
                        </div>
                    ) : (
                        <AdminStatistics users={allPlatformUsers} clients={allClients} leads={allLeads} />
                    )}
                </main>
            ) : (
                <main className="dashboard-container">
                </main>
            )}


        </div>
    );
};

export default Dashboard;