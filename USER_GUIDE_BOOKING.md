# User Guide - Booking & Approval Tracking

## 👤 Complete Booking Process for Customers

### Overview

```
📱 Browse Services
       ↓
📅 Select Date & Time
       ↓
👤 Enter Your Details
       ↓
✅ Complete Booking
       ↓
⏳ Waiting for Confirmation
       ↓
🎉 Booking Confirmed / ❌ Booking Rejected
```

---

## 📱 Step-by-Step Booking

### Step 1: Browse Services

**Page**: Home or Services page

What you'll see:
- Grid of available services
- Service images
- Service names
- Price ranges
- Descriptions

**Action**: Click on a service you want to book

Example:
```
┌──────────────────────────┐
│   Haircut (Women)       │
│  ₹200 – ₹500           │
│  [Expertly crafted      │
│   precision cuts...]   │
│                        │
│     [BOOK NOW] →       │
└──────────────────────────┘
```

---

### Step 2: Choose Date & Time

**Page**: Booking Form (Step 2)

**Date Selection**:
```
┌─────────────────────────────┐
│  Select Date (Min: Today)  │
├─────────────────────────────┤
│ April 2026               ← | → |
├──┬──┬──┬──┬──┬──┬──┐
│Su│Mo│Tu│We│Th│Fr│Sa│
├--┼--┼--┼--┼--┼--┼--┤
│  │  │  │  │ 1│ 2│ 3│
│ 4│ 5│ 6│ 7│ 8│ 9│10│
│11│12│13│14│15│16│17│
│18│19│20│21│22│23│24│ 
│25│26│27│28│29│30│  │
└──┴──┴──┴──┴──┴──┴──┘
            [25th selected]
```

**Action**: Click on a date

**Time Slot Selection**:
```
Available Time Slots for April 25:

[ ] 10:00 AM     [ ] 3:00 PM
[ ] 11:00 AM     [ ] 4:00 PM
[ ] 12:00 PM     [ ] 5:00 PM
[✓] 2:00 PM ← (You selected this)
                 [ ] 6:00 PM
                 [ ] 7:00 PM
```

**Note**: 
- Greyed out slots = Already booked
- Only available slots shown
- System prevents double-booking

---

### Step 3: Enter Your Details

**Page**: Booking Form (Step 3)

**Form Fields**:
```
┌─────────────────────────────────────────┐
│  YOUR DETAILS                           │
├─────────────────────────────────────────┤
│ Full Name *                             │
│ [_______________________________]       │
│                                         │
│ Email Address *                         │
│ [____________________@example.com_]    │
│                                         │
│ Phone Number *                          │
│ [9876543210_________________]          │
│                                         │
│           [← BACK]    [BOOK NOW →]     │
└─────────────────────────────────────────┘
```

**Field Requirements**:
- **Name**: Your full name (required)
- **Email**: Valid email for confirmation (required)
- **Phone**: 10-digit Indian mobile number (required)

**Validation**:
- Cannot submit if any field is empty
- Email must have valid format
- Phone must be a valid number

---

### Step 4: Complete Booking

**Action**: Click "BOOK NOW" button

**What Happens Next**:
1. ⚙️ System validates all information
2. 📊 System checks if time slot is still available
3. 📝 Booking is created with status: "PENDING"
4. 💾 Your booking ID is generated and saved
5. 🎉 Success page appears

---

## ⏳ Booking Pending Status

### Success Screen

After successful booking, you'll see:

```
┌─────────────────────────────────────┐
│        🕐 PENDING APPROVAL          │
│                                     │
│   Your request is sent.             │
│   Waiting for confirmation.         │
│                                     │
├─────────────────────────────────────┤
│  Haircut (Women)                   │
│  April 25, 2026 at 2:00 PM        │
│                                     │
│  Booking ID: 1704067200000         │
│  Reference: You can use this to    │
│            check your status       │
│                                     │
│  📝 Confirmation Details           │
│  ├─ Customer: Priya Sharma        │
│  ├─ Phone: 9876543210            │
│  ├─ Email: priya@example.com     │
│  └─ Created: Today 10:00 AM      │
│                                     │
│  Message:                          │
│  "Your request is sent.            │
│   Waiting for confirmation."       │
│                                     │
│ [Check Status]  [Save as PDF]     │
│                                     │
│ ✓ Booking ID has been saved to    │
│   your browser for quick access    │
└─────────────────────────────────────┘
```

### What Happens Now?

