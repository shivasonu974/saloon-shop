// Vercel Serverless Function — Express API
// All API routes from server.ts, without static serving or app.listen().
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminCredentials = {
  email: process.env.ADMIN_EMAIL || "sonu@streetsaloon.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseServiceKey) return null;
    _supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabase;
}

const DEFAULT_SERVICE_IMAGE = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800";
const CATEGORY_IMAGES: Record<string, string> = {
  "basic services": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
  styling: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
  coloring: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800",
  treatments: "https://images.unsplash.com/photo-1519823551278-64ac92734314?auto=format&fit=crop&q=80&w=800",
  care: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
  facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
  bridal: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&q=80&w=800",
  grooming: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
  beard: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
  hair: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  makeup: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&q=80&w=800",
};
const getCategoryImage = (category: string): string => {
  const n = category.toLowerCase().trim();
  if (CATEGORY_IMAGES[n]) return CATEGORY_IMAGES[n];
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (n.includes(key) || key.includes(n)) return url;
  }
  return DEFAULT_SERVICE_IMAGE;
};

const BOOKING_CONFIRMED_MESSAGE = "Your booking is confirmed";

// ============ FALLBACK BOOKING STORAGE ============
// In-memory bookings when Supabase is unavailable
const fallbackBookings = new Map<string, any>();

// DEFAULT SERVICES (FALLBACK)
const DEFAULT_SERVICES = [
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

type BookingStatus = "pending" | "approved" | "rejected";
const getStatusMessage = (status: BookingStatus, rejectionReason?: string): string => {
  const m: Record<BookingStatus, string> = {
    pending: "Your request is sent. Waiting for confirmation.",
    approved: BOOKING_CONFIRMED_MESSAGE,
    rejected: rejectionReason ? `Your booking request was rejected. Reason: ${rejectionReason}` : "Your booking request was rejected.",
  };
  return m[status];
};
const normalizeOptionalString = (value: unknown) => String(value ?? "").trim();
const createServiceId = (title: string, existingIds: string[], currentId?: string) => {
  const baseId = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `service-${Date.now()}`;
  let candidate = baseId;
  let suffix = 2;
  while (existingIds.some((id) => id === candidate && id !== currentId)) { candidate = `${baseId}-${suffix}`; suffix += 1; }
  return candidate;
};
const generateBookingId = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SS-${code}`;
};

// ── Middleware ──
const verifyAdminToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try { const decoded = jwt.verify(token, JWT_SECRET); req.admin = decoded; next(); }
  catch { return res.status(401).json({ message: "Invalid token" }); }
};
const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
};
const requireSupabase = (_req: any, res: express.Response, next: express.NextFunction) => {
  if (!getSupabase()) return res.status(503).json({ message: "Database service temporarily unavailable." });
  next();
};

// ── Notifications ──
const generateBookingConfirmationEmail = (booking: any): string => {
  const d = new Date(booking.date);
  const fd = d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px"><h1 style="color:#c5a028;margin:0;font-size:28px">Booking Confirmed!</h1><p style="color:#fff;margin:8px 0 0">Your appointment is confirmed</p></div><div style="background:#f9f9f9;padding:20px;border-radius:8px;margin-bottom:24px"><p style="margin-top:0">Hi ${booking.customer_name},</p><p>Your booking has been <strong>approved</strong>. We look forward to serving you!</p></div><div style="background:#fff;border:2px solid #c5a028;border-radius:8px;padding:20px;margin-bottom:24px"><h2 style="color:#c5a028;margin-top:0">Booking Details</h2><p><strong>ID:</strong> ${booking.id}</p><p><strong>Service:</strong> ${booking.service_title}</p><p><strong>Date:</strong> ${fd}</p><p><strong>Time:</strong> ${booking.slot}</p><p><strong>Phone:</strong> ${booking.customer_phone}</p></div><div style="background:#f0f8ff;padding:16px;border-left:4px solid #c5a028;border-radius:4px;margin-bottom:24px"><p style="margin:0"><strong>Please arrive 10 minutes early.</strong></p></div><div style="text-align:center;color:#666;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #ddd"><p>&copy; 2024 Street Saloon. All rights reserved.</p></div></div>`;
};
const postNotificationWebhook = async (url: string, token: string | undefined, payload: Record<string, unknown>) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`Webhook failed: ${r.status}`);
};
const sendBookingConfirmationNotification = async (booking: any) => {
  const supabase = getSupabase();
  if (!supabase) return;
  const message = BOOKING_CONFIRMED_MESSAGE;
  const channels = ["website"];
  const payload = { bookingId: booking.id, toPhone: booking.customer_phone, toEmail: booking.customer_email, customerName: booking.customer_name, serviceTitle: booking.service_title, date: booking.date, slot: booking.slot, message, emailHtml: generateBookingConfirmationEmail(booking), subject: `Booking Confirmed - ${booking.id}` };
  const tasks: Promise<void>[] = [];
  if (process.env.WHATSAPP_API_URL) tasks.push(postNotificationWebhook(process.env.WHATSAPP_API_URL, process.env.WHATSAPP_API_TOKEN, payload).then(() => { channels.push("whatsapp"); }));
  if (process.env.EMAIL_WEBHOOK_URL) tasks.push(postNotificationWebhook(process.env.EMAIL_WEBHOOK_URL, process.env.EMAIL_WEBHOOK_TOKEN, payload).then(() => { channels.push("email"); }));
  await Promise.allSettled(tasks);
  supabase.from("bookings").update({ notification_message: message, notification_channels: channels, notification_sent_at: new Date().toISOString() }).eq("id", booking.id).then(() => {}).catch((e: any) => console.warn("[NOTIFICATION]", e));
};

