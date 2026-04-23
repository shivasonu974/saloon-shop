import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function seed() {
  console.log("📦 Seeding Supabase database...\n");

  const services = [
    { id: 'haircut-men', category: 'Basic Services', title: 'Haircut (Men)', price: '₹100 – ₹250', description: 'Classic and modern grooming for men by our expert stylists.', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1200' },
    { id: 'haircut-women', category: 'Basic Services', title: 'Haircut (Women)', price: '₹200 – ₹500', description: 'Expertly crafted precision cuts and bespoke styles for women.', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200' },
    { id: 'haircut-kids', category: 'Basic Services', title: 'Haircut (Kids)', price: '₹80 – ₹200', description: 'A friendly and enjoyable salon experience for our youngest guests.', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=1200' },
    { id: 'hairwash-cond', category: 'Basic Services', title: 'Hair wash & conditioning', price: '₹100 – ₹200', description: 'Refreshing scalp cleanse followed by premium moisture infusion.', image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200' },
    { id: 'blowdry-styling', category: 'Basic Services', title: 'Blow dry & styling', price: '₹150 – ₹400', description: 'Professional finishing for incredible volume, shine, and hold.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200' },
    { id: 'straightening-temp', category: 'Styling', title: 'Straightening (temporary)', price: '₹200 – ₹500', description: 'Safe and effective flat-iron straightening for a sleek finish.', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1200' },
    { id: 'curling-waves', category: 'Styling', title: 'Curling / Waves', price: '₹300 – ₹700', description: 'Glamorous curls or relaxed beach waves with professional tools.', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=1200' },
    { id: 'hair-setting-events', category: 'Styling', title: 'Hair setting (for events)', price: '₹300 – ₹800', description: 'Elegant up-dos and event-ready hair that lasts all night.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200' },
    { id: 'global-color', category: 'Coloring', title: 'Global hair color', price: '₹800 – ₹2000', description: 'Professional full-head coloring for a vibrant and uniform look.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200' },
    { id: 'highlights-lowlights', category: 'Coloring', title: 'Highlights / Lowlights', price: '₹1000 – ₹3000', description: 'Artistic color placement to add dimension and brilliance.', image: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=1200' },
    { id: 'balayage-ombre', category: 'Coloring', title: 'Balayage / Ombre', price: '₹1500 – ₹4000', description: 'Seamless hand-painted color transitions and gradients.', image: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&q=80&w=1200' },
    { id: 'root-touchup', category: 'Coloring', title: 'Root touch-up', price: '₹500 – ₹1200', description: 'Flawless color matching for seamless maintenance.', image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=1200' },
    { id: 'hair-spa', category: 'Treatments', title: 'Hair spa', price: '₹300 – ₹800', description: 'Deep scalp therapy and hair nourishment for total relaxation.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200' },
    { id: 'keratin-treatment', category: 'Treatments', title: 'Keratin treatment', price: '₹2500 – ₹5000', description: 'Revolutionary protein treatment for frizz-free, smooth hair.', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=1200' },
    { id: 'smoothening', category: 'Treatments', title: 'Smoothening', price: '₹3000 – ₹6000', description: 'Achieve perfectly manageable and radiant straight hair.', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200' },
    { id: 'rebonding', category: 'Treatments', title: 'Rebonding', price: '₹4000 – ₹8000', description: 'Permanent hair straightening for a consistently sleek look.', image: 'https://images.unsplash.com/photo-1596178060671-7a58b93f4c34?auto=format&fit=crop&q=80&w=1200' },
    { id: 'botox-hair', category: 'Treatments', title: 'Botox hair treatment', price: '₹2000 – ₹5000', description: 'Anti-aging hair fiber repair for extreme shine and volume.', image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=1200' },
    { id: 'oil-massage', category: 'Care', title: 'Oil massage (champi)', price: '₹50 – ₹150', description: 'Traditional head massage with aromatic herbal scalp oils.', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1200' },
    { id: 'dandruff-treatment', category: 'Care', title: 'Dandruff treatment', price: '₹200 – ₹600', description: 'Specialized scalp therapy to treat irritation and dandruff.', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=1200' },
    { id: 'hairfall-control', category: 'Care', title: 'Hair fall control treatment', price: '₹300 – ₹800', description: 'Targeted root-strengthening therapy to reduce hair thinning.', image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&q=80&w=1200' },
  ];

  const { error: sErr } = await supabase.from("services").upsert(services, { onConflict: "id" });
  if (sErr) { console.error("❌ Services:", sErr.message); return; }
  console.log(`✅ ${services.length} services inserted`);

  const { error: pErr } = await supabase.from("pricing").upsert([
    { id: "haircut-men", service: "Haircut (Men)", base_price: 175, discount_price: null, discount: 0 },
    { id: "haircut-women", service: "Haircut (Women)", base_price: 350, discount_price: null, discount: 0 },
  ], { onConflict: "id" });
  if (pErr) { console.error("❌ Pricing:", pErr.message); return; }
  console.log("✅ 2 pricing entries inserted");

  const { error: bErr } = await supabase.from("bookings").upsert([{
    id: "1", customer_name: "Priya Sharma", customer_email: "priya@example.com",
    customer_phone: "9876543210", service_title: "Haircut (Women)", service_id: "haircut-women",
    date: "2026-03-28", slot: "2:00 PM", status: "approved",
    approved_at: "2026-03-20T10:05:00.000Z", approved_by: "sonu@streetsaloon.com",
  }], { onConflict: "id" });
  if (bErr) { console.error("❌ Booking:", bErr.message); return; }
  console.log("✅ Sample booking inserted");

  const { count: sc } = await supabase.from("services").select("*", { count: "exact", head: true });
  const { count: bc } = await supabase.from("bookings").select("*", { count: "exact", head: true });
  const { count: pc } = await supabase.from("pricing").select("*", { count: "exact", head: true });
  console.log(`\n🎉 Done! Services=${sc}, Bookings=${bc}, Pricing=${pc}`);
}

seed().catch(console.error);
