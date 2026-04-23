import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function FloatingWhatsApp() {
  const message = encodeURIComponent("Hi Street Saloon, I'd like to book an appointment. Can you help me with the available slots?");
  const whatsappUrl = `https://wa.me/916301458914?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-12 right-20 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(37,211,102,0.3)] group"
    >
      <div className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
        Chat with us
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
      </div>
      <MessageCircle size={24} />
    </motion.a>
  );
}