// ── Express App ──
const app = express();
app.get("/health", (_req, res) => res.status(200).json({ status: "ok", timestamp: Date.now() }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", brand: "Street Saloon", database: getSupabase() ? "connected" : "not configured" }));
app.use(express.json({ limit: "1mb" }));
app.use(corsMiddleware);

// Public routes
app.get("/api/services", async (_req, res) => {
  const s = getSupabase();
  if (s) {
    try {
      const { data, error } = await s.from("services").select("*").order("created_at");
      if (!error && data && data.length > 0) {
        return res.json((data || []).map((svc: any) => ({ ...svc, image: svc.image || getCategoryImage(svc.category || "") })));
      }
    } catch (err) {
      console.warn("[SERVICES] Failed to fetch from Supabase");
    }
  }
  console.log("[SERVICES] Using fallback default services");
  res.json(DEFAULT_SERVICES.map((svc: any) => ({ ...svc, image: svc.image || getCategoryImage(svc.category || "") })));
});
app.get("/api/availability", async (req, res) => {
  const date = String(req.query.date || "");
  if (!date) return res.status(400).json({ message: "Date is required" });
  const s = getSupabase();
  if (!s) {
    console.log("[AVAILABILITY] Supabase not available, returning empty slots");
    return res.json({ date, slots: [] });
  }
  try {
    const { data, error } = await s.from("bookings").select("slot").eq("date", date).in("status", ["pending", "approved"]);
    if (error) {
      console.warn("[AVAILABILITY] Query error:", error.message);
      return res.json({ date, slots: [] });
    }
    res.json({ date, slots: (data || []).map((b: any) => b.slot) });
  } catch (err: any) {
    console.warn("[AVAILABILITY] Exception:", err.message);
    res.json({ date, slots: [] });
  }
});
app.post("/api/book", async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, serviceId, serviceTitle, date, slot } = req.body;
    if (!customerName || !customerEmail || !customerPhone || !serviceId || !serviceTitle || !date || !slot) return res.status(400).json({ message: "Missing required fields" });
    
    const bookingId = generateBookingId();
    const newBooking = { id: bookingId, customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone, service_id: serviceId, service_title: serviceTitle, date, slot, status: "pending", created_at: new Date().toISOString() };
    
    const s = getSupabase();
    if (s) {
      try {
        const { data: existing } = await s.from("bookings").select("id").eq("date", date).eq("slot", slot).in("status", ["pending", "approved"]).limit(1);
        if (existing && existing.length > 0) return res.status(409).json({ message: "This time slot has just been taken. Please select another." });
        const { data, error } = await s.from("bookings").insert([newBooking]).select().single();
        if (error) throw new Error(error.message);
        console.log(`[BOOKING] New booking (PENDING, DB): ${customerName} for ${serviceTitle} on ${date} at ${slot}`);
        res.status(201).json({ success: true, message: "Your request is sent. Waiting for confirmation.", booking: { id: data.id, customerName: data.customer_name, customerEmail: data.customer_email, customerPhone: data.customer_phone, serviceId: data.service_id, serviceTitle: data.service_title, date: data.date, slot: data.slot, status: data.status, createdAt: data.created_at } });
        return;
      } catch (dbError: any) {
        console.warn(`[BOOKING] Database error, using fallback: ${dbError.message}`);
      }
    }
    
    // Fallback: store booking in memory
    fallbackBookings.set(bookingId, newBooking);
    console.log(`[BOOKING] New booking (PENDING, FALLBACK): ${customerName} for ${serviceTitle} on ${date} at ${slot}`);
    res.status(201).json({ success: true, message: "Your request is sent. Waiting for confirmation.", booking: { id: newBooking.id, customerName: newBooking.customer_name, customerEmail: newBooking.customer_email, customerPhone: newBooking.customer_phone, serviceId: newBooking.service_id, serviceTitle: newBooking.service_title, date: newBooking.date, slot: newBooking.slot, status: newBooking.status, createdAt: newBooking.created_at } });
  } catch (error: any) { res.status(500).json({ message: "Failed to create booking", error: error.message }); }
});
app.get("/api/book/status/:id", async (req, res) => {
  const { id } = req.params;
  const s = getSupabase();
  if (s) {
    try {
      const { data, error } = await s.from("bookings").select("*").eq("id", id).single();
      if (!error && data) return res.json({ id: data.id, status: data.status, serviceTitle: data.service_title, date: data.date, slot: data.slot, message: getStatusMessage(data.status, data.rejection_reason) });
    } catch (dbError: any) {
      console.warn(`[BOOKING] Database error checking status: ${dbError.message}`);
    }
  }
  const fallbackBooking = fallbackBookings.get(id);
  if (fallbackBooking) return res.json({ id: fallbackBooking.id, status: fallbackBooking.status, serviceTitle: fallbackBooking.service_title, date: fallbackBooking.date, slot: fallbackBooking.slot, message: `Your booking is ${fallbackBooking.status}. We'll notify you soon.` });
  res.status(404).json({ message: "Booking not found" });
});

