// Booking service - handles communication with the backend API.

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface BookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  slot: string;
}

export interface BookingRecord extends BookingData {
  id: string;
  status: BookingStatus;
  createdAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface BookingStatusResponse {
  id: string;
  status: BookingStatus;
  serviceTitle: string;
  date: string;
  slot: string;
  message: string;
}

// Get booked slots for a specific date from the backend availability API.
export async function getBookedSlots(date: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }

    const data = await response.json();
    return Array.isArray(data.slots) ? data.slots : [];
  } catch (error: any) {
    console.error('Error fetching booked slots:', error);
    return [];
  }
}

// Create a booking via the backend API. New bookings are always pending.
export async function createBooking(data: BookingData): Promise<BookingRecord> {
  try {
    const response = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create booking');
    }

    return result.booking;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create booking');
  }
}

export async function getBookingStatus(id: string): Promise<BookingStatusResponse> {
  const response = await fetch(`/api/book/status/${encodeURIComponent(id)}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch booking status');
  }

  return result;
}
