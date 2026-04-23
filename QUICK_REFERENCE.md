# Quick Reference Card - Booking Approval System

## 🚀 Quick Start

### For Users (Customers)

| Action | Steps | Time |
|--------|-------|------|
| **Book Appointment** | 1. Choose service 2. Pick date/time 3. Enter details 4. Book | 3-5 min |
| **Check Status** | Go to "Check Booking Status" page or wait for auto-update | instant |
| **Get Approval** | Admin approves → You get notification | 2-4 hrs |
| **Reschedule** | Contact salon with booking ID | varies |

### For Admin (Salon Staff)

| Action | Steps | Time |
|--------|-------|------|
| **Login** | Go to /admin/login → Enter credentials | 30 sec |
| **View Bookings** | Click "Bookings" tab → See all pending | instant |
| **Approve** | Click green ✓ button → Confirm | 1 sec + notification |
| **Reject** | Click red ✗ button → Enter reason → Confirm | 10 sec |
| **Logout** | Click "Logout" button | instant |

---

## 📊 Booking Status Flow

```
PENDING          APPROVED         REJECTED
(Waiting)   →    (Confirmed)  OR  (Declined)
  🕐              ✅                  ❌

User Books         Admin            User Can
                   Reviews          Rebook
                   ↓
              Approves?
              ↙        ↖
           YES          NO
```

---

## 🔑 Key URLs

| Page | URL | Access |
|------|-----|--------|
| **Book** | `/booking` | Public |
| **Check Status** | `/booking-status` | Public |
| **Admin Login** | `/admin/login` | Public |
| **Admin Dashboard** | `/admin` | Admins only |

---

## 💾 Admin Credentials

```
Email:    sonu@streetsaloon.com
Password: admin123
Token:    24-hour expiration
```

⚠️ **Change these in production!**

---

## 📱 API Endpoints Cheat Sheet

### Public APIs

```
POST /api/book
  └─ Create booking (status: pending)

GET /api/book/status/:id
  └─ Check booking status

GET /api/availability?date=YYYY-MM-DD
  └─ Get booked slots for a date
```

### Admin APIs (Require Token)

```
POST /api/admin/login
  └─ Admin login

GET /api/bookings
  └─ Get all bookings

PUT /api/book/:id/approve
  └─ Approve booking

PUT /api/book/:id/reject
  └─ Reject booking (with reason)

DELETE /api/admin/bookings/:id
  └─ Delete booking
```

---

## 🔔 Notification Channels

| Channel | Status | Config Needed |
|---------|--------|---------------|
| **Website** | ✅ Always active | No |
| **WhatsApp** | ⚠️ Optional | `WHATSAPP_API_URL` + `WHATSAPP_API_TOKEN` |
| **Email** | ⚠️ Optional | `EMAIL_WEBHOOK_URL` + `EMAIL_WEBHOOK_TOKEN` |

---

## 📋 Common Messages

### User Messages

| Status | Message |
|--------|---------|
| **Pending** | "Your request is sent. Waiting for confirmation." |
| **Approved** | "Your booking is confirmed" |
| **Rejected** | "Your booking request was rejected. Reason: {reason}" |

### Admin Messages

| Action | Message |
|--------|---------|
| **Approved** | "Booking approved. The user can now see: 'Your booking is confirmed'." |
| **Rejected** | "Booking rejected." |
| **Deleted** | "Booking deleted." |

---

## ✅ Admin Workflow Checklist

```
□ Login to admin dashboard
□ Check PENDING count (top card)
□ Review each pending booking details
□ Check stylist availability calendar
□ Make decision:
    □ If feasible: Click APPROVE
    □ If not: Click REJECT + enter reason
□ Verify notification sent to customer
□ Repeat for all pending bookings
□ Check APPROVED and REJECTED counts
□ Logout before leaving
```

---

## 📊 Dashboard Stats

| Metric | Where | Shows |
|--------|-------|-------|
| **Total Bookings** | Overview tab | All-time count |
| **Revenue** | Overview tab | Estimated (avg ₹350/booking) |
| **Services** | Overview tab | Total services available |
| **Clients** | Overview tab | Unique customers |
| **Pending** | Bookings tab (card) | Waiting approvals |
| **Approved** | Bookings tab (card) | Confirmed bookings |
| **Rejected** | Bookings tab (card) | Declined bookings |