// Admin routes
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === adminCredentials.email && password === adminCredentials.password) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, message: "Login successful" });
  }
  res.status(401).json({ message: "Invalid email or password" });
});
const mapBooking = (b: any) => ({ id: b.id, customerName: b.customer_name, customerEmail: b.customer_email, customerPhone: b.customer_phone, serviceTitle: b.service_title, serviceId: b.service_id, date: b.date, slot: b.slot, status: b.status, createdAt: b.created_at, approvedAt: b.approved_at, approvedBy: b.approved_by, rejectedAt: b.rejected_at, rejectionReason: b.rejection_reason });
const getFallbackAdminBookings = () => Array.from(fallbackBookings.values()).map(mapBooking);
app.get("/api/admin/stats", verifyAdminToken, async (_req, res) => {
  const s = getSupabase();
  if (!s) {
    const fallbackBookingCount = fallbackBookings.size;
    return res.json({ totalBookings: fallbackBookingCount, totalRevenue: fallbackBookingCount * 350, totalServices: DEFAULT_SERVICES.length, totalClients: fallbackBookingCount });
  }
  try {
    const [br, sr, er] = await Promise.all([s.from("bookings").select("*", { count: "exact", head: true }), s.from("services").select("*", { count: "exact", head: true }), s.from("bookings").select("customer_email")]);
    res.json({ totalBookings: br.count || 0, totalRevenue: (br.count || 0) * 350, totalServices: sr.count || 0, totalClients: new Set((er.data || []).map((e: any) => e.customer_email)).size });
  } catch (err: any) {
    console.warn("[ADMIN STATS] Database error, using fallback");
    const fallbackBookingCount = fallbackBookings.size;
    res.json({ totalBookings: fallbackBookingCount, totalRevenue: fallbackBookingCount * 350, totalServices: DEFAULT_SERVICES.length, totalClients: fallbackBookingCount });
  }
});
const getAdminBookings = [verifyAdminToken, async (_req: any, res: express.Response) => {
  const s = getSupabase();
  if (!s) {
    console.log("[ADMIN BOOKINGS] Database unavailable, returning fallback bookings");
    return res.json(getFallbackAdminBookings());
  }
  try {
    const { data, error } = await s.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    res.json((data || []).map(mapBooking));
  } catch (err: any) {
    console.warn("[ADMIN BOOKINGS] Database error, returning fallback bookings:", err.message);
    res.json(getFallbackAdminBookings());
  }
}];
app.get("/api/bookings", ...getAdminBookings);
app.get("/api/admin/bookings", ...getAdminBookings);
app.put("/api/book/:id/approve", verifyAdminToken, async (req: any, res) => {
  const s = getSupabase();
  if (!s) {
    const booking = fallbackBookings.get(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "rejected") return res.status(409).json({ message: "Rejected bookings cannot be approved" });
    booking.status = "approved";
    booking.approved_at = new Date().toISOString();
    booking.approved_by = req.admin.email;
    delete booking.rejected_at;
    delete booking.rejection_reason;
    return res.json({ success: true, message: "Booking approved successfully", booking: mapBooking(booking) });
  }
  try {
    const { id } = req.params;
    const { data: booking, error: fe } = await s.from("bookings").select("*").eq("id", id).single();
    if (fe || !booking) {
      const fallbackBooking = fallbackBookings.get(id);
      if (fallbackBooking) {
        if (fallbackBooking.status === "rejected") return res.status(409).json({ message: "Rejected bookings cannot be approved" });
        fallbackBooking.status = "approved";
        fallbackBooking.approved_at = new Date().toISOString();
        fallbackBooking.approved_by = req.admin.email;
        delete fallbackBooking.rejected_at;
        delete fallbackBooking.rejection_reason;
        console.warn(`[APPROVAL] Database lookup failed, approved fallback booking ${id}:`, fe?.message);
        return res.json({ success: true, message: "Booking approved successfully", booking: mapBooking(fallbackBooking) });
      }
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status === "rejected") return res.status(409).json({ message: "Rejected bookings cannot be approved" });
    const { data, error } = await s.from("bookings").update({ status: "approved", approved_at: new Date().toISOString(), approved_by: req.admin.email }).eq("id", id).select().single();
    if (error || !data) {
      const fallbackBooking = fallbackBookings.get(id);
      if (fallbackBooking) {
        if (fallbackBooking.status === "rejected") return res.status(409).json({ message: "Rejected bookings cannot be approved" });
        fallbackBooking.status = "approved";
        fallbackBooking.approved_at = new Date().toISOString();
        fallbackBooking.approved_by = req.admin.email;
        delete fallbackBooking.rejected_at;
        delete fallbackBooking.rejection_reason;
        console.warn(`[APPROVAL] Database update failed, approved fallback booking ${id}:`, error?.message);
        return res.json({ success: true, message: "Booking approved successfully", booking: mapBooking(fallbackBooking) });
      }
      return res.status(500).json({ message: error?.message || "Failed to approve booking" });
    }
    sendBookingConfirmationNotification(data).catch((e) => console.warn(`[WARNING] Notification failed for ${id}:`, e.message));
    res.json({ success: true, message: "Booking approved successfully", booking: mapBooking(data) });
  } catch (error: any) {
    const fallbackBooking = fallbackBookings.get(req.params.id);
    if (fallbackBooking) {
      if (fallbackBooking.status === "rejected") return res.status(409).json({ message: "Rejected bookings cannot be approved" });
      fallbackBooking.status = "approved";
      fallbackBooking.approved_at = new Date().toISOString();
      fallbackBooking.approved_by = req.admin.email;
      delete fallbackBooking.rejected_at;
      delete fallbackBooking.rejection_reason;
      console.warn(`[APPROVAL] Database error, approved fallback booking ${req.params.id}:`, error.message);
      return res.json({ success: true, message: "Booking approved successfully", booking: mapBooking(fallbackBooking) });
    }
    res.status(500).json({ message: "Failed to approve booking", error: error.message });
  }
});
app.put("/api/book/:id/reject", verifyAdminToken, async (req, res) => {
  const s = getSupabase();
  if (!s) {
    const booking = fallbackBookings.get(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "rejected";
    booking.rejection_reason = req.body.reason || "No reason provided";
    booking.rejected_at = new Date().toISOString();
    delete booking.approved_at;
    delete booking.approved_by;
    return res.json({ success: true, message: "Booking rejected", booking: mapBooking(booking) });
  }
  try {
    const { id } = req.params;
    const { data, error } = await s.from("bookings").update({ status: "rejected", rejection_reason: req.body.reason || "No reason provided", rejected_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error || !data) {
      const fallbackBooking = fallbackBookings.get(id);
      if (fallbackBooking) {
        fallbackBooking.status = "rejected";
        fallbackBooking.rejection_reason = req.body.reason || "No reason provided";
        fallbackBooking.rejected_at = new Date().toISOString();
        delete fallbackBooking.approved_at;
        delete fallbackBooking.approved_by;
        console.warn(`[REJECTION] Database update failed, rejected fallback booking ${id}:`, error?.message);
        return res.json({ success: true, message: "Booking rejected", booking: mapBooking(fallbackBooking) });
      }
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking rejected", booking: mapBooking(data) });
  } catch (error: any) {
    const fallbackBooking = fallbackBookings.get(req.params.id);
    if (fallbackBooking) {
      fallbackBooking.status = "rejected";
      fallbackBooking.rejection_reason = req.body.reason || "No reason provided";
      fallbackBooking.rejected_at = new Date().toISOString();
      delete fallbackBooking.approved_at;
      delete fallbackBooking.approved_by;
      console.warn(`[REJECTION] Database error, rejected fallback booking ${req.params.id}:`, error.message);
      return res.json({ success: true, message: "Booking rejected", booking: mapBooking(fallbackBooking) });
    }
    res.status(500).json({ message: "Failed to reject booking", error: error.message });
  }
});
app.delete("/api/admin/bookings/:id", verifyAdminToken, async (req, res) => {
  const s = getSupabase();
  if (!s) {
    const deleted = fallbackBookings.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    return res.json({ message: "Booking deleted" });
  }
  try {
    const { error } = await s.from("bookings").delete().eq("id", req.params.id);
    if (error) throw new Error(error.message);
    res.json({ message: "Booking deleted" });
  } catch (error: any) {
    const deleted = fallbackBookings.delete(req.params.id);
    if (deleted) {
      console.warn(`[DELETE] Database error, deleted fallback booking ${req.params.id}:`, error.message);
      return res.json({ message: "Booking deleted" });
    }
    res.status(500).json({ message: "Failed to delete booking", error: error.message });
  }
});

// Service CRUD (admin)
const createSvcHandler = [verifyAdminToken, async (req: any, res: express.Response) => {
  const s = getSupabase();
  if (!s) return res.status(503).json({ message: "Database unavailable" });
  try {
    const title = normalizeOptionalString(req.body.title || req.body.name);
    const category = normalizeOptionalString(req.body.category);
    const description = normalizeOptionalString(req.body.description);
    const price = normalizeOptionalString(req.body.price);
    const image = normalizeOptionalString(req.body.image) || getCategoryImage(category);
    if (!title || !category) return res.status(400).json({ message: "Service title and category are required" });
    const { data: existing } = await s.from("services").select("id");
    const id = createServiceId(title, (existing || []).map((x: any) => x.id));
    const { data, error } = await s.from("services").insert([{ id, category, title, description, price, image }]).select().single();
    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (error: any) { res.status(400).json({ message: error.message || "Failed to create service" }); }
}];
const updateSvcHandler = [verifyAdminToken, async (req: any, res: express.Response) => {
  const s = getSupabase();
  if (!s) return res.status(503).json({ message: "Database unavailable" });
  try {
    const { id } = req.params;
    const title = normalizeOptionalString(req.body.title || req.body.name);
    const category = normalizeOptionalString(req.body.category);
    const description = normalizeOptionalString(req.body.description);
    const price = normalizeOptionalString(req.body.price);
    const image = normalizeOptionalString(req.body.image);
    if (!title || !category) return res.status(400).json({ message: "Service title and category are required" });
    const update: any = { title, category, description, price };
    if (image) update.image = image;
    const { data, error } = await s.from("services").update(update).eq("id", id).select().single();
    if (error || !data) return res.status(404).json({ message: "Service not found" });
    res.json(data);
  } catch (error: any) { res.status(400).json({ message: error.message || "Failed to update service" }); }
}];
const deleteSvcHandler = [verifyAdminToken, async (req: any, res: express.Response) => {
  const s = getSupabase();
  if (!s) return res.status(503).json({ message: "Database unavailable" });
  const { error } = await s.from("services").delete().eq("id", req.params.id);
  if (error) return res.status(404).json({ message: "Service not found" });
  res.json({ message: "Service deleted" });
}];
app.post("/api/services", ...createSvcHandler);
app.put("/api/services/:id", ...updateSvcHandler);
app.delete("/api/services/:id", ...deleteSvcHandler);
app.get("/api/admin/services", verifyAdminToken, async (_req, res) => {
  const s = getSupabase();
  if (!s) return res.status(503).json({ message: "Database unavailable" });
  const { data, error } = await s.from("services").select("*").order("created_at");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});
app.post("/api/admin/services", ...createSvcHandler);
app.put("/api/admin/services/:id", ...updateSvcHandler);
app.delete("/api/admin/services/:id", ...deleteSvcHandler);

// Pricing (admin)
app.get("/api/admin/pricing", verifyAdminToken, async (_req, res) => {
  const s = getSupabase();
  if (!s) return res.status(503).json({ message: "Database unavailable" });
  const { data, error } = await s.from("pricing").select("*");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});
app.put("/api/admin/pricing/:id", verifyAdminToken, async (req, res) => {
  const s = getSupabase();
  if (!s) return res.status(503).json({ message: "Database unavailable" });
  const { data, error } = await s.from("pricing").update(req.body).eq("id", req.params.id).select().single();
  if (error || !data) return res.status(404).json({ message: "Pricing not found" });
  res.json(data);
});

export default app;
