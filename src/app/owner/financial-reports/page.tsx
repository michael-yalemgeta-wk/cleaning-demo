"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

export default function FinancialReportsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!analytics) return;

    const monthName = new Date(filterYear, filterMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const csvContent = [
      ['Financial Report', monthName],
      [],
      ['Total Revenue', `$${analytics.overview.totalRevenue.toLocaleString()}`],
      ['Completed Revenue', `$${analytics.overview.completedRevenue.toLocaleString()}`],
      ['Total Bookings', analytics.overview.totalBookings],
      ['Completed Bookings', analytics.overview.completedBookings],
      [],
      ['Service Revenue Breakdown'],
      ['Service', 'Bookings', 'Revenue'],
      ...analytics.serviceStats.map((s: any) => [s.name, s.count, `$${s.revenue.toFixed(2)}`]),
      [],
      ['Staff Performance'],
      ['Name', 'Jobs Completed', 'Revenue Generated'],
      ...analytics.staffPerformance.map((s: any) => [s.name, s.jobsCompleted, `$${s.revenue.toFixed(2)}`])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `financial-report-${monthName.replace(' ', '-')}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) return <div className="section container">Loading...</div>;
  if (!analytics) return <div className="section container">Error loading analytics</div>;

  const { overview, monthlyRevenue, serviceStats, staffPerformance } = analytics;

  return (
    <div className="section container">
      <div className="flex justify-between items-center mb-lg">
        <h1>Financial Reports</h1>
        <button onClick={generateReport} className="btn btn-primary">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#059669', color: 'white', borderRadius: '50%' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Revenue</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0' }}>${overview.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#0891b2', color: 'white', borderRadius: '50%' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed Revenue</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0' }}>${overview.completedRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#7c3aed', color: 'white', borderRadius: '50%' }}>
            <Calendar size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Revenue</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0' }}>${(overview.totalRevenue - overview.completedRevenue).toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Monthly Revenue Trend</h3>
          <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '1rem', gap: '0.5rem' }}>
            {monthlyRevenue.map((item: any, i: number) => {
              const maxRevenue = Math.max(...monthlyRevenue.map((m: any) => m.revenue));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    height: `${height}%`, 
                    background: 'linear-gradient(to top, #059669, #10b981)', 
                    borderRadius: '4px 4px 0 0',
                    minHeight: '20px',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      top: '-20px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      ${item.revenue}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: '500' }}>{item.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Booking Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <span>Total Bookings</span>
              <strong>{overview.totalBookings}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <span>Completed Bookings</span>
              <strong>{overview.completedBookings}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <span>Pending Bookings</span>
              <strong>{overview.totalBookings - overview.completedBookings}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <span>Completion Rate</span>
              <strong>{overview.totalBookings > 0 ? ((overview.completedBookings / overview.totalBookings) * 100).toFixed(1) : 0}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Service Revenue Breakdown */}
      <div className="card mb-lg">
        <h3 style={{ marginBottom: '1rem' }}>Service Revenue Breakdown</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Service</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Bookings</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Total Revenue</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Avg per Booking</th>
              </tr>
            </thead>
            <tbody>
              {serviceStats.map((service: any) => (
                <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>{service.name}</td>
                  <td style={{ padding: '0.75rem' }}>{service.count}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>${service.revenue.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>${service.count > 0 ? (service.revenue / service.count).toFixed(2) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Revenue Performance */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Staff Revenue Performance</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Staff Member</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Jobs Completed</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Total Revenue</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 'bold' }}>Avg per Job</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.sort((a: any, b: any) => b.revenue - a.revenue).map((staff: any) => (
                <tr key={staff.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>{staff.name}</td>
                  <td style={{ padding: '0.75rem' }}>{staff.jobsCompleted}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>${staff.revenue.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>${staff.jobsCompleted > 0 ? (staff.revenue / staff.jobsCompleted).toFixed(2) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