**Behind the Scenes:**
1. ✉️ Admin receives notification
2. 🔍 Admin reviews your booking
3. 📱 Admin checks stylist availability
4. ✅ Admin clicks "Approve" (or ❌ Rejects)

**During Wait Time:**
- ⏱️ System auto-checks every 10 seconds
- 🔔 Page updates automatically with new status
- 👁️ You'll see the status change instantly

**How Long?**
- Typical response: 2-4 hours
- Peak times: Up to 24 hours
- Check your notifications to stay updated

---

## 🎉 Booking Confirmed

### When Admin Approves

Your page automatically updates to show:

```
┌─────────────────────────────────────┐
│        ✅ BOOKING CONFIRMED         │
│                                     │
│   🎉 Your booking is confirmed!    │
│                                     │
├─────────────────────────────────────┤
│  Haircut (Women)                   │
│  April 25, 2026 at 2:00 PM        │
│                                     │
│  Booking ID: 1704067200000         │
│  Status: APPROVED                  │
│                                     │
│  ✓ Confirmed on: Today 10:05 AM   │
│                                     │
│  Notifications:                    │
│  ✓ Website notification received   │
│  ✓ WhatsApp message sent           │
│  ✓ Email confirmation sent         │
│                                     │
│  [Share Booking]  [Print]  [Home] │
└─────────────────────────────────────┘
```

### Notifications You'll Receive

**Website (Always)**:
- ✅ Notification appears on your booking page immediately
- Status changes to "APPROVED"
- Green checkmark indicator

**WhatsApp (If enabled by salon)**:
- 📱 Message to your phone from Street Saloon
- Contains: Service name, date, time, booking ID

**Email (If enabled by salon)**:
- 📧 Email with subject: "Booking Confirmed"
- Contains: All booking details
- Can be printed as receipt

### What to Do Next

1. **Confirm Receipt**: Verify all details are correct
2. **Set Reminder**: Note the date and time
3. **Contact Salon**: If you need to reschedule
4. **Save Booking ID**: Keep this for reference

---

## ❌ Booking Rejected

### When Admin Rejects

Your page updates to show:

```
┌──────────────────────────────────┐
│      ❌ BOOKING REJECTED         │
│                                  │
│  Unfortunately, we couldn't      │
│  confirm your booking.           │
│                                  │
├──────────────────────────────────┤
│  Service: Haircut (Women)       │
│  Requested Date: April 25, 2026 │
│  Requested Time: 2:00 PM        │
│                                  │
│  Reason:                         │
│  "Stylist not available on      │
│   this date"                    │
│                                  │
│  What You Can Do:               │
│  ✓ Choose a different date      │
│  ✓ Choose a different time      │
│  ✓ Contact Street Saloon        │
│                                  │
│  [Book Again]  [Contact Us]     │
└──────────────────────────────────┘
```

### Rejection Reasons (Examples)

| Reason | Meaning | Next Step |
|--------|---------|-----------|
| Stylist not available | No stylist for that date | Try different date |
| Time slot not available | Time has been taken | Choose different time |
| Service unavailable | Service temporarily closed | Try different service |
| Other reason | Custom reason provided | Contact salon |

### What to Do After Rejection

1. **Understand the Reason**: Read what the salon said
2. **Check Alternative Times**: Try different date/time
3. **Contact Salon**: Call or WhatsApp them
4. **Book Again**: Make a new booking with different details

---

## 🔍 Check Booking Status Later

### Access the Status Page

**URL**: `/booking-status` (in the website)

**How to Get There**:
1. Go to the website home page
2. Click on "Check Booking Status" (in footer or nav)
3. Or directly visit the status page

### Search for Your Booking

```
┌─────────────────────────────────────┐
│    CHECK YOUR BOOKING STATUS       │
│                                     │
│  If you want to check the status   │
│  of your appointment, enter your   │
│  booking ID below.                 │
│                                     │
├─────────────────────────────────────┤
│  Enter Booking ID:                 │
│  [1704067200000_____________]     │
│                                     │
│           [🔍 SEARCH]              │
└─────────────────────────────────────┘
```

**Where to Find Your Booking ID**:
- 📧 In your confirmation email
- 💬 In WhatsApp message from salon
- 📱 On your booking confirmation page
- 🔖 Saved in browser (if you used same device)

### View Your Booking Status

**Pending**:
```
Status: 🕐 PENDING
"Your request is sent. 
 Waiting for confirmation."
```

**Approved**:
```
Status: ✅ APPROVED
"Your booking is confirmed"

Service: Haircut (Women)
Date: April 25, 2026
Time: 2:00 PM
```

