import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, BarChart3, BookOpen, Package, DollarSign } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStats from '../components/admin/AdminStats';
import AdminBookings from '../components/admin/AdminBookings';
import AdminServices from '../components/admin/AdminServices';
import AdminPricing from '../components/admin/AdminPricing';

type TabType = 'overview' | 'bookings' | 'services' | 'pricing';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');

    if (!token) {
      navigate('/admin/login');
      return;
    }

    setAdminEmail(email || '');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'bookings' as TabType, label: 'Bookings', icon: BookOpen },
    { id: 'services' as TabType, label: 'Services', icon: Package },
    { id: 'pricing' as TabType, label: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-gold/10 px-6 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Street Saloon Admin</h1>
            <p className="text-xs text-zinc-500 mt-1">Welcome, {adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gold text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            {activeTab === 'overview' && <AdminStats />}
            {activeTab === 'bookings' && <AdminBookings />}
            {activeTab === 'services' && <AdminServices />}
            {activeTab === 'pricing' && <AdminPricing />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
