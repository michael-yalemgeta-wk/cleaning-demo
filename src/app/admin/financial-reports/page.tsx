"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

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
  payment?: { amount: number; status: string };
  createdAt: string;
};

export default function FinancialReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
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
      const servicesRes = await fetch("/api/services");
      setBookings(await bookingsRes.json());
      setServices(await servicesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServicePrice = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.price || 0;
  };

  const filterBookingsByMonth = (month: string) => {
    return bookings.filter(b => b.date.startsWith(month));
  };

  const calculateMetrics = (bookingsToAnalyze: Booking[]) => {
    const paidBookings = bookingsToAnalyze.filter(b => (b.paymentStatus || 'Pending') === 'Paid' || (b.payment?.status === 'Paid'));
    const totalCompleted = bookingsToAnalyze.filter(b => b.status === 'Completed').length;
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.payment?.amount || getServicePrice(b.service)), 0);
    const pendingRevenue = bookingsToAnalyze.filter(b => (b.paymentStatus || 'Pending') === 'Pending').reduce((sum, b) => sum + (b.payment?.amount || getServicePrice(b.service)), 0);

    return {
      totalBookings: bookingsToAnalyze.length,
      completedBookings: totalCompleted,
      paidBookings: paidBookings.length,
      totalRevenue,
      pendingRevenue,
      averageOrderValue: paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0,
    };
  };

  const monthlyBookings = filterBookingsByMonth(selectedMonth);
  const metrics = calculateMetrics(monthlyBookings);
  const allTimeMetrics = calculateMetrics(bookings);

  const groupByService = () => {
    const grouped: any = {};
    monthlyBookings.forEach(b => {
      if (!grouped[b.service]) {
        grouped[b.service] = {
          count: 0,
          revenue: 0,
          completed: 0,
        };
      }
      grouped[b.service].count++;
      if ((b.paymentStatus || 'Pending') === 'Paid' || b.payment?.status === 'Paid') {
        grouped[b.service].revenue += b.payment?.amount || getServicePrice(b.service);
      }
      if (b.status === 'Completed') {
        grouped[b.service].completed++;
      }
    });
    return grouped;
  };

  const exportToCSV = () => {
    const headers = ["Date", "Customer", "Service", "Amount", "Payment Status", "Booking Status"];
    const rows = monthlyBookings.map(b => [
      b.date,
      b.name,
      b.service,
      (b.payment?.amount || getServicePrice(b.service)).toFixed(2),
      b.paymentStatus || 'Pending',
      b.status,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${selectedMonth}.csv`;
    a.click();
  };

  if (loading) return <div className="container section text-center">Loading...</div>;

  const serviceBreakdown = groupByService();

  return (
    <div className="section container">
      <h1 className="mb-lg">Financial Reports</h1>

      {/* Date Selector */}
      <div className="card mb-lg">
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Calendar size={20} />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "0.25rem" }}
          />
          <button onClick={exportToCSV} className="btn btn-secondary" style={{ marginLeft: "auto" }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-4 mb-lg" style={{ gap: "1.5rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Total Revenue</p>
          <h2 style={{ color: "var(--primary)", fontSize: "2rem", margin: 0 }}>${metrics.totalRevenue.toFixed(2)}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Paid Bookings: {metrics.paidBookings}</p>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Pending Revenue</p>
          <h2 style={{ color: "#f59e0b", fontSize: "2rem", margin: 0 }}>${metrics.pendingRevenue.toFixed(2)}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Total Bookings: {metrics.totalBookings}</p>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Avg Order Value</p>
          <h2 style={{ color: "var(--accent)", fontSize: "2rem", margin: 0 }}>${metrics.averageOrderValue.toFixed(2)}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Completed: {metrics.completedBookings}</p>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>All Time Revenue</p>
          <h2 style={{ color: "var(--primary)", fontSize: "2rem", margin: 0 }}>${allTimeMetrics.totalRevenue.toFixed(2)}</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Total Paid: {allTimeMetrics.paidBookings}</p>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="card mb-lg">
        <h2 className="mb-md">Service Breakdown</h2>
        {Object.entries(serviceBreakdown).length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No bookings for this period</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "1rem" }}>Service</th>
                <th style={{ padding: "1rem" }}>Bookings</th>
                <th style={{ padding: "1rem" }}>Completed</th>
                <th style={{ padding: "1rem" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(serviceBreakdown).map(([service, data]: [string, any]) => (
                <tr key={service} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem", textTransform: "capitalize" }}>{service}</td>
                  <td style={{ padding: "1rem" }}>{data.count}</td>
                  <td style={{ padding: "1rem" }}>{data.completed}</td>
                  <td style={{ padding: "1rem", color: "var(--primary)", fontWeight: "bold" }}>${data.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly Bookings Table */}
      <div className="card">
        <h2 className="mb-md">Monthly Bookings Detail</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "1rem" }}>Date</th>
                <th style={{ padding: "1rem" }}>Customer</th>
                <th style={{ padding: "1rem" }}>Service</th>
                <th style={{ padding: "1rem" }}>Amount</th>
                <th style={{ padding: "1rem" }}>Payment Status</th>
                <th style={{ padding: "1rem" }}>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: "2rem", color: "var(--text-muted)" }}>
                    No bookings for this month
                  </td>
                </tr>
              ) : (
                monthlyBookings.map(booking => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "1rem" }}>{booking.date}</td>
                    <td style={{ padding: "1rem" }}>
                      <div>{booking.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{booking.email}</div>
                    </td>
                    <td style={{ padding: "1rem", textTransform: "capitalize" }}>{booking.service}</td>
                    <td style={{ padding: "1rem", fontWeight: "bold" }}>${(booking.payment?.amount || getServicePrice(booking.service)).toFixed(2)}</td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.875rem",
                          background: (booking.paymentStatus || 'Pending') === 'Paid' ? "#dcfce7" : "#fef3c7",
                          color: (booking.paymentStatus || 'Pending') === 'Paid' ? "#166534" : "#92400e",
                          fontWeight: "bold",
                        }}
                      >
                        {booking.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.875rem",
                          background:
                            booking.status === 'Completed'
                              ? '#e2e8f0'
                              : booking.status === 'On Way'
                              ? '#dbeafe'
                              : booking.status === 'Confirmed'
                              ? '#dcfce7'
                              : '#fef3c7',
                          color:
                            booking.status === 'Completed'
                              ? '#475569'
                              : booking.status === 'On Way'
                              ? '#1e40af'
                              : booking.status === 'Confirmed'
                              ? '#166534'
                              : '#92400e',
                          fontWeight: 'bold',
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
