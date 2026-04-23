import { motion } from 'motion/react';
import { ArrowRight, Star, Instagram as InstaIcon } from 'lucide-react';
import { OFFERS, TESTIMONIALS, GALLERY_IMAGES } from '../constants/data';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export default function Home() {
  const { services, loading: servicesLoading } = useServices();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="input_file_4.png"
            alt="Street Saloon Interior"
            className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-10000 hover:scale-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gold text-xs uppercase tracking-[0.3em] mb-4 font-semibold"
          >
            Excellence in Indian Beauty
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-4xl md:text-6xl font-serif mb-8 leading-tight tracking-tight"
          >
            Timeless Elegance.<br />
            <span className="italic gold-text-gradient">Street Saloon Radiance.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-300 max-w-2xl mx-auto text-lg mb-12"
          >
            Experience the best premium salon services in Nizamabad, tailored for the modern Indian woman. 
            Visit us near Phulong Bridge for a luxury grooming experience that blends tradition with elite trends.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/book"
              className="w-full md:w-auto btn-gold px-8 py-3 rounded text-sm font-bold uppercase tracking-wider"
            >
              Book Now
            </Link>
            <a
              href="https://wa.me/916301458914"
              className="w-full md:w-auto border border-white/20 bg-white/5 px-8 py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              WHATSAPP US
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-gold to-transparent"
        />
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl mb-4">Our Signature Services</motion.h2>
              <motion.p {...fadeInUp} className="text-zinc-500 max-w-xl">From revolutionary hair styling to exquisite bridal makeovers, we offer a curated selection of premium beauty treatments.</motion.p>
            </div>
            <Link to="/services" className="text-gold flex items-center gap-2 group font-medium self-start md:self-end">
              VIEW ALL SERVICES <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servicesLoading ? (
              <div className="col-span-full text-center py-12 text-zinc-400">Loading services...</div>
            ) : (
              services.slice(0, 8).map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl card-glass p-5 border-l-2 border-l-gold"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl mb-4">
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] text-gold uppercase tracking-tighter mb-2 font-bold">{service.category}</p>
                  <h3 className="serif text-lg mb-1 text-white">{service.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4">
                    {service.description || 'Professional salon service tailored to your style.'}
                  </p>
                  <p className="text-gold font-bold text-sm tracking-tight">{service.price || 'Price on request'}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-24 luxury-gradient border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl mb-4 gold-text-gradient italic">Exclusive Packages</motion.h2>
            <motion.p {...fadeInUp} className="text-zinc-500">Specially crafted for your celebratory moments.</motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {OFFERS.map((offer, idx) => (
              <motion.div
                key={offer.id}
                whileHover={{ y: -5 }}
                className={`relative overflow-hidden p-8 md:p-12 rounded-3xl ${
                  idx % 2 === 0 ? 'bg-gold text-black' : 'bg-surface border border-gold/20'
                } flex flex-col md:flex-row items-center gap-8 group`}
              >
                <div className="flex-1 text-center md:text-left">
                  <span className={`text-xs font-bold uppercase tracking-widest ${idx % 2 === 0 ? 'bg-black/10' : 'bg-gold/10 text-gold'} px-3 py-1 rounded-full mb-4 inline-block italic`}>
                    {offer.validity}
                  </span>
                  <h3 className="text-3xl font-serif mb-4 uppercase italic font-bold">{offer.title}</h3>
                  <p className={`${idx % 2 === 0 ? 'text-black/70' : 'text-zinc-400'} mb-6`}>{offer.description}</p>
                  <Link to="/contact" className={`inline-flex items-center gap-2 font-bold border-b ${idx % 2 === 0 ? 'border-black/40' : 'border-gold'} pb-1 hover:opacity-70 transition-colors`}>
                    CLAIM OFFER <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-serif mb-2">{offer.offer.split(' ')[0]}</div>
                  <div className={`text-[10px] uppercase tracking-[0.2em] ${idx % 2 === 0 ? 'opacity-60' : 'text-zinc-500'}`}>{offer.offer.split(' ').slice(1).join(' ')}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl mb-4">What Our Queens Say</motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5"
              >
                <div className="flex gap-1 mb-6 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < item.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p className="italic text-zinc-300 mb-8 leading-relaxed">"{item.content}"</p>
                <div>
                  <h4 className="font-bold text-white mb-1">{item.name}</h4>
                  <p className="text-xs text-gold uppercase tracking-widest">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-serif mb-4">Latest on <span className="gold-text-gradient italic">Instagram</span></h2>
              <p className="text-zinc-500 max-w-xl">Follow our journey of transformations and beauty tips daily.</p>
            </motion.div>
            <motion.a 
              href="https://www.instagram.com/_street_saloon_/" 
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3"
            >
              <InstaIcon size={18} /> FOLLOW @STREETSALOON
            </motion.a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GALLERY_IMAGES.slice(0, 8).map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square rounded-2xl overflow-hidden group relative"
              >
                <img
                  src={img}
                  alt={`Street Saloon Instagram ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                  <InstaIcon className="text-white mb-2" size={28} />
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">View Post</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
