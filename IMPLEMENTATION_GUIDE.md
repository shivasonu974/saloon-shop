# Admin Approval & Notification System - Implementation Guide

## 🎯 System Overview

This document describes the complete admin approval and user notification system for the Street Saloon booking platform.

### Flow Diagram

```
User Books Appointment
         ↓
   Status: PENDING
         ↓
Admin Reviews in Dashboard
         ↓
Admin Clicks "Approve"
         ↓
Status: APPROVED
         ↓
User Receives: "Your booking is confirmed"
(Website + Optional: WhatsApp/Email)
```

---

## 📊 Backend Architecture

### Booking Model

```typescript
interface Booking {
  id: string;                      // Unique identifier (timestamp-based)
  customerName: string;            // User's name
  customerEmail: string;           // User's email
  customerPhone: string;           // User's phone
  serviceId: string;               // Service identifier
  serviceTitle: string;            // Service name
  date: string;                    // Booking date (YYYY-MM-DD)
  slot: string;                    // Time slot (e.g., "2:00 PM")
  status: BookingStatus;           // "pending" | "approved" | "rejected"
  createdAt: string;               // ISO timestamp
  approvedAt?: string;             // When approved
  approvedBy?: string;             // Admin email who approved
  rejectedAt?: string;             // When rejected
  rejectionReason?: string;        // Reason for rejection
  notification?: {
    message: string;               // Notification message sent
    channels: string[];            // ["website", "email", "whatsapp"]
    sentAt: string;                // When notification was sent
  };
}
```

### Status States

| Status | Meaning | User Message | User Action |
|--------|---------|--------------|------------|
| **pending** | Awaiting admin review | "Your request is sent. Waiting for confirmation." | Check status periodically |
| **approved** | Admin confirmed the booking | "Your booking is confirmed" | Appointment is confirmed |
| **rejected** | Admin rejected the booking | "Your booking request was rejected. Reason: {reason}" | Can book again |

---

## 🔌 API Endpoints

### Public Endpoints

#### 1. Create Booking (POST)
```
POST /api/book
```

**Request:**
```json
{
  "customerName": "Priya Sharma",
  "customerEmail": "priya@example.com",
  "customerPhone": "9876543210",
  "serviceId": "haircut-women",
  "serviceTitle": "Haircut (Women)",
  "date": "2026-04-15",
  "slot": "2:00 PM"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Your request is sent. Waiting for confirmation.",
  "booking": {
    "id": "1704067200000",
    "status": "pending",
    "createdAt": "2026-04-23T10:00:00.000Z",
    ...
  }
}
```

#### 2. Get Booking Status (GET)
```
GET /api/book/status/:id
```

**Response:**
```json
{
  "id": "1704067200000",
  "status": "approved",
  "serviceTitle": "Haircut (Women)",
  "date": "2026-04-15",
  "slot": "2:00 PM",
  "message": "Your booking is confirmed"
}
```

#### 3. Get Available Slots (GET)
```
GET /api/availability?date=2026-04-15
```

**Response:**
```json
{
  "date": "2026-04-15",
  "slots": ["2:00 PM", "3:00 PM", "4:00 PM"]
}
```

---

### Admin Endpoints (Requires Authentication)

#### Authentication Header
```
Authorization: Bearer <admin-token>
```

#### 1. Admin Login (POST)
```
POST /api/admin/login
```

