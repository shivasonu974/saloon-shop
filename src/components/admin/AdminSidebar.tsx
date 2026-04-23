import { motion } from 'motion/react';
import { BarChart3, BookOpen, Package, DollarSign, X } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="hidden md:flex w-64 bg-zinc-900 border-r border-gold/10 flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gold/10">
        <div className="font-serif text-2xl font-bold gold-text-gradient">
          STREET SALOON
        </div>
        <p className="text-xs text-zinc-500 mt-2">Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? 'bg-gold text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-gold/10 text-xs text-zinc-500">
        <p>© 2026 Street Saloon</p>
      </div>
    </div>
  );
}
