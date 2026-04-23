import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useServices } from '../hooks/useServices';

export default function Contact() {
  const { services } = useServices();
  const [formState, setFormState] = useState({ name: '', email: '', service: '', message: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Thank you! We will get back to you shortly.');
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
            Get in <span className="gold-text-gradient italic">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-2xl mx-auto text-lg"
          >
            Book your consultation or visit our studio for a premium grooming experience.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {[
                { 
                  icon: MapPin, 
                  title: 'Our Studio', 
                  desc: 'Street Saloon, Phulong Bridge, Shivaji Nagar, Nizamabad, Telangana 503001',
                  link: 'https://www.google.com/maps?q=Street+Saloon+Phulong+Bridge+Shivaji+Nagar+Nizamabad+Telangana'
                },
                { 
                  icon: Phone, 
                  title: 'Call Us', 
                  desc: '+91 6301458914',
                  link: 'tel:+916301458914'
                },
                { 
                  icon: Mail, 
                  title: 'Email Us', 
                  desc: 'shivasonu974@gmail.com',
                  link: 'mailto:shivasonu974@gmail.com'
                },
                { 
                  icon: Clock, 
                  title: 'Working Hours', 
                  desc: 'Mon - Sun: 10:00 AM - 08:30 PM' 
                },
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.link} 
                  target={item.link?.startsWith('http') ? '_blank' : undefined} 
                  rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`p-6 rounded-2xl card-glass gold-border block transition-transform hover:scale-[1.02] ${!item.link ? 'cursor-default pointer-events-none' : ''}`}
                >
                  <item.icon className="text-gold mb-4" size={24} />
                  <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">{item.desc}</p>
                </a>
              ))}
            </motion.div>

            {/* Map Placeholder */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden grayscale brightness-50 border border-white/5 shadow-2xl">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3789.475171701335!2d78.0945!3d18.6758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcddb7c4d5d5d5d%3A0xbcddb7c4d5d5d5d!2sPhulong%20Bridge!5e0!3m2!1sen!2sin!4v1654600000000!5m2!1sen!2sin"
                className="w-full h-full"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-glass p-8 md:p-12 rounded-[2.5rem]"
          >
            <h2 className="text-3xl font-serif mb-8 italic">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                  placeholder="e.g. Ananya Rao"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors"
                  placeholder="ananya@example.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Interested In</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-colors appearance-none"
                  value={formState.service}
                  onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.title}</option>
                  ))}
                  <option value="other">Other Inquiry</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Your Message</label>
                <textarea
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 text-white focus:border-gold outline-none transition-colors h-32 resize-none"
                  placeholder="Tell us about your requirements..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full btn-gold px-10 py-4 rounded text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 group"
              >
                SEND MESSAGE <Send size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
