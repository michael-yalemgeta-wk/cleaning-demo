"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, DollarSign } from "lucide-react";

export default function OwnerServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newService, setNewService] = useState({ title: "", description: "", price: 0, duration: 0, category: "Residential" });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newService, id: editingId }),
        });
        setEditingId(null);
      } else {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newService),
        });
      }
      setIsModalOpen(false);
      setNewService({ title: "", description: "", price: 0, duration: 0, category: "Residential" });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await fetch("/api/services", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        fetchServices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditService = (service: any) => {
    setNewService(service);
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <div className="flex justify-between items-center mb-lg">
        <h1>Service Management</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewService({ title: "", description: "", price: 0, duration: 0, category: "Residential" });
            setIsModalOpen(true);
          }} 
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No services added yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Service Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 'bold' }}>Duration (hrs)</th>
                <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{service.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{service.description}</td>
                  <td style={{ padding: '1rem' }}>{service.category}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <DollarSign size={16} />
                      {service.price}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{service.duration}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEditService(service)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                      title="Edit"
                    >
                      <Edit2 size={18} color="#3b82f6" />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
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

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '450px' }}>
            <h2 className="mb-md">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleAddService}>
              <div className="form-group">
                <label>Service Name</label>
                <input required value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} style={{ minHeight: '80px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Office</option>
                    <option>Carpet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input required type="number" step="0.01" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="form-group mb-lg">
                <label>Duration (hours)</label>
                <input required type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})} />
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
