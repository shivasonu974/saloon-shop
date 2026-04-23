import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-gold/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="font-serif text-3xl gold-text-gradient tracking-widest uppercase">Street Saloon</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Experience the art of luxury grooming and wellness. We bring out your inner queen with our expert services and premium ambiance.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/_street_saloon_/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gold/20 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-gold/20 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-gold/20 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors">Our Services</Link></li>
              <li><Link to="/gallery" className="hover:text-gold transition-colors">Portfolio</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-6 uppercase tracking-wider">Services</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="hover:text-gold cursor-pointer transition-colors">Bridal Makeover</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Hair Styling & Spa</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Skin Aesthetics</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Festival Packages</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg text-gold mb-6 uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold shrink-0" />
                <a href="https://www.google.com/maps?q=Street+Saloon+Phulong+Bridge+Shivaji+Nagar+Nizamabad+Telangana" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                  Street Saloon, Phulong Bridge, Shivaji Nagar, Nizamabad, Telangana 503001
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold shrink-0" />
                <a href="tel:+916301458914" className="hover:text-gold transition-colors">+91 6301458914</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold shrink-0" />
                <a href="mailto:shivasonu974@gmail.com" className="hover:text-gold transition-colors">shivasonu974@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-white/40 gap-4">
          <div className="flex flex-wrap justify-center gap-6">
            <span>Nizamabad, Telangana</span>
            <a href="tel:+916301458914" className="hover:text-gold transition-colors">+91 6301458914</a>
            <span>Open: 10AM - 8:30PM</span>
          </div>
          <div className="flex gap-4">
            <span>Instagram</span>
            <span>Facebook</span>
            <span className="text-gold">Street Saloon &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