**Request:**
```json
{
  "email": "sonu@streetsaloon.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

#### 2. Get All Bookings (GET)
```
GET /api/bookings
```

**Response:**
```json
[
  {
    "id": "1704067200000",
    "customerName": "Priya Sharma",
    "status": "pending",
    ...
  },
  {
    "id": "1704067200001",
    "customerName": "Rajesh Kumar",
    "status": "approved",
    ...
  }
]
```

#### 3. Approve Booking (PUT)
```
PUT /api/book/:id/approve
```

**Response:**
```json
{
  "success": true,
  "message": "Booking approved successfully",
  "booking": {
    "id": "1704067200000",
    "status": "approved",
    "approvedAt": "2026-04-23T10:05:00.000Z",
    "approvedBy": "admin@streetsaloon.com",
    "notification": {
      "message": "Your booking is confirmed",
      "channels": ["website"],
      "sentAt": "2026-04-23T10:05:01.000Z"
    }
  }
}
```

#### 4. Reject Booking (PUT)
```
PUT /api/book/:id/reject
```

**Request:**
```json
{
  "reason": "Stylist not available on requested date"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking rejected",
  "booking": {
    "id": "1704067200000",
    "status": "rejected",
    "rejectionReason": "Stylist not available on requested date",
    "rejectedAt": "2026-04-23T10:10:00.000Z"
  }
}
```

#### 5. Delete Booking (DELETE)
```
DELETE /api/admin/bookings/:id
```

---

## 🧑‍💼 Admin Dashboard Features

### Overview Tab
- **Total Bookings**: Count of all bookings
- **Total Revenue**: Estimated revenue
- **Total Services**: Count of services
- **Total Clients**: Unique customer count

### Bookings Tab

#### Status Widgets
- **Pending Count**: Yellow indicator with pending bookings count
- **Approved Count**: Green indicator with approved bookings count
- **Rejected Count**: Red indicator with rejected bookings count

#### Bookings Table
| Column | Content |
|--------|---------|
| Customer | Name + Email |
| Phone | Customer phone number |
| Service | Service title |
| Date & Time | Booking date and time slot |
| Status | Visual status badge |
| Actions | Approve/Reject/Delete buttons |

#### Admin Actions
1. **Approve Button** (Green)
   - Available only for pending bookings
   - Triggers notification to user
   - Updates status to "approved"
   - Shows loader during processing

2. **Reject Button** (Red)
   - Available only for pending bookings
   - Prompts for rejection reason
   - Updates status to "rejected"

3. **Delete Button** (Red)
   - Available for all bookings
   - Removes booking permanently
   - Shows confirmation dialog

#### Auto-Sorting
- Pending bookings appear at the top
- Within each status, sorted by date/time (newest first)

---

## 👤 User Website Features

### Booking Form (Step-by-Step)

**Step 1: Select Service**
- Browse available services
- Click to select

**Step 2: Choose Date & Time**
- Calendar date picker (min: today)
- Time slots auto-load based on availability
- Booked slots are disabled

**Step 3: Enter Details**
- Customer name
- Email address
- Phone number
- Validation on all fields

**Step 4: Confirmation**
Shows message: **"Your request is sent. Waiting for confirmation."**

### Booking Status Check

**Auto-Poll Feature** (For Pending Bookings)
- Every 10 seconds, checks if booking is approved
- Shows real-time status updates
- User sees confirmation immediately when admin approves

**Booking Status Page**
- Users can search by booking ID
- Shows:
  - Service name
  - Booking date & time
  - Current status
  - Status message
  - Icon indicator (Clock for pending, Check for approved, X for rejected)

---

## 🔔 Notification System

### Notification Infrastructure

The system supports multi-channel notifications via webhooks:

```javascript
// Notification channels
channels = ["website"]; // Always sent

if (process.env.WHATSAPP_API_URL) channels.push("whatsapp");
if (process.env.EMAIL_WEBHOOK_URL) channels.push("email");
```

### Payload Structure
```json
{
  "bookingId": "1704067200000",
  "toPhone": "9876543210",
  "toEmail": "priya@example.com",
  "customerName": "Priya Sharma",
  "serviceTitle": "Haircut (Women)",
  "date": "2026-04-15",
  "slot": "2:00 PM",
  "message": "Your booking is confirmed"
}
```

### Channels

#### 1. Website (Default)
✅ **Always Active**
- User sees status immediately when checking booking
- Auto-refreshes every 10 seconds (for pending bookings)
- No configuration needed

#### 2. WhatsApp (Optional)
📱 **Configuration:**
```env
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_TOKEN=your_whatsapp_token
```

**Message Example:**
```
"Hi Priya! Your booking is confirmed. 
Haircut (Women) on 2026-04-15 at 2:00 PM. 
Thank you! - Street Saloon"
```

#### 3. Email (Optional)
📧 **Configuration:**
```env
EMAIL_WEBHOOK_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_WEBHOOK_TOKEN=your_sendgrid_api_key
```

**Email Template:**
```
Subject: Your Booking is Confirmed - Street Saloon

