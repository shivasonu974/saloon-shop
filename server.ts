import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ SUPABASE CLIENT ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Graceful initialization - don't crash if missing, but log warning
let supabase: any = null;
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️  WARNING: Supabase credentials not configured. API endpoints will not work.");
  console.warn("   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file");
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("✅ Supabase client initialized");
}

// ============ ADMIN CREDENTIALS ============
const adminCredentials = {
  email: process.env.ADMIN_EMAIL || "sonu@streetsaloon.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key";

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800";

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

// Admin Authentication Middleware
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

// CORS Middleware
const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
};

// Helper to check if Supabase is available
const requireSupabase = (req: any, res: express.Response, next: express.NextFunction) => {
  if (!supabase) {
    return res.status(503).json({ 
      message: "Database service temporarily unavailable. Please try again later." 
    });
  }
  next();
};

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
  console.log(`[EMAIL NOTIFICATION] ${booking.customer_email}: ${message}`);
  console.log(`[WHATSAPP NOTIFICATION] ${booking.customer_phone}: ${message}`);

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

  // Update booking with notification info in Supabase
  await supabase
    .from("bookings")
    .update({
      notification_message: message,
      notification_channels: channels,
      notification_sent_at: new Date().toISOString(),
    })
    .eq("id", booking.id);
};

