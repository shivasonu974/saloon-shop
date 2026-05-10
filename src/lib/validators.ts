// Validation utilities for form fields

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates customer name - only alphabets and spaces allowed
 */
export const validateName = (name: string): string | null => {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return 'Name is required';
  }
  
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return 'Name should contain only letters and spaces';
  }
  
  if (trimmed.length < 2) {
    return 'Name should be at least 2 characters';
  }
  
  if (trimmed.length > 100) {
    return 'Name should not exceed 100 characters';
  }
  
  return null;
};

/**
 * Validates customer phone - exactly 10 digits
 */
export const validatePhone = (phone: string): string | null => {
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  
  if (!trimmed) {
    return 'Mobile number is required';
  }
  
  if (digitsOnly.length !== 10) {
    return 'Mobile number must be exactly 10 digits';
  }
  
  return null;
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return 'Email is required';
  }
  
  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  
  if (trimmed.length > 254) {
    return 'Email is too long';
  }
  
  return null;
};

/**
 * Validates a booking form
 */
export const validateBookingForm = (data: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceId?: string;
  date?: string;
  slot?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Validate name
  if (data.customerName !== undefined) {
    const nameError = validateName(data.customerName);
    if (nameError) {
      errors.push({ field: 'customerName', message: nameError });
    }
  }
  
  // Validate phone
  if (data.customerPhone !== undefined) {
    const phoneError = validatePhone(data.customerPhone);
    if (phoneError) {
      errors.push({ field: 'customerPhone', message: phoneError });
    }
  }
  
  // Validate email
  if (data.customerEmail !== undefined) {
    const emailError = validateEmail(data.customerEmail);
    if (emailError) {
      errors.push({ field: 'customerEmail', message: emailError });
    }
  }
  
  // Validate service selection
  if (!data.serviceId) {
    errors.push({ field: 'serviceId', message: 'Please select a service' });
  }
  
  // Validate date
  if (!data.date) {
    errors.push({ field: 'date', message: 'Please select a date' });
  }
  
  // Validate slot
  if (!data.slot) {
    errors.push({ field: 'slot', message: 'Please select a time slot' });
  }
  
  return errors;
};

/**
 * Check if form has specific field error
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(err => err.field === field);
  return error?.message || null;
};

/**
 * Check if any field has errors
 */
export const hasErrors = (errors: ValidationError[]): boolean => {
  return errors.length > 0;
};
