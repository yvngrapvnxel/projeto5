import React, {useEffect} from 'react';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import useClientStore from './stores/clientStore';
import useLeadStore from './stores/leadStore';
import AdminStatistics from './components/AdminStatistics';
import './Global.css';

const Dashboard = () => {
    // 1. Get current user
    const user = useUserStore((state) => state.user);

    // Safely check if user is admin (handles both boolean and string "true" from initial state)
    const isAdmin = user?.admin === true || user?.admin === 'true';

    // 2. State arrays
    const users = useAdminStore((state) => state.users);
    const clients = useClientStore((state) => state.clients);
    const leads = useLeadStore((state) => state.leads);

    // 3. Fetch functions with their correct names
    const fetchUsers = useAdminStore((state) => state.fetchUsers);
    const fetchClients = useClientStore((state) => state.fetchClients);
    const fetchLeads = useLeadStore((state) => state.fetchLeads);

    useEffect(() => {
        // 4. Fetch the data only if the user is an admin
        if (isAdmin) {
            fetchUsers();
            fetchClients();
            fetchLeads();
        }
    }, [isAdmin, fetchUsers, fetchClients, fetchLeads]);
    return (
        <div className="dashboard-wrapper">
            {user?.admin ? (
                <main className="dashboard-container" style={{ padding: '20px', marginTop: '70px' }}>

                    <div className="mb-4">
                        <h2 style={{color: '#2C313C', fontWeight: 'bold'}}>Scranton Branch Metrics</h2>
                    </div>

                    <AdminStatistics users={users} clients={clients} leads={leads}/>

                </main>
            ) : (
                <main className="dashboard-container">
                </main>
            )}
        </div>
    );
};

export default Dashboard;