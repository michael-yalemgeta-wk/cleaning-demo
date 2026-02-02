"use client";

import { useEffect, useState } from "react";
import { Edit, Save, Plus, Trash2 } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ title: "", description: "", price: 0 });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  };

  const handleSave = async (service: any) => {
    try {
      await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      setEditingId(null);
      fetchServices();
    } catch (err) {
      console.error("Failed to save service:", err);
      alert("Failed to save service");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newService, active: true }),
      });
      setIsModalOpen(false);
      setNewService({ title: "", description: "", price: 0 });
      fetchServices();
    } catch (err) {
      console.error("Failed to add service:", err);
      alert("Failed to add service");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await fetch("/api/services", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: serviceId }),
        });
        fetchServices();
      } catch (err) {
        console.error("Failed to delete service:", err);
        alert("Failed to delete service");
      }
    }
  };

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <div className="flex justify-between items-center mb-lg">
        <h1>Manage Services</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add Service
        </button>
      </div>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Service</th>
                    <th style={{ padding: '1rem' }}>Description</th>
                    <th style={{ padding: '1rem' }}>Price ($)</th>
                    <th style={{ padding: '1rem' }}>Active</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {services.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <input value={s.title} onChange={(e) => {
                                    const newServices = services.map(srv => srv.id === s.id ? { ...srv, title: e.target.value } : srv);
                                    setServices(newServices);
                                }} />
                            ) : <strong>{s.title}</strong>}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                            {editingId === s.id ? (
                                <input value={s.description || ''} onChange={(e) => {
                                    const newServices = services.map(srv => srv.id === s.id ? { ...srv, description: e.target.value } : srv);
                                    setServices(newServices);
                                }} style={{ width: '100%' }} />
                            ) : (s.description || '-')}
                        </td>
                         <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <input type="number" value={s.price} onChange={(e) => {
                                    const newServices = services.map(srv => srv.id === s.id ? { ...srv, price: Number(e.target.value) } : srv);
                                    setServices(newServices);
                                }} style={{ width: '100px' }} />
                            ) : `$${s.price}`}
                        </td>
                         <td style={{ padding: '1rem' }}>
                            <input type="checkbox" checked={s.active !== false} onChange={async (e) => {
                                 const updated = { ...s, active: e.target.checked };
                                 await handleSave(updated);
                            }} />
                        </td>
                         <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {editingId === s.id ? (
                                    <button onClick={() => handleSave(s)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                                        <Save size={16} />
                                    </button>
                                ) : (
                                    <button onClick={() => setEditingId(s.id)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                                        <Edit size={16} />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteService(s.id)} className="btn btn-secondary" style={{ padding: '0.5rem', background: '#fee2e2', color: '#991b1b' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 className="mb-md">Add New Service</h2>
            <form onSubmit={handleAddService}>
              <div className="form-group">
                <label>Service Name *</label>
                <input 
                  required 
                  value={newService.title} 
                  onChange={e => setNewService({...newService, title: e.target.value})}
                  placeholder="e.g., Standard Cleaning"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={newService.description} 
                  onChange={e => setNewService({...newService, description: e.target.value})}
                  placeholder="Service description..."
                  rows={3}
                ></textarea>
              </div>
              <div className="form-group mb-lg">
                <label>Price ($) *</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  value={newService.price} 
                  onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
