import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, CheckCircle, Clock as ClockIcon, XCircle } from 'lucide-react';

interface BookingStatusData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  serviceTitle: string;
  date: string;
  slot: string;
  message: string;
}

export default function BookingStatus() {
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingStatusData | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) {
      setError('Please enter a booking ID');
      return;
    }

    setLoading(true);
    setError(null);
    setBookingData(null);

    try {
      const response = await fetch(`/api/book/status/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
        setSearched(true);
      } else {
        setError('Booking not found. Please check your booking ID.');
        setSearched(true);
      }
    } catch (err: any) {
      setError('Failed to fetch booking status. Please try again.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-400" size={48} />;
      case 'pending':
        return <ClockIcon className="text-yellow-400" size={48} />;
      case 'rejected':
        return <XCircle className="text-red-400" size={48} />;
      case 'completed':
        return <CheckCircle className="text-blue-400" size={48} />;
      default:
        return <ClockIcon className="text-gray-400" size={48} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'completed':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓ CONFIRMED';
      case 'pending':
        return '⏳ PENDING APPROVAL';
      case 'rejected':
        return '✗ REJECTED';
      case 'completed':
        return '✓ COMPLETED';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-serif mb-4">
            Check Your <span className="gold-text-gradient italic">Booking</span>
          </h1>
          <p className="text-zinc-500 text-lg">
            Enter your booking ID to check the status of your appointment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass p-8 md:p-12 rounded-[2.5rem] mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                <Search size={14} className="text-gold" /> Booking ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1776944299986"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 text-white focus:border-gold outline-none transition-colors"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                You received this ID when you submitted your booking
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Check Status'}
            </button>
          </form>
        </motion.div>

        {error && searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center"
          >
            {error}
          </motion.div>
        )}

        {bookingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 md:p-12 rounded-2xl border ${getStatusColor(bookingData.status)}`}
          >
            <div className="flex flex-col items-center text-center mb-8">
              {getStatusIcon(bookingData.status)}
              <h2 className="text-3xl font-serif mt-4 mb-2">
                {getStatusLabel(bookingData.status)}
              </h2>
              <p className="text-zinc-400 text-sm">{bookingData.message}</p>
            </div>

            <div className="bg-black/30 p-6 rounded-xl mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                  <div className="p-3 bg-gold/10 rounded-lg">
                    <Clock size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Service</p>
                    <p className="font-semibold text-white">{bookingData.serviceTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                  <div className="p-3 bg-gold/10 rounded-lg">
                    <Calendar size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Appointment Date</p>
                    <p className="font-semibold text-white">{bookingData.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gold/10 rounded-lg">
                    <ClockIcon size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Time Slot</p>
                    <p className="font-semibold text-white">{bookingData.slot}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-400">
              <p className="text-xs text-zinc-500">
                Booking ID: <span className="font-mono text-gold">{bookingData.id}</span>
              </p>
              <p>
                For any queries, please contact us at{' '}
                <a href="tel:+916301458914" className="text-gold hover:text-yellow-300">
                  +91 6301458914
                </a>{' '}
                or email{' '}
                <a href="mailto:shivasonu974@gmail.com" className="text-gold hover:text-yellow-300">
                  shivasonu974@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        )}

        {!bookingData && !error && searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-400"
          >
            No booking found
          </motion.div>
        )}
      </div>
    </div>
  );
}
