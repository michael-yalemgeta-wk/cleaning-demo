"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function EarningsDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffId, setStaffId] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("workerStaffId") || "";
    setStaffId(sid);
    fetchBookings(sid);
  }, []);

  const fetchBookings = async (sid: string) => {
    try {
      const res = await fetch("/api/bookings");
      const allBookings = await res.json();
      
      // Filter bookings assigned to this worker
      const myBookings = allBookings.filter((b: any) => b.assignedTo === sid);
      setBookings(myBookings);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalEarnings = bookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);
    const completedBookings = bookings.filter(b => b.status === "Completed");
    const completedEarnings = completedBookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);
    const pendingEarnings = totalEarnings - completedEarnings;

    // Monthly breakdown
    const monthlyData: { [key: string]: number } = {};
    bookings.forEach((b: any) => {
      if (b.payment?.amount) {
        const date = new Date(b.date);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + b.payment.amount;
      }
    });

    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months.push({
        month: monthKey,
        earnings: monthlyData[monthKey] || 0
      });
    }

    return {
      totalEarnings,
      completedEarnings,
      pendingEarnings,
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      monthlyData: months,
      averagePerJob: completedBookings.length > 0 ? (completedEarnings / completedBookings.length).toFixed(2) : 0
    };
  };

  if (loading) return <div className="section container">Loading...</div>;

  const metrics = calculateMetrics();
  const maxEarnings = Math.max(...metrics.monthlyData.map(m => m.earnings), 1);

  return (
    <div className="section container">
      <h1 className="mb-lg">Earnings Dashboard</h1>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#10b981', color: 'white', borderRadius: '50%' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Earnings</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0' }}>${metrics.totalEarnings.toFixed(2)}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#3b82f6', color: 'white', borderRadius: '50%' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed Earnings</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0' }}>${metrics.completedEarnings.toFixed(2)}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f59e0b', color: 'white', borderRadius: '50%' }}>
            <Calendar size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Earnings</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0' }}>${metrics.pendingEarnings.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Jobs</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{metrics.totalBookings}</p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Completed Jobs</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>{metrics.completedBookings}</p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Average per Job</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${metrics.averagePerJob}</p>
        </div>
      </div>

      {/* Monthly Earnings Trend */}
      <div className="card mb-lg">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} /> Monthly Earnings Trend
        </h3>
        <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '1rem', gap: '0.5rem' }}>
          {metrics.monthlyData.map((item, i) => {
            const height = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ 
                  height: `${Math.max(height, 5)}%`, 
                  background: 'linear-gradient(to top, #3b82f6, #60a5fa)', 
                  borderRadius: '4px 4px 0 0',
                  minHeight: '20px',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}>
                  {height > 15 && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '-20px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      ${item.earnings.toFixed(0)}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: '500' }}>{item.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Earnings Breakdown by Service</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(() => {
            const serviceBreakdown: { [key: string]: { count: number; earnings: number } } = {};
            bookings.forEach(b => {
              if (!serviceBreakdown[b.service]) {
                serviceBreakdown[b.service] = { count: 0, earnings: 0 };
              }
              serviceBreakdown[b.service].count++;
              serviceBreakdown[b.service].earnings += b.payment?.amount || 0;
            });

            return Object.entries(serviceBreakdown).map(([service, data]) => (
              <div key={service}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>{service}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{data.count} jobs • ${data.earnings.toFixed(2)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--surface-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(data.earnings / metrics.totalEarnings) * 100}%`, 
                    height: '100%', 
                    background: 'var(--primary)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
