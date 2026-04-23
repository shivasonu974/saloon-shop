# Security Specification - Street Saloon Booking System

## 1. Data Invariants
- A booking must always have a corresponding entry in the `slots` collection to ensure the time is marked as taken.
- Every booking must have a valid customer name, email (regex), and phone number.
- The `status` of a booking must strictly follow the transition state (starts at 'pending').
- The `date` must be a valid future or current day string.

## 2. The Dirty Dozen Payloads (Targeting PERMISSION_DENIED)
1. **The Ghost Field**: Creating a booking with `isVerified: true` (Unauthorized field).
2. **The Identity Spoof**: Trying to read all documents in the `bookings` collection as a guest.
3. **The ID Poisoning**: Using a 2KB string as a document ID for a booking.
4. **The State Shortcut**: Creating a booking with `status: 'confirmed'` instead of `pending`.
5. **The Orphan Write**: Creating a booking without creating a corresponding `slot` in the same batch.
6. **The PII Leak**: Reading a specific booking document by ID without being the admin or having a secret token.
7. **The Time Travel**: Setting a `createdAt` timestamp from 2 days ago.
8. **The Overwrite**: Attempting to update the `date` of an existing booking.
9. **The Size Attack**: Sending a `customerName` that is 500 characters long.
10. **The Email Spoof**: Providing a malformed email address string.
11. **The Double Booking**: Trying to create a slot that already exists.
12. **The Status Hijack**: Updating a booking's status to 'confirmed' as a non-admin.

## 3. Test Runner Concept
The `firestore.rules.test.ts` will verify that:
- `get` on `/bookings/{id}` is DENIED for guests.
- `list` on `/bookings` is DENIED for guests.
- `create` on `/bookings` is ALLOWED only if it matches the schema AND a slot is created atomically.
- `create` on `/slots` is DENIED if the slot already exists.