Hi Priya,

Your booking has been confirmed!

Service: Haircut (Women)
Date: April 15, 2026
Time: 2:00 PM

Thank you for choosing Street Saloon!
```

### Notification Flow
```
User Books (pending)
         ↓
[No notification sent]
         ↓
Admin Approves
         ↓
sendBookingConfirmationNotification() triggered
         ↓
Try to send on all available channels
         ↓
website ✓ (always succeeds)
whatsapp ? (if configured)
email ? (if configured)
         ↓
Update notification metadata in booking record
         ↓
User sees "Your booking is confirmed"
```

---

## 🔐 Security

### Admin Authentication
- JWT tokens (24-hour expiration)
- Stored in localStorage
- Required for all admin operations
- Verified on each API request

### Token Payload
```json
{
  "email": "admin@streetsaloon.com",
  "iat": 1704067200,
  "exp": 1704153600
}
```

### CORS Policy
- Allows cross-origin requests
- Supports GET, POST, PUT, DELETE methods
- Authorization header required for admin endpoints

---

## 💾 Database Notes

**Current Implementation**: In-Memory (for development)
- Bookings stored in memory array
- Data persists during server runtime only
- Perfect for development and testing

**Production Consideration**:
- Migrate to Firebase/Firestore (ready - firebase config exists)
- Or PostgreSQL with proper schema
- Add database persistence layer in future

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set up environment variables (.env file)
- [ ] Configure WhatsApp API (optional but recommended)
- [ ] Configure Email Webhook (optional but recommended)
- [ ] Update admin credentials
- [ ] Test entire booking flow
- [ ] Migrate to persistent database
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging

---

## 📝 Example Environment Configuration

See `.env.example` file in the project root.

---

## 🧪 Testing Workflow

### 1. Create a Booking (as User)
```bash
curl -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "9999999999",
    "serviceId": "haircut-men",
    "serviceTitle": "Haircut (Men)",
    "date": "2026-04-25",
    "slot": "3:00 PM"
  }'
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sonu@streetsaloon.com",
    "password": "admin123"
  }'
```

### 3. Approve Booking
```bash
curl -X PUT http://localhost:3000/api/book/{booking_id}/approve \
  -H "Authorization: Bearer {token}"
```

### 4. Check Booking Status (as User)
```bash
curl http://localhost:3000/api/book/status/{booking_id}
```

Expected response:
```json
{
  "message": "Your booking is confirmed"
}
```

---

## 🎨 UI/UX Features

### Status Indicators
- **Pending**: Yellow clock icon
- **Approved**: Green checkmark icon
- **Rejected**: Red X icon

### User Feedback
- Success messages on approve/reject
- Error messages with details
- Loading spinners during async operations
- Confirmation dialogs before destructive actions

### Responsive Design
- Mobile-first approach
- Scrollable tables on small screens
- Optimized for desktop/tablet/mobile

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [APPROVAL_AND_NOTIFICATIONS.md](APPROVAL_AND_NOTIFICATIONS.md) - Feature specs
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin operations guide
- [Security Spec](security_spec.md) - Security considerations

---

## 🐛 Troubleshooting

### Booking not appearing in admin panel
- Verify admin token is valid (24-hour expiration)
- Check if booking status is "pending"
- Try refreshing the page

### User not receiving approval notification
- Check if WhatsApp/Email APIs are configured (.env)
- Verify phone number format
- Check server logs for webhook errors

### Slot showing as available but booking fails
- Another user may have booked the same slot simultaneously
- Refresh availability and try another slot

### Admin approval fails with 401
- Admin token has expired (24 hours)
- Need to log in again

---

## 📞 Support

For issues or questions, please refer to the documentation files or contact the development team.
