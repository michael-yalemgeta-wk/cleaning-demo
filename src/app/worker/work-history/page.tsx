"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function WorkHistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffId, setStaffId] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const sid = localStorage.getItem("workerStaffId") || "";
    setStaffId(sid);
    fetchWorkHistory(sid);
  }, []);

  const fetchWorkHistory = async (sid: string) => {
    try {
      const res = await fetch("/api/bookings");
      const allBookings = await res.json();
      
      // Filter bookings assigned to this worker
      const myBookings = allBookings.filter((b: any) => b.assignedTo === sid);
      setBookings(myBookings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredBookings = filterStatus === "All" 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const completedBookings = bookings.filter(b => b.status === "Completed");
  const averageRating = completedBookings.length > 0 
    ? (completedBookings.reduce((sum: number, b: any) => sum + (b.rating || 0), 0) / completedBookings.length).toFixed(1)
    : 0;

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <h1 className="mb-lg">Work History</h1>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Jobs</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{bookings.length}</p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Completed</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{completedBookings.length}</p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Completion Rate</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{bookings.length > 0 ? ((completedBookings.length / bookings.length) * 100).toFixed(0) : 0}%</p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Average Rating</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>⭐ {averageRating}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', gap: '0.5rem' }}>
        {["All", "Completed", "In Progress", "Pending"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className="btn"
            style={{
              background: filterStatus === status ? 'var(--primary)' : 'var(--surface)',
              color: filterStatus === status ? 'white' : 'var(--text)',
              border: filterStatus === status ? 'none' : '1px solid var(--border)'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Work History Table */}
      <div className="card">
        {filteredBookings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
            <p>No work history found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Service</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Time</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{booking.date}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{booking.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{booking.email}</p>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>{booking.service}</td>
                    <td style={{ padding: '1rem' }}>{booking.time}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: booking.status === 'Completed' ? '#dcfce7' : booking.status === 'In Progress' ? '#fef9c3' : '#fee2e2',
                        color: booking.status === 'Completed' ? '#166534' : booking.status === 'In Progress' ? '#854d0e' : '#991b1b',
                        fontWeight: 'bold'
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      ${booking.payment?.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        onClick={() => {
                          const details = `Customer: ${booking.name}\nService: ${booking.service}\nAddress: ${booking.address}\nPhone: ${booking.phone}\nNotes: ${booking.notes || 'None'}`;
                          alert(details);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
