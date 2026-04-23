import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { getOrderedCategories } from '../services/serviceService';

export default function Services() {
  const { services, loading, error } = useServices();
  const categories = getOrderedCategories(services);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif mb-6"
          >
            Refined <span className="gold-text-gradient italic">Artistry</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-2xl mx-auto text-lg"
          >
            Explore our comprehensive range of specialized hair treatments and care services designed to bring out your best look.
          </motion.p>
        </header>

        <div className="space-y-32">
          {loading ? (
            <div className="text-center py-12 text-zinc-400">Loading services...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : categories.map((category) => (
            <div key={category} className="space-y-12">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl md:text-4xl font-serif italic text-gold whitespace-nowrap">{category}</h2>
                <div className="h-px bg-gold/20 w-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.filter((service) => service.category === category).map((service, idx) => (
                  <motion.div
                    key={service.id}
                    {...fadeInUp}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative overflow-hidden rounded-[2rem] card-glass p-1 border border-white/5 hover:border-gold/30 transition-all duration-500 shadow-xl"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                      <img
                        src={service.image}
                        alt={`${service.title} salon service in ${service.category.toLowerCase()}`}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="px-6 pb-8">
                      <h3 className="serif text-2xl mb-2 text-white group-hover:text-gold transition-colors">{service.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                        {service.description || 'Professional salon service tailored to your style.'}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">Price Range</span>
                        <span className="text-lg font-serif text-gold">{service.price || 'Price on request'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-12 text-zinc-400">No services are available right now.</div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-20 rounded-[3rem] bg-zinc-950 border border-gold/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-gold),transparent_70%)]"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif mb-8 max-w-3xl mx-auto">Ready for Your <span className="gold-text-gradient">Professional Glow-Up?</span></h2>
          <Link
            to="/book"
            className="inline-block btn-gold px-12 py-5 rounded text-sm font-bold uppercase tracking-wider relative z-10"
          >
            Start Booking
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
