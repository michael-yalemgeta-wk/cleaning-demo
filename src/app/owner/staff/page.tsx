"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function OwnerStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", role: "Cleaner", email: "", status: "Active" });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaff(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch("/api/staff", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newMember, id: editingId }),
        });
        setEditingId(null);
      } else {
        await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newMember, jobsCompleted: 0, performanceRating: 0 }),
        });
      }
      setIsModalOpen(false);
      setNewMember({ name: "", role: "Cleaner", email: "", status: "Active" });
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        await fetch("/api/staff", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        fetchStaff();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditStaff = (member: any) => {
    setNewMember(member);
    setEditingId(member.id);
    setIsModalOpen(true);
  };

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <div className="flex justify-between items-center mb-lg">
        <h1>Staff Management</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewMember({ name: "", role: "Cleaner", email: "", status: "Active" });
            setIsModalOpen(true);
          }} 
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No staff members added yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Jobs</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Rating</th>
                <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{member.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{member.email}</td>
                  <td style={{ padding: '1rem' }}>{member.role}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: member.status === 'Active' ? '#dcfce7' : member.status === 'On Leave' ? '#fef9c3' : '#fee2e2',
                      color: member.status === 'Active' ? '#166534' : member.status === 'On Leave' ? '#854d0e' : '#991b1b'
                    }}>
                      {member.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{member.jobsCompleted || 0}</td>
                  <td style={{ padding: '1rem' }}>⭐ {member.performanceRating || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEditStaff(member)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                      title="Edit"
                    >
                      <Edit2 size={18} color="#3b82f6" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStaff(member.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 className="mb-md">{editingId ? 'Edit Staff' : 'Add New Staff'}</h2>
            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label>Name</label>
                <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                  <option>Cleaner</option>
                  <option>Supervisor</option>
                  <option>Manager</option>
                </select>
              </div>
              <div className="form-group mb-lg">
                <label>Status</label>
                <select value={newMember.status} onChange={e => setNewMember({...newMember, status: e.target.value})}>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