---

## 🔐 Security

| Feature | Details |
|---------|---------|
| **JWT Token** | Issued on login, expires 24h |
| **Authorization** | All admin routes require Bearer token |
| **CORS** | Cross-origin requests allowed |
| **Password** | Change default admin credentials! |

---

## 🆘 Emergency Fixes

### "I can't log in"
- Clear browser cache (Ctrl+Shift+Del)
- Try incognito window
- Verify email/password

### "Approve button not working"
- Refresh page
- Check internet connection
- Logout → Login again (token expired?)

### "User didn't get notification"
- Website notification always works
- For WhatsApp/Email: check .env configuration
- Verify customer phone/email in booking

### "Can't find a booking"
- Click Refresh button
- Check browser console for errors
- Verify booking exists (admin created it?)

---

## 🎨 Visual Status Indicators

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| **Pending** | 🕐 | Yellow | Awaiting approval |
| **Approved** | ✅ | Green | Confirmed |
| **Rejected** | ❌ | Red | Declined |

---

## 📞 Booking Status Check

### User Perspective

```
User Checks Status
       ↓
Website (Always): Status visible to user
       ↓
WhatsApp (Optional): SMS/Message notification
       ↓
Email (Optional): Email notification
```

### What Triggers Notification

```
Admin clicks APPROVE
       ↓
sendBookingConfirmationNotification()
       ↓
Try all channels:
  1. Website ✓ (always succeeds)
  2. WhatsApp ? (if configured)
  3. Email ? (if configured)
       ↓
User receives message on available channels
```

---

## 🗂️ File Structure (Important Files)

```
project/
├── server.ts                    # Backend API
├── src/
│   ├── pages/
│   │   ├── Booking.tsx         # User booking form
│   │   ├── BookingStatus.tsx   # User status check
│   │   └── AdminDashboard.tsx  # Admin panel
│   ├── components/admin/
│   │   └── AdminBookings.tsx   # Bookings management
│   └── services/
│       ├── bookingService.ts   # API client
│       └── notificationService.ts # Notification helper
├── IMPLEMENTATION_GUIDE.md     # Technical docs
├── ADMIN_GUIDE_DETAILED.md     # Admin help
├── USER_GUIDE_BOOKING.md       # User help
└── .env.example                # Config template
```

---

## 📈 Common Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Approval Time** | < 4 hours | Depends on admin |
| **Notification Delivery** | < 5 seconds | Website instant |
| **System Uptime** | > 99% | In development |
| **Token Expiry** | 24 hours | Fixed |

---

## 🔄 Typical Day Timeline

```
09:00 AM  - Salon opens, admin logs in
10:00 AM  - First bookings start coming
12:00 PM  - Review and approve/reject bookings
02:00 PM  - Continue processing bookings
05:00 PM  - Final batch of bookings
06:00 PM  - Review rejected bookings
07:00 PM  - Admin logs out, day ends
```

---

## 💡 Pro Tips

1. **Save Booking IDs**: Keep them for reference
2. **Check Regularly**: Website shows updates automatically
3. **Flexible Dates**: Book weekdays when possible
4. **Phone Format**: Use valid 10-digit Indian numbers
5. **Email**: Check spam folder for confirmations
6. **Reschedule Early**: Contact salon ASAP if needed
7. **Verify Details**: Make sure info is correct before booking

---

## 🎯 Quick Answers

**Q: Status not updating?**
A: Refresh page or check internet connection

**Q: How do I cancel?**
A: Contact salon directly or wait for rejection

**Q: Can I edit my booking?**
A: Not yet - contact salon to reschedule

**Q: Multiple time slots?**
A: Book separately for each appointment

**Q: Group bookings?**
A: Create multiple individual bookings

---

## 🖨️ Print This Card

Save this as PDF or keep this page in bookmark for quick reference!

---

**Last Updated**: April 23, 2026  
**System Version**: 1.0  
**Admin Email**: sonu@streetsaloon.com
