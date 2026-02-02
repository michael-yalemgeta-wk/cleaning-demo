"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Calendar, User, Briefcase, CreditCard } from "lucide-react";
import Link from "next/link";

function BookingForm() {
  const searchParams = useSearchParams();
  const preSelectedService = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: preSelectedService || "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "cash"
  });
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ 
    taxRate: 0.08,
    paymentMethods: { cash: true, card: false, online: false, bank_transfer: false },
    disabledDays: [],
    notificationSettings: { sameDay: true, emailOnBooking: true }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([servicesData, settingsData]) => {
      setServices(servicesData.filter((s: any) => s.active !== false));
      setSettings(settingsData);
    });
  }, []);

  useEffect(() => {
    if (preSelectedService && services.length > 0) {
      if (services.find(s => s.id === preSelectedService)) {
         setStep(2);
      }
    }
  }, [preSelectedService, services]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectService = (id: string) => {
    setFormData({ ...formData, service: id });
    setStep(2);
  };

  const selectedService = services.find(s => s.id === formData.service);
  const subtotal = selectedService?.price || 0;
  const tax = subtotal * (settings.taxRate || 0);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payment: {
            method: formData.paymentMethod,
            amount: total,
            status: formData.paymentMethod === 'cash' ? 'Pending' : 'Paid'
          }
        }),
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Error submitting booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container section text-center">
        <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Check size={64} />
          </div>
          <h1>Booking Confirmed!</h1>
          <p className="mb-md" style={{ color: 'var(--text-muted)' }}>Thank you, {formData.name}. We have received your booking request.</p>
          <div className="card mb-md" style={{ textAlign: 'left', background: 'var(--surface-alt)' }}>
            <p><strong>Service:</strong> {selectedService?.title}</p>
            <p><strong>Date:</strong> {formData.date} at {formData.time}</p>
            <p><strong>Address:</strong> {formData.address}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            <p><strong>Payment:</strong> {formData.paymentMethod === 'cash' ? 'Cash on Arrival' : formData.paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card'} - {formData.paymentMethod === 'cash' ? 'Pending' : 'Paid'}</p>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            A confirmation email has been sent to {formData.email}
          </p>
          <Link href="/" className="btn btn-primary">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-center mb-lg">Book Your Clean</h1>
        
        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', gap: '2rem' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ 
              width: '40px', height: '40px', 
              borderRadius: '50%', 
              background: step >= s ? 'var(--primary)' : 'var(--surface-alt)',
              color: step >= s ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', border: step === s ? '3px solid var(--accent)' : 'none'
            }}>
              {s}
            </div>
          ))}
        </div>

        <div className="card">
          {step === 1 && (
            <div>
              <h2 className="mb-md flex items-center gap-sm"><Briefcase /> Select Service</h2>
              {services.length === 0 ? <p>Loading services...</p> : (
              <div className="grid-3">
                {services.map(s => (
                  <div key={s.id} 
                    onClick={() => selectService(s.id)}
                    style={{ 
                      padding: '1.5rem', 
                      border: `2px solid ${formData.service === s.id ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: formData.service === s.id ? 'var(--surface-alt)' : 'transparent',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', gap: '0.5rem'
                    }}
                  >
                    <h3 style={{ marginBottom: '0.25rem' }}>{s.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.description}</p>
                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', marginTop: 'auto' }}>${s.price}</p>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-md flex items-center gap-sm"><Calendar /> Select Date & Time</h2>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  min={new Date().toISOString().split('T')[0]}
                  disabled={settings.disabledDays.includes(formData.date)}
                  style={{
                    backgroundColor: settings.disabledDays.includes(formData.date) ? '#ffe0e0' : 'transparent'
                  }}
                />
                {settings.disabledDays.includes(formData.date) && (
                  <p style={{ color: 'var(--error)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    This date is not available for booking
                  </p>
                )}
              </div>
              <div className="form-group mb-md">
                <label>Time</label>
                <select name="time" required value={formData.time} onChange={handleInputChange} disabled={settings.disabledDays.includes(formData.date)}>
                  <option value="">Select a time</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
                <button type="button" onClick={() => setStep(3)} disabled={!formData.date || !formData.time || settings.disabledDays.includes(formData.date)} className="btn btn-primary">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-md flex items-center gap-sm"><User /> Your Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label>Service Address *</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St, Apt 4B" rows={3}></textarea>
              </div>
              <div className="form-group mb-lg">
                <label>Special Requests (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any specific instructions?" rows={2}></textarea>
              </div>
              
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
                <button type="button" onClick={() => setStep(4)} disabled={!formData.name || !formData.email || !formData.phone || !formData.address} className="btn btn-primary">Next</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <h2 className="mb-md flex items-center gap-sm"><CreditCard /> Payment & Summary</h2>
              
              {/* Booking Summary */}
              <div className="card mb-md" style={{ background: 'var(--surface-alt)' }}>
                <h3 className="mb-md">Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>{selectedService?.title}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group mb-lg">
                <label>Payment Method *</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} required>
                  {settings.paymentMethods?.cash && <option value="cash">Cash on Arrival</option>}
                  {settings.paymentMethods?.card && <option value="card">Credit Card</option>}
                  {settings.paymentMethods?.online && <option value="online">Online Payment</option>}
                  {settings.paymentMethods?.bank_transfer && <option value="bank_transfer">Bank Transfer</option>}
                </select>
              </div>

              {formData.paymentMethod !== 'cash' && (
                <div className="card mb-lg" style={{ background: 'var(--surface-alt)', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    💳 Payment processing simulation - No actual charges will be made
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="btn btn-secondary">Back</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? "Processing..." : formData.paymentMethod === 'cash' ? "Confirm Booking" : "Pay & Confirm"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <BookingForm />
    </Suspense>
  );
}
