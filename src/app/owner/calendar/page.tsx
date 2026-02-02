"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function OwnerCalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getBookingsForDate = (dateStr: string) => {
    return bookings.filter(b => b.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push(day);
  }

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <h1 style={{ marginBottom: '1.5rem' }}>Schedule & Calendar</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={goToPreviousMonth} className="btn btn-secondary">
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem' }}>{monthName}</h2>
            <button onClick={goToNextMonth} className="btn btn-secondary">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', padding: '0.5rem', color: 'var(--text-muted)' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} style={{ minHeight: '100px' }} />;
              }

              const dateStr = formatDate(day);
              const dateBookings = getBookingsForDate(dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    minHeight: '100px',
                    padding: '0.5rem',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{day.getDate()}</div>
                  {dateBookings.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {dateBookings.length} booking{dateBookings.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {dateBookings.slice(0, 2).map((b, i) => (
                          <div key={i} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.name}
                          </div>
                        ))}
                        {dateBookings.length > 2 && <div>+{dateBookings.length - 2} more</div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Details */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={20} />
            {selectedDate ? `Bookings for ${selectedDate}` : 'Select a date'}
          </h3>

          {selectedDate && (
            <div>
              {selectedDateBookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>No bookings for this date.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedDateBookings.map((booking, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ marginBottom: '0.25rem' }}>{booking.name}</h4>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.service}</p>
                        </div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem',
                          background: booking.status === 'Completed' ? '#dcfce7' : booking.status === 'In Progress' ? '#fef9c3' : '#fee2e2',
                          color: booking.status === 'Completed' ? '#166534' : booking.status === 'In Progress' ? '#854d0e' : '#991b1b',
                          fontWeight: 'bold'
                        }}>
                          {booking.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        <div><strong>Time:</strong> {booking.time}</div>
                        <div><strong>Address:</strong> {booking.address}</div>
                        <div><strong>Phone:</strong> {booking.phone}</div>
                        <div><strong>Email:</strong> {booking.email}</div>
                        {booking.payment?.amount && (
                          <div><strong>Amount:</strong> ${booking.payment.amount.toFixed(2)}</div>
                        )}
                      </div>

                      {booking.notes && (
                        <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', borderLeft: '3px solid #3b82f6' }}>
                          <strong>Notes:</strong> {booking.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedDate && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CalendarIcon size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
              <p>Click on a date to view bookings</p>
            </div>
          )}

          {/* Summary Stats */}
          {selectedDate && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '1rem' }}>Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Bookings</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedDateBookings.length}</p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Revenue</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    ${selectedDateBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
