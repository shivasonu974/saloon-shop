import "dotenv/config";
import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ ENVIRONMENT (read once, no delays) ============
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminCredentials = {
  email: process.env.ADMIN_EMAIL || "sonu@streetsaloon.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

// ============ LAZY SUPABASE CLIENT ============
// Connection is created once on first use, not at startup — avoids blocking cold start
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseServiceKey) {
      return null;
    }
    _supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabase;
}

// ============ CONSTANTS ============
const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800";

const CATEGORY_IMAGES: Record<string, string> = {
  "basic services": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
  "styling": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
  "coloring": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800",
  "treatments": "https://images.unsplash.com/photo-1519823551278-64ac92734314?auto=format&fit=crop&q=80&w=800",
  "care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
  "facial": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
  "bridal": "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&q=80&w=800",
  "grooming": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
  "beard": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
  "hair": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
  "spa": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  "massage": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  "makeup": "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&q=80&w=800",
};

const getCategoryImage = (category: string): string => {
  const normalized = category.toLowerCase().trim();
  if (CATEGORY_IMAGES[normalized]) return CATEGORY_IMAGES[normalized];
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (normalized.includes(key) || key.includes(normalized)) return url;
  }
  return DEFAULT_SERVICE_IMAGE;
};

const BOOKING_CONFIRMED_MESSAGE = "Your booking is confirmed";

// ============ HELPERS ============

type BookingStatus = "pending" | "approved" | "rejected";

const getStatusMessage = (status: BookingStatus, rejectionReason?: string): string => {
  const messages: Record<BookingStatus, string> = {
    pending: "Your request is sent. Waiting for confirmation.",
    approved: BOOKING_CONFIRMED_MESSAGE,
    rejected: rejectionReason
      ? `Your booking request was rejected. Reason: ${rejectionReason}`
      : "Your booking request was rejected.",
  };
  return messages[status];
};

const normalizeOptionalString = (value: unknown) => String(value ?? "").trim();

