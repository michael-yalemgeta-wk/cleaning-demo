"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react";

export default function CustomersPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const bookingsRes = await fetch("/api/bookings");
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);

      // Extract unique customers
      const uniqueCustomers = Array.from(
        new Map(
          bookingsData.map((booking: any) => [
            booking.email,
            {
              email: booking.email,
              name: booking.name,
              phone: booking.phone,
              address: booking.address,
              totalBookings: 0,
              totalSpent: 0,
              lastBooking: null,
              bookingHistory: []
            }
          ])
        ).values()
      );

      // Calculate customer stats
      const customerStats = uniqueCustomers.map((customer: any) => {
        const customerBookings = bookingsData.filter((b: any) => b.email === customer.email);
        const totalSpent = customerBookings.reduce((sum: number, b: any) => sum + (b.payment?.amount || 0), 0);
        const lastBooking = customerBookings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          ...customer,
          totalBookings: customerBookings.length,
          totalSpent,
          lastBooking: lastBooking?.date,
          bookingHistory: customerBookings
        };
      });

      setCustomers(customerStats.sort((a: any, b: any) => b.totalBookings - a.totalBookings));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <div className="mb-lg">
        <h1 style={{ marginBottom: '1rem' }}>Customer Management</h1>
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No customers found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedCustomer ? '1fr 1fr' : '1fr', gap: 'var(--spacing-lg)' }}>
          {/* Customer List */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Bookings</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Total Spent</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.email} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedCustomer(customer)}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{customer.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{customer.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        {customer.totalBookings}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>${customer.totalSpent.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer Details */}
          {selectedCustomer && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{selectedCustomer.name}</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mail size={18} color="var(--primary)" />
                    <a href={`mailto:${selectedCustomer.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {selectedCustomer.email}
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Phone size={18} color="var(--primary)" />
                    <a href={`tel:${selectedCustomer.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {selectedCustomer.phone}
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MapPin size={18} color="var(--primary)" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                </div>
              </div>

              {/* Customer Stats */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Bookings</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedCustomer.totalBookings}</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Spent</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Booking History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedCustomer.bookingHistory.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No bookings yet.</p>
                  ) : (
                    selectedCustomer.bookingHistory.map((booking: any, idx: number) => (
                      <div key={idx} style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <strong>{booking.service}</strong>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            background: booking.status === 'Completed' ? '#dcfce7' : booking.status === 'In Progress' ? '#fef9c3' : '#fee2e2',
                            color: booking.status === 'Completed' ? '#166534' : booking.status === 'In Progress' ? '#854d0e' : '#991b1b'
                          }}>
                            {booking.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          <span>{booking.date} at {booking.time}</span>
                          <span>${booking.payment?.amount?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
