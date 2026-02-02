"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquare, Send, Trash2, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"notifications" | "messages">("notifications");
  const [newMessage, setNewMessage] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [staffId, setStaffId] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("workerStaffId") || "";
    const name = localStorage.getItem("workerName") || "";
    setStaffId(sid);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch bookings to create notifications
      const bookingsRes = await fetch("/api/bookings");
      const bookings = await bookingsRes.json();

      // Create notifications from bookings
      const newNotifications = bookings
        .filter((b: any) => b.assignedTo === staffId)
        .map((b: any) => ({
          id: `notif-${b.id}`,
          type: b.status === "In Progress" ? "in-progress" : "new-booking",
          title: b.status === "In Progress" ? "Job In Progress" : "New Job Assigned",
          message: `${b.name} - ${b.service} at ${b.address}`,
          date: b.date,
          time: b.time,
          bookingId: b.id,
          read: false
        }));

      // Load stored messages
      const stored = localStorage.getItem("workerMessages");
      const storedMessages = stored ? JSON.parse(stored) : [];

      setNotifications(newNotifications);
      setMessages(storedMessages);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCustomer) return;

    const message = {
      id: `msg-${Date.now()}`,
      to: selectedCustomer.name,
      toEmail: selectedCustomer.email,
      text: newMessage,
      timestamp: new Date().toLocaleString(),
      sender: "worker",
      read: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem("workerMessages", JSON.stringify(updatedMessages));
    setNewMessage("");
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem("workerMessages", JSON.stringify(updated));
  };

  if (loading) return <div className="section container">Loading...</div>;

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const conversationParticipants = Array.from(
    new Map(messages.map(m => [m.toEmail, { name: m.to, email: m.toEmail }])).values()
  );

  return (
    <div className="section container">
      <h1 className="mb-lg">Notifications & Messages</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab("notifications")}
          style={{
            padding: '1rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === "notifications" ? '3px solid var(--primary)' : 'none',
            fontWeight: activeTab === "notifications" ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Bell size={20} />
          Notifications
          {unreadNotifications > 0 && (
            <span style={{
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {unreadNotifications}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          style={{
            padding: '1rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === "messages" ? '3px solid var(--primary)' : 'none',
            fontWeight: activeTab === "messages" ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <MessageSquare size={20} />
          Messages
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div>
          {notifications.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <Bell size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem',
                    background: notification.read ? 'var(--surface)' : 'rgba(59, 130, 246, 0.05)',
                    border: `1px solid ${notification.read ? 'var(--border)' : '#3b82f6'}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong>{notification.title}</strong>
                      {!notification.read && (
                        <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {notification.message}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {notification.date} at {notification.time}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--primary)'
                        }}
                        title="Mark as read"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)', minHeight: '500px' }}>
          {/* Conversations List */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Conversations</h3>
            {conversationParticipants.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No conversations yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {conversationParticipants.map((participant) => (
                  <button
                    key={participant.email}
                    onClick={() => setSelectedCustomer(participant)}
                    style={{
                      padding: '1rem',
                      background: selectedCustomer?.email === participant.email ? 'var(--primary)' : 'var(--surface-alt)',
                      color: selectedCustomer?.email === participant.email ? 'white' : 'var(--text)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{participant.name}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{participant.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            {selectedCustomer ? (
              <>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <h3>{selectedCustomer.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedCustomer.email}</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.filter(m => m.toEmail === selectedCustomer.email).length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      <MessageSquare size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                      <p>Start a new conversation</p>
                    </div>
                  ) : (
                    messages.filter(m => m.toEmail === selectedCustomer.email).map((message) => (
                      <div
                        key={message.id}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'var(--surface-alt)',
                          borderRadius: 'var(--radius-sm)',
                          wordBreak: 'break-word'
                        }}
                      >
                        <p style={{ marginBottom: '0.5rem' }}>{message.text}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {message.timestamp}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      minHeight: '50px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div>
                  <MessageSquare size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