// ============ SERVER ============

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(corsMiddleware);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", brand: "Street Saloon", database: "supabase" });
  });

  // ============ PUBLIC API ROUTES ============

  // Get all services
  app.get("/api/services", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ message: "Database service unavailable" });
    }
    const { data, error } = await supabase.from("services").select("*").order("created_at");
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  });

  // Get booked slots for a date
  app.get("/api/availability", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ message: "Database service unavailable" });
    }
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
  app.post("/api/book", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ message: "Booking service temporarily unavailable" });
    }
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

      console.log(`[BOOKING] New booking created (PENDING APPROVAL): ${customerName} for ${serviceTitle} on ${date} at ${slot}`);

      // Return camelCase for frontend compatibility
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
  app.get("/api/book/status/:id", async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ message: "Database service unavailable" });
    }
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

  // Dashboard Stats
  app.get("/api/admin/stats", verifyAdminToken, async (req, res) => {
    const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true });
    const { count: totalServices } = await supabase.from("services").select("*", { count: "exact", head: true });
    const { data: emails } = await supabase.from("bookings").select("customer_email");
    const uniqueClients = new Set((emails || []).map((e: any) => e.customer_email)).size;

    res.json({
      totalBookings: totalBookings || 0,
      totalRevenue: (totalBookings || 0) * 350,
      totalServices: totalServices || 0,
      totalClients: uniqueClients,
    });
  });

  // Get all bookings (admin)
  app.get("/api/bookings", verifyAdminToken, async (req, res) => {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });

    // Map to camelCase for frontend
    const mapped = (data || []).map((b: any) => ({
      id: b.id, customerName: b.customer_name, customerEmail: b.customer_email,
      customerPhone: b.customer_phone, serviceTitle: b.service_title, serviceId: b.service_id,
      date: b.date, slot: b.slot, status: b.status, createdAt: b.created_at,
      approvedAt: b.approved_at, approvedBy: b.approved_by,
      rejectedAt: b.rejected_at, rejectionReason: b.rejection_reason,
    }));
    res.json(mapped);
  });

  app.get("/api/admin/bookings", verifyAdminToken, async (req, res) => {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    const mapped = (data || []).map((b: any) => ({
      id: b.id, customerName: b.customer_name, customerEmail: b.customer_email,
      customerPhone: b.customer_phone, serviceTitle: b.service_title, serviceId: b.service_id,
      date: b.date, slot: b.slot, status: b.status, createdAt: b.created_at,
      approvedAt: b.approved_at, approvedBy: b.approved_by,
      rejectedAt: b.rejected_at, rejectionReason: b.rejection_reason,
    }));
    res.json(mapped);
  });

  // Approve booking
  app.put("/api/book/:id/approve", verifyAdminToken, async (req: any, res) => {
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

      try {
        await sendBookingConfirmationNotification(data);
      } catch (notificationError: any) {
        console.warn(`[WARNING] Failed to send notification for booking ${id}:`, notificationError.message);
      }

      res.json({ success: true, message: "Booking approved successfully", booking: data });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to approve booking", error: error.message });
    }
  });

  // Reject booking
  app.put("/api/book/:id/reject", verifyAdminToken, async (req, res) => {
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
    const { id } = req.params;
    await supabase.from("bookings").delete().eq("id", id);
    res.json({ message: "Booking deleted" });
  });

  // ============ SERVICE CRUD (ADMIN) ============

  app.post("/api/services", verifyAdminToken, async (req, res) => {
    try {
      const title = normalizeOptionalString(req.body.title || req.body.name);
      const category = normalizeOptionalString(req.body.category);
      const description = normalizeOptionalString(req.body.description);
      const price = normalizeOptionalString(req.body.price);
      const image = normalizeOptionalString(req.body.image) || DEFAULT_SERVICE_IMAGE;

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
  });

  app.put("/api/services/:id", verifyAdminToken, async (req, res) => {
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
  });

  app.delete("/api/services/:id", verifyAdminToken, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  });

  // Backward-compatible admin routes
  app.get("/api/admin/services", verifyAdminToken, async (req, res) => {
    const { data, error } = await supabase.from("services").select("*").order("created_at");
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  });

  app.post("/api/admin/services", verifyAdminToken, async (req, res) => {
    // Forward to main POST /api/services handler
    try {
      const { title, category, description, price, image } = req.body;

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
  });

  app.put("/api/admin/services/:id", verifyAdminToken, async (req, res) => {
    // Forward to main PUT /api/services/:id handler
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
  });

  app.delete("/api/admin/services/:id", verifyAdminToken, async (req, res) => {
    // Forward to main DELETE /api/services/:id handler
    const { id } = req.params;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  });

  // ============ PRICING (ADMIN) ============

  app.get("/api/admin/pricing", verifyAdminToken, async (req, res) => {
    const { data, error } = await supabase.from("pricing").select("*");
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  });

  app.put("/api/admin/pricing/:id", verifyAdminToken, async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("pricing").update(req.body).eq("id", id).select().single();
    if (error || !data) return res.status(404).json({ message: "Pricing not found" });
    res.json(data);
  });

  // ============ VITE MIDDLEWARE ============
  console.log(`📊 Environment: NODE_ENV=${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Running in DEVELOPMENT mode with Vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // PRODUCTION MODE: Serve pre-built React frontend
    const distPath = path.join(process.cwd(), "dist");
    console.log("📦 Running in PRODUCTION mode");
    console.log(`📁 Serving static files from: ${distPath}`);
    
    // Verify dist directory exists
    try {
      const fs = await import("fs");
      if (!fs.existsSync(distPath)) {
        console.warn(`⚠️  WARNING: dist directory not found at ${distPath}`);
        console.warn(`   Current working directory: ${process.cwd()}`);
        console.warn(`   Available files: ${fs.readdirSync(process.cwd()).join(", ")}`);
      } else {
        const indexPath = path.join(distPath, "index.html");
        if (!fs.existsSync(indexPath)) {
          console.warn(`⚠️  WARNING: dist/index.html not found`);
        } else {
          console.log(`✅ dist/index.html found`);
        }
      }
    } catch (err) {
      console.warn(`⚠️  Could not verify dist directory:`, err);
    }
    
    // Serve static files (CSS, JS, images, etc.)
    app.use(express.static(distPath, {
      maxAge: "1d",
      etag: false
    }));
    
    // Serve index.html for all unmatched routes (SPA routing)
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      // Don't log every single route request to avoid spam
      if (!req.path.startsWith("/api")) {
        console.log(`🌐 SPA route: ${req.path}`);
      }
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`❌ Error serving index.html:`, err.message);
          res.status(404).send("Not found");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Server running on http://0.0.0.0:${PORT}`);
    if (supabase) {
      console.log(`📊 Database: Supabase connected (${supabaseUrl})`);
    } else {
      console.log(`⚠️  Database: Supabase NOT connected (APIs unavailable)`);
    }
    console.log(`\n🌍 Open https://street-saloon.onrender.com in your browser\n`);
  });
}

startServer();
