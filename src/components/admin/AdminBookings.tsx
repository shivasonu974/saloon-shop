import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, RefreshCw, CheckCircle, XCircle, Loader, Clock } from 'lucide-react';

type BookingStatus = 'pending' | 'approved' | 'rejected';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  serviceId: string;
  date: string;
  slot: string;
  status: BookingStatus;
  createdAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      setBookings(data);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (id: string) => {
    setWorkingId(id);
    setNotice(null);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/book/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to approve booking');
      }

      setBookings((current) => current.map((booking) => (booking.id === id ? result.booking : booking)));
      setNotice('Booking approved. The user can now see: "Your booking is confirmed".');
    } catch (err: any) {
      console.error('Failed to approve booking:', err);
      setError(err.message || 'Error approving booking');
    } finally {
      setWorkingId(null);
    }
  };

  const rejectBooking = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    setWorkingId(id);
    setNotice(null);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/book/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reject booking');
      }

      setBookings((current) => current.map((booking) => (booking.id === id ? result.booking : booking)));
      setNotice('Booking rejected.');
    } catch (err: any) {
      console.error('Failed to reject booking:', err);
      setError(err.message || 'Error rejecting booking');
    } finally {
      setWorkingId(null);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm('Delete this booking?')) return;

    setWorkingId(id);
    setNotice(null);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete booking');
      }

      setBookings((current) => current.filter((booking) => booking.id !== id));
      setNotice('Booking deleted.');
    } catch (err: any) {
      console.error('Failed to delete booking:', err);
      setError(err.message || 'Error deleting booking');
    } finally {
      setWorkingId(null);
    }
  };

  const counts = {
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    approved: bookings.filter((booking) => booking.status === 'approved').length,
    rejected: bookings.filter((booking) => booking.status === 'rejected').length,
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return `${b.date} ${b.slot}`.localeCompare(`${a.date} ${a.slot}`);
  });

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Loading bookings...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-2">Bookings</h2>
          <p className="text-zinc-500">Review pending requests, approve bookings, and manage reservations.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-6 py-2.5 bg-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-yellow-500/20 bg-yellow-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
            <Clock size={16} /> Pending
          </div>
          <p className="text-3xl font-bold mt-2">{counts.pending}</p>
        </div>
        <div className="border border-green-500/20 bg-green-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
            <CheckCircle size={16} /> Approved
          </div>
          <p className="text-3xl font-bold mt-2">{counts.approved}</p>
        </div>
        <div className="border border-red-500/20 bg-red-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
            <XCircle size={16} /> Rejected
          </div>
          <p className="text-3xl font-bold mt-2">{counts.rejected}</p>
        </div>
      </div>

      {notice && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {notice}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {sortedBookings.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">No bookings found</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto rounded-xl border border-gold/10"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900 border-b border-gold/10">
                <th className="px-6 py-4 text-left text-sm font-bold text-gold">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gold">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gold">Service</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gold">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map((booking, idx) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-xs text-zinc-500">{booking.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{booking.customerPhone}</td>
                  <td className="px-6 py-4 text-sm">{booking.serviceTitle}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium">{booking.date}</p>
                      <p className="text-xs text-zinc-500">{booking.slot}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveBooking(booking.id)}
                            disabled={workingId === booking.id}
                            className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors text-green-400 disabled:opacity-50 text-xs font-bold flex items-center gap-2"
                            title="Approve booking"
                          >
                            {workingId === booking.id ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Approve
                          </button>
                          <button
                            onClick={() => rejectBooking(booking.id)}
                            disabled={workingId === booking.id}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                            title="Reject booking"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        disabled={workingId === booking.id}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                        title="Delete booking"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
