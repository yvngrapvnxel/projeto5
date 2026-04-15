import React, { useState } from 'react';
import './Global.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import userStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import useClientStore from './stores/clientStore';
import useLeadStore from './stores/leadStore';
import { API_URL } from './config';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Navbar = () => {

   const user = userStore((state) => state.user);
   const [isSidebarOpen, setSidebarOpen] = useState(false);
   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
   const clearStore = userStore((state) => state.logout);
   const navigate = useNavigate();
   const location = useLocation();

   const isLoginRegisterPage = location.pathname === '/login' || location.pathname === '/register';

   const handleLogout = async () => {
      const token = localStorage.getItem('token');
      try {
         await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'token': token
            },
         });
      } catch (error) {
         console.error("Network error during logout:", error);
      }
      localStorage.removeItem('token');
      clearStore();
      useClientStore.setState({ clients: [] });
      useLeadStore.setState({ leads: [] });
      useAdminStore.setState({ users: [], selectedUserClients: [], selectedUserLeads: [] });
      navigate('/login');
   };

   return (
      <>
         {!isLoginRegisterPage && isSidebarOpen && (
            <div
               className="sidebar-overlay"
               onClick={toggleSidebar}
               style={{
                  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040
               }}
            />
         )}

         {!isLoginRegisterPage && (
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
               <div className="p-4">
                  <br></br>
                  <h4 className="fw-bold mb-4" style={{ color: '#2C313C' }}>Menu</h4>
                  <br></br>
                  <ul className="list-unstyled d-flex flex-column gap-3">
                     <li><Link to="/dashboard" onClick={toggleSidebar} className="sidebar-link">Dashboard</Link></li>
                     <li><Link to="/clients" onClick={toggleSidebar} className="sidebar-link">Clients</Link></li>
                     <li><Link to="/leads" onClick={toggleSidebar} className="sidebar-link">Sales Leads</Link></li>
                     {user.admin && (<Link to="/admin" onClick={toggleSidebar} className="sidebar-link"> <i class="fa-solid fa-crown"></i> Administration</Link>)}
                  </ul>
               </div>
            </aside>
         )}

         <nav className="dashboard-nav d-flex justify-content-between align-items-center px-4 py-2 fixed-top bg-white border-bottom" style={{ height: '70px' }}>

            <div className="crm-logo d-flex align-items-center gap-3">
               {/* hamburger menu */}
               {!isLoginRegisterPage && (
                  <button
                     className="hamburger-btn btn p-0 border-0"
                     type="button"
                     onClick={toggleSidebar}
                     style={{ fontSize: '1.5rem', color: '#2C313C', lineHeight: '1' }}
                  >
                     &#9776;
                  </button>
               )}

               <div className="crm-logo d-flex align-items-center gap-2">
                  <img
                     src="/favicon-32x32.png"
                     alt="Paperclip Logo"
                     style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                  />
                  <div className="d-flex flex-column" style={{ lineHeight: '1.1' }}>
                     <span className="fw-bold" style={{ color: '#2C313C', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Dunder Mifflin
                     </span>
                     <span style={{ color: '#3C78B4', fontSize: '0.75rem', fontWeight: '600', marginTop: '-2px' }}>
                        Paper Company, Inc.
                     </span>
                  </div>
               </div>
            </div>

            {isLoginRegisterPage && (

               <>
                  <div className="d-flex align-items-center gap-3">
                     <div className="d-flex flex-column align-items-end">
                        <span className="fw-semibold text-muted text-end" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                           "Welcome! I think this is going to be good. I'm not gonna say 'great', because I don't want to overpromise."
                        </span>
                        <span className="text-secondary" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                           — Michael Scott
                        </span>
                     </div>
                  </div>
               </>

            )}

            {!isLoginRegisterPage && (
               <>
                  <div className="d-flex align-items-center gap-3">
                     <span className="fw-semibold text-muted">
                        Welcome{', ' + user.firstName || ' Employee'}!
                     </span>

                     <Link to="/profile">
                        <img
                           src={user.photoUrl || '/default-user.png'}
                           className="user-profile-img rounded-circle"
                           alt="profile"
                           style={{ border: '2px solid #3C78B4', width: '40px', height: '40px', cursor: 'pointer', objectFit: 'cover' }}
                        />
                     </Link>

                     <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                        Logout <i class="bi bi-box-arrow-right"></i>
                     </button>
                  </div>
               </>
            )}
         </nav>
      </>
   );
};


export default Navbar;