**Rejected**:
```
Status: ❌ REJECTED
"Your booking request was rejected.
 Reason: [Specific reason provided]"
```

---

## 📝 Booking Confirmation Email

### What You'll Receive

If WhatsApp/Email is enabled, you'll get:

**Email Subject:**
```
Booking Confirmed - Haircut (Women) on April 25, 2026
```

**Email Content:**
```
Hi Priya,

✓ Your booking has been confirmed!

Service: Haircut (Women)
Date: April 25, 2026
Time: 2:00 PM
Booking ID: 1704067200000

We're excited to see you! If you need to reschedule 
or have any questions, please contact us.

Thank you for choosing Street Saloon!

---
Street Saloon Team
Phone: [contact number]
WhatsApp: [contact number]
Website: streetsaloon.com
```

---

## 📱 WhatsApp Confirmation Message

### Example Message

```
Hi Priya!

Your booking is confirmed ✓

Service: Haircut (Women)
Date: April 25, 2026
Time: 2:00 PM
Booking ID: 1704067200000

Thank you! - Street Saloon
```

---

## ❓ Frequently Asked Questions

### Q: How long does approval take?
**A**: Usually 2-4 hours. We aim for quick response. Check back later or enable notifications.

### Q: What if my time slot is no longer available?
**A**: This is rare but can happen if another customer booked the same slot. The page will notify you - you can choose a different time.

### Q: Can I change my booking after sending?
**A**: Current system: No, but you can reject it and book again. We'll add edit feature soon.

### Q: What if I don't receive a notification?
**A**: Always check the website booking status page. WhatsApp/Email are bonus channels. Website notification always works.

### Q: How do I reschedule my booking?
**A**: 
- If still PENDING: Wait for approval, then contact salon
- If APPROVED: Contact the salon directly
- Or: Cancel and make a new booking

### Q: Is my payment processed when I book?
**A**: No, this is a request to book. Payment is handled separately when you come in.

### Q: What are the salon's hours?
**A**: Check the website or ask via WhatsApp/Phone.

### Q: Can I book someone else's appointment?
**A**: Yes, just use their name, email, and phone number in the form.

### Q: What if I book by mistake?
**A**: Contact the salon immediately. If not approved yet, there's no charge. If approved, they'll help you reschedule.

---

## 📞 Contact & Support

### Need Help?

**During Booking:**
- Email: contact@streetsaloon.com
- WhatsApp: [salon WhatsApp number]
- Phone: [salon phone number]

**For Status:**
- Use the "Check Status" page
- Or WhatsApp your booking ID

**For Rescheduling:**
- Contact salon directly
- They can modify approved bookings

---

## 💡 Tips for Best Experience

### ✅ DO

- ✅ Use your real phone number (for notifications)
- ✅ Check your email/WhatsApp for updates
- ✅ Save your booking ID somewhere accessible
- ✅ Allow notifications in your browser
- ✅ Contact salon if you need to reschedule

### ⏱️ Times to Avoid

- Avoid requesting weekends/holidays if possible (safer to book on weekdays)
- Peak hours: 2-7 PM (high booking volume)
- Try: Weekday mornings for faster approval

### 🎯 Best Practices

1. **Be Early**: Book a few days before your preferred date
2. **Flexible**: Have backup time slots in mind
3. **Verify**: Double-check your contact info before booking
4. **Wait**: Check back after 2-4 hours for approval
5. **Follow Up**: Contact salon if not confirmed within 24 hours

---

## 📚 Related Pages

- [Home Page](/) - Browse services and book
- [Check Status](/booking-status) - Track your booking
- [Gallery](/gallery) - See our work
- [Contact](/contact) - Reach out to us

---

## 🆘 Troubleshooting

### Problem: "Slot not available" when I try to book

**Solution**: Another customer just booked that slot. Choose a different time or date.

### Problem: Email has wrong details

**Solution**: Double-check the details you entered. If wrong, contact salon with your booking ID.

### Problem: I didn't get the confirmation email

**Solution**: Check spam folder. If still not there, contact salon with your booking ID.

### Problem: The page keeps showing "waiting..." forever

**Solution**: 
1. Refresh the page
2. Try clearing browser cache
3. Try on different browser
4. Check your internet connection

### Problem: Booking form won't submit

**Solution**:
1. Ensure all fields are filled
2. Check if phone number is valid 10-digit
3. Check if email has @ symbol
4. Try from different browser
5. Check your internet connection

---

Last updated: April 23, 2026
For more support, visit us or contact Street Saloon!
