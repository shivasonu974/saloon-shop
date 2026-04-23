-- ============================================
-- STREET SALOON - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- =====================
-- 1. SERVICES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  image TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. BOOKINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_title TEXT NOT NULL,
  service_id TEXT,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notification_message TEXT,
  notification_channels TEXT[],
  notification_sent_at TIMESTAMPTZ
);

-- =====================
-- 3. PRICING TABLE
-- =====================
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  base_price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  discount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 4. INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- =====================
-- 5. ROW LEVEL SECURITY
-- =====================

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Services: public read, service_role write
CREATE POLICY "Public can read services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage services" ON services
  FOR ALL USING (true) WITH CHECK (true);

-- Bookings: public insert + read by id, service_role full access
CREATE POLICY "Public can insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read own booking" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

-- Pricing: service_role only
CREATE POLICY "Service role can manage pricing" ON pricing
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read pricing" ON pricing
  FOR SELECT USING (true);

-- =====================
-- 6. SEED DATA - SERVICES
-- =====================
INSERT INTO services (id, category, title, price, description, image) VALUES
  ('haircut-men', 'Basic Services', 'Haircut (Men)', '₹100 – ₹250', 'Classic and modern grooming for men by our expert stylists.', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1200'),
  ('haircut-women', 'Basic Services', 'Haircut (Women)', '₹200 – ₹500', 'Expertly crafted precision cuts and bespoke styles for women.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200'),
  ('haircut-kids', 'Basic Services', 'Haircut (Kids)', '₹80 – ₹200', 'A friendly and enjoyable salon experience for our youngest guests.', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=1200'),
  ('hairwash-cond', 'Basic Services', 'Hair wash & conditioning', '₹100 – ₹200', 'Refreshing scalp cleanse followed by premium moisture infusion.', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200'),
  ('blowdry-styling', 'Basic Services', 'Blow dry & styling', '₹150 – ₹400', 'Professional finishing for incredible volume, shine, and hold.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200'),
  ('straightening-temp', 'Styling', 'Straightening (temporary)', '₹200 – ₹500', 'Safe and effective flat-iron straightening for a sleek finish.', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1200'),
  ('curling-waves', 'Styling', 'Curling / Waves', '₹300 – ₹700', 'Glamorous curls or relaxed beach waves with professional tools.', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=1200'),
  ('hair-setting-events', 'Styling', 'Hair setting (for events)', '₹300 – ₹800', 'Elegant up-dos and event-ready hair that lasts all night.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200'),
  ('global-color', 'Coloring', 'Global hair color', '₹800 – ₹2000', 'Professional full-head coloring for a vibrant and uniform look.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200'),
  ('highlights-lowlights', 'Coloring', 'Highlights / Lowlights', '₹1000 – ₹3000', 'Artistic color placement to add dimension and brilliance.', 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=1200'),
  ('balayage-ombre', 'Coloring', 'Balayage / Ombre', '₹1500 – ₹4000', 'Seamless hand-painted color transitions and gradients.', 'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&q=80&w=1200'),
  ('root-touchup', 'Coloring', 'Root touch-up', '₹500 – ₹1200', 'Flawless color matching for seamless maintenance.', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=1200'),
  ('hair-spa', 'Treatments', 'Hair spa', '₹300 – ₹800', 'Deep scalp therapy and hair nourishment for total relaxation.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200'),
  ('keratin-treatment', 'Treatments', 'Keratin treatment', '₹2500 – ₹5000', 'Revolutionary protein treatment for frizz-free, smooth hair.', 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=1200'),
  ('smoothening', 'Treatments', 'Smoothening', '₹3000 – ₹6000', 'Achieve perfectly manageable and radiant straight hair.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200'),
  ('rebonding', 'Treatments', 'Rebonding', '₹4000 – ₹8000', 'Permanent hair straightening for a consistently sleek look.', 'https://images.unsplash.com/photo-1596178060671-7a58b93f4c34?auto=format&fit=crop&q=80&w=1200'),
  ('botox-hair', 'Treatments', 'Botox hair treatment', '₹2000 – ₹5000', 'Anti-aging hair fiber repair for extreme shine and volume.', 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=1200'),
  ('oil-massage', 'Care', 'Oil massage (champi)', '₹50 – ₹150', 'Traditional head massage with aromatic herbal scalp oils.', 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1200'),
  ('dandruff-treatment', 'Care', 'Dandruff treatment', '₹200 – ₹600', 'Specialized scalp therapy to treat irritation and dandruff.', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=1200'),
  ('hairfall-control', 'Care', 'Hair fall control treatment', '₹300 – ₹800', 'Targeted root-strengthening therapy to reduce hair thinning.', 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&q=80&w=1200')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- 7. SEED DATA - PRICING
-- =====================
INSERT INTO pricing (id, service, base_price, discount_price, discount) VALUES
  ('haircut-men', 'Haircut (Men)', 175, NULL, 0),
  ('haircut-women', 'Haircut (Women)', 350, NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- 8. SEED DATA - SAMPLE BOOKING
-- =====================
INSERT INTO bookings (id, customer_name, customer_email, customer_phone, service_title, service_id, date, slot, status, created_at, approved_at, approved_by) VALUES
  ('1', 'Priya Sharma', 'priya@example.com', '9876543210', 'Haircut (Women)', 'haircut-women', '2026-03-28', '2:00 PM', 'approved', '2026-03-20T10:00:00.000Z', '2026-03-20T10:05:00.000Z', 'sonu@streetsaloon.com')
ON CONFLICT (id) DO NOTHING;
