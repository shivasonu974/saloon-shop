# Admin Dashboard - User Guide

## Overview
Welcome to Street Saloon Admin Dashboard! This is a comprehensive management panel for handling bookings, services, and pricing.

## Getting Started

### Admin Login
1. Navigate to: `http://localhost:3000/admin/login`
2. Use the demo credentials:
   - **Email**: `sonu@streetsaloon.com`
   - **Password**: `admin123`

## Features

### 1. Dashboard Overview
The overview tab shows key business metrics:
- **Total Bookings**: Number of bookings received
- **Total Revenue**: Income from all bookings
- **Services Offered**: Count of active services
- **Total Clients**: Unique customers

### 2. Bookings Management
- **View**: See all customer bookings in a table format
- **Details**: Each booking shows:
  - Customer name and email
  - Service booked
  - Date and time slot
  - Booking status (Confirmed, Pending, Completed)
  - Total amount
- **Delete**: Remove bookings as needed
- **Add New**: Create manual bookings if required

### 3. Services Management
Add, edit, or delete beauty services offered by the salon.

**Fields:**
- Service Title (e.g., "Bridal Makeover")
- Description (detailed service info)
- Base Price (in ₹)
- Image URL (optional)

**Actions:**
- Add new services using the "+ Add Service" button
- Edit existing services (hover and click Edit icon)
- Delete services (click Trash icon)

### 4. Pricing Management
Control prices and discounts for each service.

**Features:**
- **Base Price**: Original service price
- **Discount Price**: Sale price if applicable
- **Auto-calculated Discount %**: System automatically shows discount percentage

**How to Set Discounts:**
1. Enter the base price (e.g., ₹5,000)
2. Enter the discount price (e.g., ₹4,500)
3. The system will show 10% discount automatically

## Security Features
- JWT-based authentication
- Secure token storage
- Protected API endpoints
- Session management with logout option

## Tips
- Always verify customer information before confirming bookings
- Use discounts strategically during festivals and special occasions
- Monitor revenue trends through the dashboard overview
- Keep service descriptions clear and compelling

## Support
For issues or questions, contact the development team.

---
**Street Saloon © 2026**