const createServiceId = (title: string, existingIds: string[], currentId?: string) => {
  const baseId =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `service-${Date.now()}`;

  let candidate = baseId;
  let suffix = 2;

  while (existingIds.some((id) => id === candidate && id !== currentId)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

// ============ MIDDLEWARE ============

const verifyAdminToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
};

// Middleware: require Supabase to be available
const requireSupabase = (_req: any, res: express.Response, next: express.NextFunction) => {
  if (!getSupabase()) {
    return res.status(503).json({
      message: "Database service temporarily unavailable. Please try again later.",
    });
  }
  next();
};

// ============ NOTIFICATIONS ============

const postNotificationWebhook = async (
  url: string,
  token: string | undefined,
  payload: Record<string, unknown>,
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Notification webhook failed with status ${response.status}`);
  }
};

const sendBookingConfirmationNotification = async (booking: any) => {
  const supabase = getSupabase();
  if (!supabase) return;

  const message = BOOKING_CONFIRMED_MESSAGE;
  const channels = ["website"];
  const payload = {
    bookingId: booking.id,
    toPhone: booking.customer_phone,
    toEmail: booking.customer_email,
    customerName: booking.customer_name,
    serviceTitle: booking.service_title,
    date: booking.date,
    slot: booking.slot,
    message,
  };

  console.log(`[USER NOTIFICATION] ${message} -> booking ${booking.id}`);

  const deliveryTasks: Promise<void>[] = [];

  if (process.env.WHATSAPP_API_URL) {
    deliveryTasks.push(
      postNotificationWebhook(process.env.WHATSAPP_API_URL, process.env.WHATSAPP_API_TOKEN, payload)
        .then(() => { channels.push("whatsapp"); }),
    );
  }

  if (process.env.EMAIL_WEBHOOK_URL) {
    deliveryTasks.push(
      postNotificationWebhook(process.env.EMAIL_WEBHOOK_URL, process.env.EMAIL_WEBHOOK_TOKEN, payload)
        .then(() => { channels.push("email"); }),
    );
  }

  const results = await Promise.allSettled(deliveryTasks);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.warn("[NOTIFICATION] Optional delivery channel failed:", result.reason);
    }
  });

  // Update booking with notification info (fire-and-forget, don't block response)
  supabase
    .from("bookings")
    .update({
      notification_message: message,
      notification_channels: channels,
      notification_sent_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .then(() => {})
    .catch((err: any) => console.warn("[NOTIFICATION] Failed to update booking record:", err));
};

// ============ SERVER SETUP ============

const app = express();

// ── HEALTH CHECK (before all middleware — responds instantly) ──
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    brand: "Street Saloon",
    database: getSupabase() ? "connected" : "not configured",
  });
});

// ── GLOBAL MIDDLEWARE ──
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(corsMiddleware);

// ============ PUBLIC API ROUTES ============

// Get all services
app.get("/api/services", requireSupabase, async (_req, res) => {
  const supabase = getSupabase()!;
  const { data, error } = await supabase.from("services").select("*").order("created_at");
  if (error) return res.status(500).json({ message: error.message });

  const enriched = (data || []).map((service: any) => ({
    ...service,
    image: service.image || getCategoryImage(service.category || ""),
  }));
  res.json(enriched);
});

// Get booked slots for a date
app.get("/api/availability", requireSupabase, async (req, res) => {
  const supabase = getSupabase()!;
  const date = String(req.query.date || "");
  if (!date) return res.status(400).json({ message: "Date is required" });

  const { data, error } = await supabase
    .from("bookings")
    .select("slot")
    .eq("date", date)
    .in("status", ["pending", "approved"]);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ date, slots: (data || []).map((b: any) => b.slot) });
});

// Create a new booking
app.post("/api/book", requireSupabase, async (req, res) => {
  const supabase = getSupabase()!;
  try {
    const { customerName, customerEmail, customerPhone, serviceId, serviceTitle, date, slot } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !serviceId || !serviceTitle || !date || !slot) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if slot is already booked
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("date", date)
      .eq("slot", slot)
      .in("status", ["pending", "approved"])
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ message: "This time slot has just been taken. Please select another." });
    }

    const newBooking = {
      id: Date.now().toString(),
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      service_id: serviceId,
      service_title: serviceTitle,
      date,
      slot,
      status: "pending",
    };

    const { data, error } = await supabase.from("bookings").insert([newBooking]).select().single();
    if (error) return res.status(500).json({ message: error.message });

    console.log(`[BOOKING] New booking (PENDING): ${customerName} for ${serviceTitle} on ${date} at ${slot}`);

    res.status(201).json({
      success: true,
      message: "Your request is sent. Waiting for confirmation.",
      booking: {
        id: data.id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        serviceId: data.service_id,
        serviceTitle: data.service_title,
        date: data.date,
        slot: data.slot,
        status: data.status,
        createdAt: data.created_at,
      },
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
});

// Get booking status
app.get("/api/book/status/:id", requireSupabase, async (req, res) => {
  const supabase = getSupabase()!;
  const { id } = req.params;
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();

  if (error || !data) return res.status(404).json({ message: "Booking not found" });

  res.json({
    id: data.id,
    status: data.status,
    serviceTitle: data.service_title,
    date: data.date,
    slot: data.slot,
    message: getStatusMessage(data.status, data.rejection_reason),
  });
});

// ============ ADMIN ROUTES ============

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === adminCredentials.email && password === adminCredentials.password) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, message: "Login successful" });
  }
  res.status(401).json({ message: "Invalid email or password" });
});

// Helper to map booking rows to camelCase
const mapBooking = (b: any) => ({
  id: b.id,
  customerName: b.customer_name,
  customerEmail: b.customer_email,
  customerPhone: b.customer_phone,
  serviceTitle: b.service_title,
  serviceId: b.service_id,
  date: b.date,
  slot: b.slot,
  status: b.status,
  createdAt: b.created_at,
  approvedAt: b.approved_at,
  approvedBy: b.approved_by,
  rejectedAt: b.rejected_at,
  rejectionReason: b.rejection_reason,
});

// Dashboard Stats
app.get("/api/admin/stats", verifyAdminToken, async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const [bookingsResult, servicesResult, emailsResult] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("customer_email"),
  ]);

  const totalBookings = bookingsResult.count || 0;
  const totalServices = servicesResult.count || 0;
  const uniqueClients = new Set((emailsResult.data || []).map((e: any) => e.customer_email)).size;

  res.json({
    totalBookings,
    totalRevenue: totalBookings * 350,
    totalServices,
    totalClients: uniqueClients,
  });
});

// Get all bookings (admin) — single handler for both routes
const getAdminBookings = [verifyAdminToken, async (_req: any, res: express.Response) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json((data || []).map(mapBooking));
}];

app.get("/api/bookings", ...getAdminBookings);
app.get("/api/admin/bookings", ...getAdminBookings);

// Approve booking
app.put("/api/book/:id/approve", verifyAdminToken, async (req: any, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  try {
    const { id } = req.params;
    const { data: booking, error: findErr } = await supabase.from("bookings").select("*").eq("id", id).single();

    if (findErr || !booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "rejected") return res.status(409).json({ message: "Rejected bookings cannot be approved" });

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: req.admin.email })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    console.log(`[APPROVAL] Booking ${id} approved by admin ${req.admin.email}`);

    // Send notification in background — don't block the response
    sendBookingConfirmationNotification(data).catch((err) => {
      console.warn(`[WARNING] Notification failed for booking ${id}:`, err.message);
    });

    res.json({ success: true, message: "Booking approved successfully", booking: data });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to approve booking", error: error.message });
  }
});

// Reject booking
app.put("/api/book/:id/reject", verifyAdminToken, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { id } = req.params;
  const { reason } = req.body;

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "rejected", rejection_reason: reason || "No reason provided", rejected_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ message: "Booking not found" });

  console.log(`[REJECTION] Booking ${id} rejected - Reason: ${reason}`);
  res.json({ success: true, message: "Booking rejected", booking: data });
});

// Delete booking
app.delete("/api/admin/bookings/:id", verifyAdminToken, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { id } = req.params;
  await supabase.from("bookings").delete().eq("id", id);
  res.json({ message: "Booking deleted" });
});

// ============ SERVICE CRUD (ADMIN) ============

const createServiceHandler = [verifyAdminToken, async (req: any, res: express.Response) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  try {
    const title = normalizeOptionalString(req.body.title || req.body.name);
    const category = normalizeOptionalString(req.body.category);
    const description = normalizeOptionalString(req.body.description);
    const price = normalizeOptionalString(req.body.price);
    const image = normalizeOptionalString(req.body.image) || getCategoryImage(category);

    if (!title || !category) return res.status(400).json({ message: "Service title and category are required" });

    const { data: existing } = await supabase.from("services").select("id");
    const id = createServiceId(title, (existing || []).map((s: any) => s.id));

    const { data, error } = await supabase
      .from("services")
      .insert([{ id, category, title, description, price, image }])
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create service" });
  }
}];

const updateServiceHandler = [verifyAdminToken, async (req: any, res: express.Response) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

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

    const { data, error } = await supabase.from("services").update(update).eq("id", id).select().single();
    if (error || !data) return res.status(404).json({ message: "Service not found" });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update service" });
  }
}];

const deleteServiceHandler = [verifyAdminToken, async (req: any, res: express.Response) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { id } = req.params;
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return res.status(404).json({ message: "Service not found" });
  res.json({ message: "Service deleted" });
}];

// Primary routes
app.post("/api/services", ...createServiceHandler);
app.put("/api/services/:id", ...updateServiceHandler);
app.delete("/api/services/:id", ...deleteServiceHandler);

// Backward-compatible admin routes (share handlers — no code duplication)
app.get("/api/admin/services", verifyAdminToken, async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { data, error } = await supabase.from("services").select("*").order("created_at");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post("/api/admin/services", ...createServiceHandler);
app.put("/api/admin/services/:id", ...updateServiceHandler);
app.delete("/api/admin/services/:id", ...deleteServiceHandler);

// ============ PRICING (ADMIN) ============

app.get("/api/admin/pricing", verifyAdminToken, async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { data, error } = await supabase.from("pricing").select("*");
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.put("/api/admin/pricing/:id", verifyAdminToken, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Database unavailable" });

  const { id } = req.params;
  const { data, error } = await supabase.from("pricing").update(req.body).eq("id", id).select().single();
  if (error || !data) return res.status(404).json({ message: "Pricing not found" });
  res.json(data);
});

// ============ STATIC FILES & SPA ============

if (process.env.NODE_ENV !== "production") {
  // DEV MODE: lazy-load Vite dev server (don't import at top level — it's huge)
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // PRODUCTION MODE: serve pre-built frontend
  const distPath = path.join(process.cwd(), "dist");

  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  dist directory not found at ${distPath}`);
  }

  // Hashed assets (JS/CSS) — cache forever (immutable)
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "365d",
      immutable: true,
    })
  );

  // Other static files — short cache with revalidation
  app.use(
    express.static(distPath, {
      maxAge: "1h",
      etag: true,
    })
  );

  // SPA fallback — serve index.html for all unmatched non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) {
        res.status(404).send("Not found");
      }
    });
  });
}

// ============ START SERVER ============
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`⚡ Health check: http://0.0.0.0:${PORT}/health`);
});
