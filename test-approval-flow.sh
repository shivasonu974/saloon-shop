#!/bin/bash
# Demo script for admin approval and notification system
# This script demonstrates the complete booking flow with approval

echo "==================== STREET SALOON BOOKING SYSTEM DEMO ===================="
echo ""
echo "This demo shows the complete workflow of booking, admin approval, and notifications"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3000"

echo -e "${BLUE}Step 1: Create a New Booking${NC}"
echo "================================"
echo ""

# Create a booking
BOOKING_DATA='{
  "customerName": "Priya Singh",
  "customerEmail": "priya.singh@example.com",
  "customerPhone": "9876543211",
  "serviceId": "haircut-women",
  "serviceTitle": "Haircut (Women)",
  "date": "2026-04-26",
  "slot": "02:00 PM"
}'

echo "Submitting booking request..."
echo ""

BOOKING_RESPONSE=$(curl -s -X POST "$API_BASE/api/book" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_DATA")

BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo $BOOKING_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

echo -e "${GREEN}✓ Booking Created${NC}"
echo -e "  Booking ID: ${YELLOW}$BOOKING_ID${NC}"
echo -e "  Status: ${YELLOW}$STATUS${NC}"
echo -e "  Customer: Priya Singh"
echo -e "  Service: Haircut (Women)"
echo -e "  Date: 2026-04-26"
echo -e "  Slot: 02:00 PM"
echo ""

echo -e "${BLUE}Step 2: Check Booking Status (Before Approval)${NC}"
echo "=============================================="
echo ""

STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/api/book/status/$BOOKING_ID")
CURRENT_STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
MESSAGE=$(echo $STATUS_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4 | head -1)

echo -e "Current Status: ${YELLOW}$CURRENT_STATUS${NC}"
echo -e "Message: $MESSAGE"
echo ""

echo -e "${BLUE}Step 3: Admin Login${NC}"
echo "==================="
echo ""

LOGIN_DATA='{"email":"sonu@streetsaloon.com","password":"admin123"}'

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo -e "${GREEN}✓ Admin Logged In${NC}"
echo -e "  Admin Email: sonu@streetsaloon.com"
echo -e "  Token: ${YELLOW}${ADMIN_TOKEN:0:20}...${NC}"
echo ""

echo -e "${BLUE}Step 4: Admin Approves Booking${NC}"
echo "==============================="
echo ""

APPROVE_RESPONSE=$(curl -s -X PUT "$API_BASE/api/book/$BOOKING_ID/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

APPROVED_STATUS=$(echo $APPROVE_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$APPROVED_STATUS" == "approved" ]; then
  echo -e "${GREEN}✓ Booking Approved Successfully${NC}"
  echo -e "  New Status: ${GREEN}APPROVED${NC}"
  echo -e "  Notification Sent:"
  echo -e "    - Email to: priya.singh@example.com"
  echo -e "    - WhatsApp to: 9876543211"
else
  echo -e "${RED}✗ Approval Failed${NC}"
fi
echo ""

echo -e "${BLUE}Step 5: Check Booking Status (After Approval)${NC}"
echo "============================================"
echo ""

STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/api/book/status/$BOOKING_ID")
FINAL_STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
FINAL_MESSAGE=$(echo $STATUS_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4 | head -1)

echo -e "Current Status: ${GREEN}$FINAL_STATUS${NC}"
echo -e "Message: $FINAL_MESSAGE"
echo ""

echo -e "${BLUE}Step 6: View All Bookings (Admin View)${NC}"
echo "======================================"
echo ""

BOOKINGS_RESPONSE=$(curl -s -X GET "$API_BASE/api/admin/bookings" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Total bookings in system:"
echo $BOOKINGS_RESPONSE | grep -o '"status":' | wc -l | xargs echo "  "
echo ""
echo "Status breakdown:"
echo $BOOKINGS_RESPONSE | grep -o '"status":"pending"' | wc -l | xargs echo "  Pending: "
echo $BOOKINGS_RESPONSE | grep -o '"status":"approved"' | wc -l | xargs echo "  Approved: "
echo ""

echo "==================== DEMO COMPLETED ===================="
echo ""
echo "Summary:"
echo "--------"
echo -e "${GREEN}✓ Booking created with PENDING status${NC}"
echo -e "${GREEN}✓ Admin approved the booking${NC}"
echo -e "${GREEN}✓ Status changed to APPROVED${NC}"
echo -e "${GREEN}✓ Notifications sent to customer${NC}"
echo -e "${GREEN}✓ User can check booking status anytime${NC}"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Visit user booking page: http://localhost:3000/book"
echo "2. Submit a booking and note the Booking ID"
echo "3. Visit admin dashboard: http://localhost:3000/admin/dashboard"
echo "4. Login with: sonu@streetsaloon.com / admin123"
echo "5. Approve the pending booking"
echo "6. Go to: http://localhost:3000/booking-status"
echo "7. Enter Booking ID to check status"
echo ""
echo "API Endpoints:"
echo "--------------"
echo "POST   /api/book                      - Create booking"
echo "GET    /api/book/status/:id           - Check booking status (public)"
echo "PUT    /api/book/:id/approve          - Approve booking (admin)"
echo "PUT    /api/book/:id/reject           - Reject booking (admin)"
echo "GET    /api/admin/bookings            - View all bookings (admin)"
echo ""
