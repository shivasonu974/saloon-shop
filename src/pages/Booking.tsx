import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader,
  Search,
  XCircle,
} from 'lucide-react';
import {
  BookingRecord,
  createBooking,
  getBookedSlots,
  getBookingStatus,
} from '../services/bookingService';
import { useServices } from '../hooks/useServices';
import { getOrderedCategories } from '../services/serviceService';

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

const todayInputValue = () => new Date().toISOString().split('T')[0];

export default function Booking() {
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const categories = getOrderedCategories(services);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState('Your request is sent. Waiting for confirmation.');

  const [formData, setFormData] = useState({
    serviceId: '',
    serviceTitle: '',
    date: todayInputValue(),
    slot: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    async function checkAvailability() {
      if (!formData.date) return;

      const slots = await getBookedSlots(formData.date);
      setBookedSlots(slots || []);
    }

    checkAvailability();
  }, [formData.date]);

  useEffect(() => {
    if (!booking || booking.status !== 'pending') return;

    const intervalId = window.setInterval(() => {
      void refreshBookingStatus(false);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [booking?.id, booking?.status]);

  const handleServiceSelect = (id: string, title: string) => {
    setFormData({ ...formData, serviceId: id, serviceTitle: title });
    setStep(2);
  };

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newBooking = await createBooking(formData);
      setBooking(newBooking);
      setStatusMessage('Your request is sent. Waiting for confirmation.');
      localStorage.setItem('lastBookingId', newBooking.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshBookingStatus = async (showLoader = true) => {
    if (!booking) return;

    if (showLoader) {
      setCheckingStatus(true);
      setError(null);
    }

    try {
      const data = await getBookingStatus(booking.id);
      setBooking((current) => (current ? { ...current, status: data.status } : current));
      setStatusMessage(data.message);
    } catch (err: any) {
      if (showLoader) {
        setError(err.message || 'Failed to check booking status');
      }
    } finally {
      if (showLoader) {
        setCheckingStatus(false);
      }
    }
  };

  if (success && booking) {
    const isApproved = booking.status === 'approved';
    const isRejected = booking.status === 'rejected';
    const statusIcon = isApproved ? (
      <CheckCircle className="text-green-400" size={40} />
    ) : isRejected ? (
      <XCircle className="text-red-400" size={40} />
    ) : (
      <Clock className="text-yellow-400" size={40} />
    );
    const statusTone = isApproved
      ? 'bg-green-500/10 border-green-500/20 text-green-400'
      : isRejected
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';

    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-surface border border-gold/20 p-8 md:p-12 rounded-[2.5rem] text-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${statusTone}`}>
            {statusIcon}
          </div>

          <h2 className="text-3xl font-serif mb-4">
            {isApproved ? 'Your booking is confirmed' : isRejected ? 'Booking Request Rejected' : 'Booking Request Sent'}
          </h2>

          <p className="text-zinc-400 mb-6">
            {isApproved
              ? 'Your appointment has been approved by the admin.'
              : isRejected
                ? 'Please contact us or submit another request for a different slot.'
                : 'Your request is sent. Waiting for confirmation.'}
          </p>

          <div className={`border p-6 rounded-2xl mb-8 ${statusTone}`}>
            <p className="font-semibold mb-3">{statusMessage}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-300">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Service</p>
                <p className="font-medium text-white">{booking.serviceTitle}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Date</p>
                <p className="font-medium text-white">{booking.date}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Time</p>
                <p className="font-medium text-white">{booking.slot}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-5">
              Booking ID: <span className="font-mono text-gold">{booking.id}</span>
            </p>
          </div>

          {error && (
            <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => refreshBookingStatus()}
              disabled={checkingStatus}
              className="btn-gold py-3 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {checkingStatus ? (
                <>
                  <Loader size={18} className="animate-spin" /> Checking
                </>
              ) : (
                <>
                  <Search size={18} /> Check Status
                </>
              )}
            </button>
            <button
              onClick={() => { window.location.href = '/booking-status'; }}
              className="bg-zinc-800 py-3 rounded font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors"
            >
              Status Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            Book Your <span className="gold-text-gradient">Experience</span>
          </h1>
          <div className="flex justify-center items-center gap-4 text-xs font-bold tracking-widest text-white/30 uppercase">
            <span className={step >= 1 ? 'text-gold' : ''}>Service</span>
            <ChevronRight size={14} />
            <span className={step >= 2 ? 'text-gold' : ''}>Date & Time</span>
            <ChevronRight size={14} />
            <span className={step >= 3 ? 'text-gold' : ''}>Details</span>
          </div>
        </header>

        <div className="card-glass rounded-[2.5rem] overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <h3 className="text-2xl font-serif mb-8 italic text-center">Choose a Service</h3>
                <div className="space-y-10">
                  {servicesLoading ? (
                    <div className="text-center py-12 text-zinc-400">Loading services...</div>
                  ) : servicesError ? (
                    <div className="text-center py-12 text-red-400">{servicesError}</div>
                  ) : categories.map((category) => (
                    <div key={category} className="space-y-4">
                      <h4 className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-2">
                        {category} <div className="h-px bg-gold/20 w-full"></div>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {services.filter((service) => service.category === category).map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service.id, service.title)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              formData.serviceId === service.id
                                ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(197,160,40,0.1)]'
                                : 'bg-black/20 border-white/5 hover:border-gold/30'
                            }`}
                          >
                            <h5 className="font-serif text-base text-white mb-0.5">{service.title}</h5>
                            <p className="text-[10px] text-zinc-500">{service.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!servicesLoading && !servicesError && categories.length === 0 && (
                    <div className="text-center py-12 text-zinc-400">No services available for booking right now.</div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <button onClick={() => setStep(1)} className="text-gold flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <h3 className="text-2xl font-serif italic text-center flex-grow pr-12">Select Date & Time</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                      <Calendar size={14} className="text-gold" /> Appointment Date
                    </label>
                    <input
                      type="date"
                      min={todayInputValue()}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 text-white focus:border-gold outline-none transition-colors appearance-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value, slot: '' })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                      <Clock size={14} className="text-gold" /> Available Slots
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isTaken = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            disabled={isTaken}
                            onClick={() => setFormData({ ...formData, slot })}
                            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                              formData.slot === slot
                                ? 'bg-gold text-black'
                                : isTaken
                                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                                  : 'bg-black/20 border border-white/5 hover:border-gold/30 text-white'
                            }`}
                          >
                            {slot} {isTaken && '(Taken)'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!formData.date || !formData.slot || !formData.serviceId}
                  onClick={() => setStep(3)}
                  className="w-full btn-gold py-4 rounded mt-12 font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <button onClick={() => setStep(2)} className="text-gold flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <h3 className="text-2xl font-serif italic text-center flex-grow pr-12">Your Details</h3>
                </div>

                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                        <User size={14} className="text-gold" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                        placeholder="e.g. Rahul Kumar"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                        <Phone size={14} className="text-gold" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                        placeholder="e.g. 6301458914"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                      <Mail size={14} className="text-gold" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                      placeholder="e.g. rahul@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    />
                  </div>

                  <div className="bg-gold/5 border border-gold/10 p-6 rounded-2xl mb-8">
                    <h4 className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-4">Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Service:</span>
                      <span className="text-white font-medium">{formData.serviceTitle}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-zinc-500">Date:</span>
                      <span className="text-white font-medium">{formData.date}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-zinc-500">Time:</span>
                      <span className="text-white font-medium">{formData.slot}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-3">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !formData.serviceId}
                    className="w-full btn-gold py-5 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" /> Submitting
                      </>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
