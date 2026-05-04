import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { useTranslation } from 'react-i18next';
import '../Global.css';

const COLORS = ['#0D1B33', '#285182', '#5285B8', '#8CB5D6', '#CFE1EE'];

const AdminStatistics = ({ users = [], clients = [], leads = [] }) => {
    const { t } = useTranslation();

    const totalUsers = users.length;
    const totalClients = clients.length;
    const totalLeads = leads.length;
    const confirmedAccounts = users.filter(user => user.active).length;

    const topPerformers = useMemo(() => {

        const performData = users.map(user => {
            // We use == instead of === so it matches strings to numbers safely
            const userLeads = leads.filter(l =>
                l.userId == user.id ||
                l.user?.id == user.id ||
                l.users?.id == user.id ||
                l.owner?.id == user.id ||
                l.ownerId == user.id
            ).length;

            const userClients = clients.filter(c =>
                c.userId == user.id ||
                c.user?.id == user.id ||
                c.users?.id == user.id ||
                c.owner?.id == user.id ||
                c.ownerId == user.id
            ).length;

            const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username;

            return {
                name: displayName,
                Leads: userLeads,
                Clients: userClients,
                Total: userLeads + userClients
            };
        });

        return performData
            .filter(u => u.Total > 0)
            .sort((a, b) => b.Total - a.Total)
            .slice(0, 5);
    }, [users, clients, leads]);

    const leadsByState = useMemo(() => {
        const stateCounts = { "New": 0, "Under Review": 0, "Proposal Sent": 0, "Archive": 0, "Won": 0, "Unknown": 0 };

        leads.forEach(lead => {
            if (lead.state === 0) stateCounts["New"] += 1;
            else if (lead.state === 1) stateCounts["Under Review"] += 1;
            else if (lead.state === 2) stateCounts["Proposal Sent"] += 1;
            else if (lead.state === 3) stateCounts["Archive"] += 1;
            else if (lead.state === 4) stateCounts["Won"] += 1;
            else stateCounts["Unknown"] += 1;
        });

        return Object.keys(stateCounts)
            .filter(key => stateCounts[key] > 0)
            .map(key => ({ name: key, value: stateCounts[key] }));
    }, [leads]);

    const evolutionData = useMemo(() => {
        const timeMap = {};

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

        leads.forEach(lead => {
            const month = getMonthString(lead.creationDate);
            if (month) {
                if (!timeMap[month]) timeMap[month] = { name: month, Leads: 0, Clients: 0 };
                timeMap[month].Leads += 1;
            }
        });

        clients.forEach(client => {
            const month = getMonthString(client.creationDate);
            if (month) {
                if (!timeMap[month]) timeMap[month] = { name: month, Leads: 0, Clients: 0 };
                timeMap[month].Clients += 1;
            }
        });

        return Object.values(timeMap).sort((a, b) => a.name.localeCompare(b.name));
    }, [leads, clients]);

    return (
        <div className="container-fluid mt-2">

            {/* KPI CARDS */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="glass-card border-0 text-start p-4 h-100 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(22, 38, 74, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' }}>
                        <i className="bi bi-people-fill position-absolute" style={{ fontSize: '6rem', color: 'rgba(22, 38, 74, 0.05)', right: '-10px', bottom: '-20px', zIndex: 0 }}></i>
                        <h6 className="text-muted fw-bold text-uppercase position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1 }}>{t('adminStats.totalUsers')}</h6>
                        <h2 className="mb-0 fw-bold position-relative" style={{ color: '#16264A', zIndex: 1 }}>{totalUsers}</h2>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="glass-card border-0 text-start p-4 h-100 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(75, 101, 132, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' }}>
                        <i className="bi bi-person-check-fill position-absolute" style={{ fontSize: '6rem', color: 'rgba(75, 101, 132, 0.05)', right: '-10px', bottom: '-20px', zIndex: 0 }}></i>
                        <h6 className="text-muted fw-bold text-uppercase position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1 }}>{t('adminStats.confirmedAccounts')}</h6>
                        <h2 className="mb-0 fw-bold position-relative" style={{ color: '#4B6584', zIndex: 1 }}>{confirmedAccounts}</h2>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="glass-card border-0 text-start p-4 h-100 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(119, 140, 163, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' }}>
                        <i className="bi bi-buildings-fill position-absolute" style={{ fontSize: '6rem', color: 'rgba(119, 140, 163, 0.05)', right: '-10px', bottom: '-20px', zIndex: 0 }}></i>
                        <h6 className="text-muted fw-bold text-uppercase position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1 }}>{t('adminStats.totalClients')}</h6>
                        <h2 className="mb-0 fw-bold position-relative" style={{ color: '#778CA3', zIndex: 1 }}>{totalClients}</h2>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="glass-card border-0 text-start p-4 h-100 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(165, 177, 194, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%)' }}>
                        <i className="bi bi-bullseye position-absolute" style={{ fontSize: '6rem', color: 'rgba(165, 177, 194, 0.05)', right: '-10px', bottom: '-20px', zIndex: 0 }}></i>
                        <h6 className="text-muted fw-bold text-uppercase position-relative" style={{ fontSize: '0.75rem', letterSpacing: '1px', zIndex: 1 }}>{t('adminStats.totalLeads')}</h6>
                        <h2 className="mb-0 fw-bold position-relative" style={{ color: '#A5B1C2', zIndex: 1 }}>{totalLeads}</h2>
                    </div>
                </div>
            </div>

            {/* TOP ROW CHARTS */}
            <div className="row mb-4 d-flex align-items-stretch">

                <div className="col-lg-7 mb-3">
                    <div className="glass-card border-0 p-4 h-100 d-flex flex-column">
                        <h5 className="text-center mb-4 fw-bold" style={{ color: '#16264A' }}>{t('adminStats.topReps')}</h5>
                        <div className="flex-grow-1">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topPerformers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E0E0E0" />
                                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#6c757d' }} />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6c757d', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'rgba(45, 90, 136, 0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="Clients" stackId="a" fill="#2D5A88" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Leads" stackId="a" fill="#16264A" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5 mb-3">
                    <div className="glass-card border-0 p-4 h-100 d-flex flex-column">
                        <h5 className="text-center mb-4 fw-bold" style={{ color: '#16264A' }}>{t('adminStats.leadsByState')}</h5>
                        <div className="flex-grow-1">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={leadsByState} innerRadius={85} outerRadius={115} dataKey="value" stroke="rgba(255,255,255,0.5)" strokeWidth={4}>
                                        {leadsByState.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM ROW: LINE CHART */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="glass-card border-0 p-4">
                        <h5 className="text-center mb-4 fw-bold" style={{ color: '#16264A' }}>{t('adminStats.temporalEvolution')}</h5>
                        <div className="flex-grow-1">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={evolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="name" tick={{ fill: '#6c757d' }} />
                                    <YAxis allowDecimals={false} tick={{ fill: '#6c757d' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="Leads" stroke="#16264A" strokeWidth={4} dot={{ r: 3, fill: '#16264A' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Clients" stroke="#2D5A88" strokeWidth={4} dot={{ r: 3, fill: '#2D5A88' }} activeDot={{ r: 6 }} />
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