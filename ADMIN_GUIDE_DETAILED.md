# Admin Operations Guide - Booking Approval & Management

## 📋 Table of Contents

1. [Admin Login](#admin-login)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Bookings](#managing-bookings)
4. [Approval Workflow](#approval-workflow)
5. [Rejection Workflow](#rejection-workflow)
6. [Notification Verification](#notification-verification)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## 🔐 Admin Login

### Login URL
```
http://localhost:3000/admin/login
(or your production domain)
```

### Default Credentials
```
Email: sonu@streetsaloon.com
Password: admin123
```

⚠️ **Important**: Change these credentials in production!

### What Happens After Login?
- ✅ Admin token generated and stored in localStorage
- ✅ Token valid for 24 hours
- ✅ Redirected to Admin Dashboard
- ✅ Token automatically sent with all admin requests

---

## 📊 Dashboard Overview

### Main Tabs

```
┌─────────────────────────────────────────────────────────┐
│ Admin Dashboard                           🔔 Logout    │
├─────────────────────────────────────────────────────────┤
│ [Overview] [Bookings] [Services] [Pricing]             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  SELECTED TAB CONTENT                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1. Overview Tab
Displays key business metrics:

| Metric | Shows |
|--------|-------|
| **Total Bookings** | Lifetime count of all bookings |
| **Total Revenue** | Estimated revenue (Average: ₹350/booking) |
| **Total Services** | Number of services available |
| **Total Clients** | Unique customer count |

### 2. Bookings Tab ⭐ (Main Feature)
Complete booking management interface where you:
- View all bookings with status indicators
- Approve pending bookings
- Reject bookings with reasons
- Delete bookings
- See real-time status updates

### 3. Services Tab
Manage salon services:
- Add new services
- Edit existing services
- Update descriptions and images
- Delete services

### 4. Pricing Tab
Manage service pricing:
- Set base prices
- Add discount prices
- Track pricing changes
- Per-service pricing control

---

## 📝 Managing Bookings

### Booking Status Cards

At the top of the Bookings tab, you'll see three status cards:

```
┌──────────────────┬──────────────────┬──────────────────┐
│    🕐 PENDING    │    ✓ APPROVED    │    ✗ REJECTED    │
│        5         │        12        │        2         │
└──────────────────┴──────────────────┴──────────────────┘
```

Each card shows the count of bookings in that status.

### Bookings Table

```
┌─────────────┬─────────┬──────────┬──────────────┬────────┬─────────────┐
│ Customer    │ Phone   │ Service  │ Date & Time  │ Status │ Actions     │
├─────────────┼─────────┼──────────┼──────────────┼────────┼─────────────┤
│ Priya S.    │ 9876... │ Haircut  │ 2026-04-25   │Pending │ ✓ Reject ✗  │
│ priya@..com │         │ (Women)  │ 2:00 PM      │        │      🗑     │
├─────────────┼─────────┼──────────┼──────────────┼────────┼─────────────┤
│ Rajesh K.   │ 9999... │ Hair spa │ 2026-04-28   │Approved│      🗑     │
│ rajesh@...  │         │          │ 3:00 PM      │        │             │
└─────────────┴─────────┴──────────┴──────────────┴────────┴─────────────┘
```

### Sorting Rules

Bookings are automatically sorted:
1. **Pending bookings appear first** (needs action)
2. Within each status group, sorted by date/time (newer first)

---

## ✅ Approval Workflow

Step-by-step guide to approve a booking:

### Step 1: Review the Booking
Look at the pending booking details:
- ✓ Customer name and contact info
- ✓ Service requested
- ✓ Preferred date and time
- ✓ Verify slot availability

### Step 2: Check Stylist Availability
Before approving, ensure:
- Stylist is available on that date
- No conflicting appointments
- Required skills match the service

### Step 3: Click Approve Button

<img alt="Approve Button" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40'%3E%3Crect fill='%2322c55e' width='100' height='40' rx='8'/%3E%3Ctext x='50' y='25' text-anchor='middle' fill='white' font-weight='bold'%3E✓ Approve%3C/text%3E%3C/svg%3E" />

The green button with checkmark (✓)

Expected behavior:
- Button shows loading spinner while processing
- Booking status changes to "Approved"
- User receives notification (Website + Optional: WhatsApp/Email)
- Success message appears at top: "Booking approved. The user can now see: 'Your booking is confirmed'."

### Step 4: Confirmation
You should see:
```
✅ Success Message
"Booking approved. The user can now see: 'Your booking is confirmed'."
```

And in the table, the booking status changes:
```
Before: [🕐 Pending]
After:  [✓ Approved]
```

---

## ❌ Rejection Workflow

Step-by-step guide to reject a booking:

### Step 1: Review Issues
Identify why you're rejecting:
- Stylist not available
- Date/time conflict
- Service capacity issue
- Customer requested cancellation
- Other reason

### Step 2: Click Reject Button

For pending bookings, click the red X button next to the Approve button.

### Step 3: Enter Reason

A dialog box appears:
```
┌─────────────────────────────────────────┐
│ Enter rejection reason (optional):      │
│ ┌─────────────────────────────────────┐ │
│ │ _______________________________      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Examples:                              │
│ • Stylist not available on this date   │
│ • Time slot no longer available        │
│ • Service temporarily unavailable      │
│                                         │
│           [Cancel]        [Reject]     │
└─────────────────────────────────────────┘
```

**Tip**: Be specific - the reason is sent to the customer!

### Step 4: Confirmation
- Button shows loading spinner
- Booking status changes to "Rejected"
- Table is updated
- Success message: "Booking rejected."

### What User Sees
The customer receives message:
```
"Your booking request was rejected. 
Reason: Stylist not available on this date"
```

---

## 🔔 Notification Verification

### Notification Channels

After approval, user receives notification on these channels:

| Channel | Status | Notes |
|---------|--------|-------|
| **Website** | ✅ Always | User sees status immediately when checking |
| **WhatsApp** | ⚠️ Optional | Requires WhatsApp API configuration |
| **Email** | ⚠️ Optional | Requires Email API configuration |

### Check Notification Configuration

In admin dashboard, the server logs show which channels are active:

**Example console output:**
```
[NOTIFICATION] Sending confirmation for booking 1704067200000
[✓ WHATSAPP] WhatsApp message sent successfully
[✓ EMAIL] Email sent successfully
```

Or if not configured:
```
[✓ WEBSITE] User can see status on website (always)
[✗ WHATSAPP] SKIPPED - API not configured
[✗ EMAIL] SKIPPED - API not configured
```

### Verify User Received Notification

**Website Notification** (Always Works):
1. Have customer check their booking on the Booking Status page
2. They should see: "Your booking is confirmed"

**WhatsApp Notification** (If Configured):
1. Go to your WhatsApp chats
2. Look for message from Street Saloon automated number
3. Verify message content

**Email Notification** (If Configured):
1. Check customer's email inbox
2. Look for subject: "Booking Confirmed - [Service] on [Date]"
3. Verify details in email

---

## 🛠️ Common Tasks

### Task 1: Review Pending Bookings

1. Click on "Bookings" tab
2. Look at the **🕐 Pending** card (top left)
3. All pending bookings appear first in the table
4. Read through each one carefully

### Task 2: Batch Approve Multiple Bookings

**Scenario**: You have 5 pending bookings and you can accommodate all of them.

1. Open the Bookings tab
2. For each pending booking that's feasible:
   - Click the green **Approve** button
   - Wait for confirmation
   - Move to next booking

**Tip**: Approve them one at a time to ensure proper notification delivery

### Task 3: Handle Rush Hour Bookings

**Scenario**: Multiple bookings for the same time slot (shouldn't happen, but just in case)

1. First-come-first-served: Approve the oldest booking first
2. Reject the others with reason: "Time slot is now occupied"
3. Customers can rebook with different slots

### Task 4: Clean Up Rejected Bookings

**Scenario**: You want to remove rejected bookings to keep dashboard clean

1. Find rejected booking in table (Red status badge)
2. Click the trash icon 🗑️ on the right
3. Confirm deletion
4. Booking is permanently removed

### Task 5: Export Booking Data

**Currently**: Manual copy from table (copy function coming soon)

**Workaround**:
1. Use browser DevTools to inspect table
2. Or take screenshots for records
3. Or access API directly if you have tech team

---

## ❓ Troubleshooting

### Issue: I can't see any bookings

**Possible causes:**
- I'm not logged in
- No bookings have been made yet
- Page needs refresh

**Solutions:**
1. Check if you're logged in (see email at top right)
2. If not, go to /admin/login and login again
3. Click the **Refresh** button (blue button at top)
4. Wait for customers to make bookings

### Issue: Approve button doesn't work

**Possible causes:**
- Token expired (24 hour limit)
- Network connection issue
- Server error

**Solutions:**
1. Check browser console for errors (F12 → Console)
2. If token expired, logout and login again
3. Try refreshing the page
4. Check your internet connection

**Error message**: "401 - Invalid token"
**Fix**: Logout and login again

### Issue: Customer says they didn't get notification

**Investigation:**
1. Check if booking status is "approved" in your dashboard
2. Verify WhatsApp/Email is configured (.env file)
3. Check phone number format (should be valid)
4. Check customer email is correct

**Solutions:**
1. Have customer check the booking on website (always works)
2. If WhatsApp/Email configured, check provider logs
3. Try approving again (resubmit notification)

### Issue: Can't log in

**Possible causes:**
- Wrong email or password
- Browser cache issue
- Session storage issue

**Solutions:**
1. Verify email: `sonu@streetsaloon.com` (case-sensitive)
2. Verify password (check with team lead)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try in an incognito/private window
5. Try a different browser

### Issue: Session expired / logged out unexpectedly

**Reason**: Admin tokens expire after 24 hours

**Solution**: Simply log in again. Your bookings data is persistent.

### Issue: Accidentally deleted a booking

**Bad news**: Deletion is permanent (in current version)

**Solutions for future**:
- We'll add booking recovery/restoration in next version
- Currently, customer can rebook
- Admin can create manual booking record

**Prevention**:
- Confirmation dialog appears before deletion
- Read carefully before confirming

---

## 📞 Support & Escalation

### Common Questions

**Q: How often should I check for new bookings?**
A: Check daily or connect dashboard to your phone for real-time notifications (coming soon)

**Q: What if I need to change a booking time?**
A: Currently, reject and have customer rebook. We'll add edit feature soon.

**Q: Can I set auto-approval for certain times?**
A: Not yet. We're considering automation rules for future version.

**Q: What happens to rejected bookings?**
A: Customer sees rejection reason and can book again with different time/date.

### Escalation Contact

For technical issues:
- Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- Check [README.md](README.md)
- Contact development team

---

## 🎓 Best Practices

### ✅ DO

- ✅ Approve bookings within 2-4 hours (customer expects quick response)
- ✅ Always provide a reason when rejecting
- ✅ Check stylist calendar before approving
- ✅ Refresh dashboard when noticing strange data
- ✅ Verify phone numbers are correct before approving

### ❌ DON'T

- ❌ Don't approve without checking stylist availability
- ❌ Don't leave rejected bookings in system (clean them up)
- ❌ Don't share admin credentials
- ❌ Don't forget to verify customer contact info is correct
- ❌ Don't bulk-approve without reviewing each booking

---

## 📱 Mobile Admin Access

The admin dashboard is responsive and works on mobile:
- ✅ Works on tablets (iPad, Android tablets)
- ✅ Mostly works on phones (smaller screens)
- ✅ Better UX on desktop/tablet

**Tip**: Use tablet for best experience while managing bookings on the go

---

## 🔄 Daily Admin Checklist

```
 Daily Workflow
┌─────────────────────────────────────────┐
│ □ Log in to admin dashboard            │
│ □ Check Bookings tab                   │
│ □ Review all PENDING bookings          │
│ □ Approve feasible bookings            │
│ □ Reject impossible bookings           │
│ □ Verify customer got notification     │
│ □ Clean up rejected/completed bookings │
│ □ Check stats in Overview tab          │
│ □ Log out before ending shift          │
└─────────────────────────────────────────┘
```

---

## 📚 Additional Resources

- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Technical details
- [APPROVAL_AND_NOTIFICATIONS.md](APPROVAL_AND_NOTIFICATIONS.md) - Feature specifications
- [README.md](README.md) - Project overview

---

Last updated: April 23, 2026
For questions, contact the development team.
