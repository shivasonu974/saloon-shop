import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';

interface StatsData {
  totalBookings: number;
  totalRevenue: number;
  totalServices: number;
  totalClients: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData>({
    totalBookings: 0,
    totalRevenue: 0,
    totalServices: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set mock data for demo
      setStats({
        totalBookings: 156,
        totalRevenue: 45000,
        totalServices: 12,
        totalClients: 89,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'blue',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Services Offered',
      value: stats.totalServices,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'pink',
    },
  ];

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Dashboard Overview</h2>
        <p className="text-zinc-500">Welcome back! Here's your business summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-500/10 border-blue-500/20 icon-blue',
            green: 'bg-green-500/10 border-green-500/20 text-green-400',
            purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
            pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
          };

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-xl border ${colorClasses[card.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/5 ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-1">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-6 bg-zinc-900 border border-gold/10 rounded-xl"
      >
        <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <div>
              <p className="font-medium">Bridal Makeover</p>
              <p className="text-xs text-zinc-500">March 28, 2026 - 2:00 PM</p>
            </div>
            <span className="text-gold font-bold">₹5,000</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <div>
              <p className="font-medium">Hair Styling & Spa</p>
              <p className="text-xs text-zinc-500">March 27, 2026 - 4:30 PM</p>
            </div>
            <span className="text-gold font-bold">₹2,500</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Skin Aesthetics</p>
              <p className="text-xs text-zinc-500">March 26, 2026 - 6:00 PM</p>
            </div>
            <span className="text-gold font-bold">₹3,000</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
