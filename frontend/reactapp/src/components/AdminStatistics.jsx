import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import '../Global.css';

// Colors for the Donut Chart (Updated to fit 5 distinct states)
const COLORS = ['#3C78B4', '#F6A623', '#5D9CEC', '#9B9B9B', '#7ED321'];

const AdminStatistics = ({ users = [], clients = [], leads = [] }) => {

    // --- 1. KPI CALCULATIONS ---
    const totalUsers = users.length;
    const totalClients = clients.length;
    const totalLeads = leads.length;
    const confirmedAccounts = users.filter(user => user.active).length;

    // --- 2. LEADS BY STATE (Donut) ---
    const leadsByState = useMemo(() => {
        // Updated with your actual state labels
        const stateCounts = {
            "New": 0,
            "Under Review": 0,
            "Proposal Sent": 0,
            "Archive": 0,
            "Won": 0,
            "Unknown": 0
        };

        leads.forEach(lead => {
            if (lead.state === 0) stateCounts["New"] += 1;
            else if (lead.state === 1) stateCounts["Under Review"] += 1;
            else if (lead.state === 2) stateCounts["Proposal Sent"] += 1;
            else if (lead.state === 3) stateCounts["Archive"] += 1;
            else if (lead.state === 4) stateCounts["Won"] += 1;
            else stateCounts["Unknown"] += 1;
        });

        return Object.keys(stateCounts)
            .filter(key => stateCounts[key] > 0) // Only show states that actually have leads
            .map(key => ({ name: key, value: stateCounts[key] }));
    }, [leads]);

    // --- 3. TIME EVOLUTION (Line Chart) ---
    const evolutionData = useMemo(() => {
        const timeMap = {};

        // Helper to safely parse dates (handles both "YYYY-MM-DD" strings and [YYYY, MM, DD] arrays from Java)
        const getMonthString = (dateVal) => {
            if (!dateVal) return null;
            if (Array.isArray(dateVal) && dateVal.length >= 2) {
                const year = dateVal[0];
                const month = String(dateVal[1]).padStart(2, '0');
                return `${year}-${month}`;
            } else if (typeof dateVal === 'string') {
                return dateVal.substring(0, 7);
            }
            return null;
        };

        // Process Leads
        leads.forEach(lead => {
            const month = getMonthString(lead.creationDate);
            if (month) {
                if (!timeMap[month]) timeMap[month] = { name: month, Leads: 0, Users: 0 };
                timeMap[month].Leads += 1;
            }
        });

        // Process Users
        users.forEach(user => {
            const month = getMonthString(user.creationDate);
            if (month) {
                if (!timeMap[month]) timeMap[month] = { name: month, Leads: 0, Users: 0 };
                timeMap[month].Users += 1;
            }
        });

        // Sort chronologically (e.g., "2024-01", "2024-02")
        return Object.values(timeMap).sort((a, b) => a.name.localeCompare(b.name));
    }, [leads, users]);

    return (
        <div className="container-fluid mt-2">

            {/* KPI CARDS */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card shadow-sm border-0 text-center p-3 h-100">
                        <h6 className="text-muted">Total Users</h6>
                        <h2 style={{ color: '#3C78B4', fontWeight: 'bold' }}>{totalUsers}</h2>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card shadow-sm border-0 text-center p-3 h-100">
                        <h6 className="text-muted">Confirmed Accounts</h6>
                        <h2 className="text-success" style={{ fontWeight: 'bold' }}>{confirmedAccounts}</h2>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card shadow-sm border-0 text-center p-3 h-100">
                        <h6 className="text-muted">Total Clients</h6>
                        <h2 style={{ color: '#2D5A88', fontWeight: 'bold' }}>{totalClients}</h2>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card shadow-sm border-0 text-center p-3 h-100">
                        <h6 className="text-muted">Total Leads</h6>
                        <h2 className="text-warning" style={{ fontWeight: 'bold' }}>{totalLeads}</h2>
                    </div>
                </div>
            </div>

            {/* CHARTS ROW */}
            <div className="row mb-4 d-flex align-items-stretch">

                {/* DONUT: LEADS BY STATE */}
                <div className="col-lg-5 mb-3">
                    <div className="card shadow-sm border-0 p-3 h-100 d-flex flex-column">
                        <h5 className="text-center mb-3">Leads by State</h5>
                        <div className="flex-grow-1" style={{ minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadsByState}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                    >
                                        {leadsByState.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* LINE CHART: EVOLUTION */}
                <div className="col-lg-7 mb-3">
                    <div className="card shadow-sm border-0 p-4 h-100 d-flex flex-column">
                        <h5 className="text-center mb-4">Temporal Evolution (Users & Leads)</h5>
                        <div className="flex-grow-1" style={{ minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="name" tick={{ fill: '#6c757d' }} />
                                    <YAxis allowDecimals={false} tick={{ fill: '#6c757d' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="Leads" stroke="#3C78B4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Users" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminStatistics;