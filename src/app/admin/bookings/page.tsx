"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, LogOut, Plus, UserPlus, Search, AlertCircle } from "lucide-react";

type Booking = {
  id: string;
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  address: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  assignedTo?: string;
  tasks?: string[];
  createdAt: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [searchEmail, setSearchEmail] = useState("");
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const bookingsRes = await fetch("/api/bookings");
      const staffRes = await fetch("/api/staff");
      const data = await bookingsRes.json();
      setBookings(data.reverse());
      setFilteredBookings(data.reverse());
      setStaff(await staffRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (email: string) => {
    setSearchEmail(email);
    if (email.trim() === "") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.email.toLowerCase().includes(email.toLowerCase())));
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update booking status");
    }
  };

  const togglePaymentStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle payment status:", err);
      alert("Failed to update payment status");
    }
  };

  const assignStaff = async (bookingId: string, staffId: string) => {
    try {
      await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, assignedTo: staffId, status: "Confirmed" }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to assign staff:", err);
      alert("Failed to assign staff");
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const booking = bookings.find(b => b.id === selectedBooking);
    if (!booking) return;

    const taskRes = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...newTask, 
        bookingId: selectedBooking,
        assignedTo: booking.assignedTo,
        status: "Pending"
      }),
    });

    setTaskModalOpen(false);
    setNewTask({ title: "", description: "" });
    fetchData();
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const member = staff.find(s => s.id === staffId);
    return member ? member.name : "Unknown";
  };

  if (loading) return <div className="container section text-center">Loading...</div>;

  return (
    <div className="section container">
      <h1 className="mb-lg">Booking Management</h1>

      {/* Search by Email */}
      <div className="card mb-lg">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Search size={18} />
          <input
            type="email"
            placeholder="Search bookings by email..."
            value={searchEmail}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Payment</th>
              <th style={{ padding: '1rem' }}>Date/Time</th>
              <th style={{ padding: '1rem' }}>Customer (Email)</th>
              <th style={{ padding: '1rem' }}>Service</th>
              <th style={{ padding: '1rem' }}>Assigned To</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={booking.status} 
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      style={{ 
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="On Way">On Way</option>
                      <option value="Done">Done</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <strong>{booking.paymentStatus || 'Pending'}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {booking.paymentMethod === 'cash' ? 'Cash on Arrival' : booking.paymentMethod || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{booking.date}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.time}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{booking.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{booking.service}</td>
                  <td style={{ padding: '1rem' }}>
                    {booking.assignedTo ? (
                      <span>{getStaffName(booking.assignedTo)}</span>
                    ) : (
                      <select 
                        onChange={(e) => assignStaff(booking.id, e.target.value)}
                        style={{ fontSize: '0.875rem' }}
                      >
                        <option value="">Assign Staff...</option>
                        {staff.filter(s => s.status === 'Active').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {booking.assignedTo && booking.status !== 'Completed' && (
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking.id);
                            setTaskModalOpen(true);
                          }} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                          title="Add Task"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => togglePaymentStatus(booking.id, booking.paymentStatus || 'Pending')}
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                        title="Toggle Payment Status"
                      >
                        {(booking.paymentStatus || 'Pending') === 'Paid' ? '✓ Paid' : 'Mark Paid'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Task Modal */}
      {taskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 className="mb-md">Add Task</h2>
            <form onSubmit={addTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  required 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g., Clean kitchen"
                />
              </div>
              <div className="form-group mb-lg">
                <label>Description</label>
                <textarea 
                  required
                  value={newTask.description} 
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task details..."
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => {
                  setTaskModalOpen(false);
                  setNewTask({ title: "", description: "" });
                }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
