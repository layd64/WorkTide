// Simple validation utilities for frontend

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Invalid email format';
  }
  
  if (trimmed.length > 255) {
    return 'Email is too long (max 255 characters)';
  }
  
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (password.length > 100) {
    return 'Password is too long (max 100 characters)';
  }
  
  return null;
}

export function validateFullName(fullName: string): string | null {
  if (!fullName || typeof fullName !== 'string') {
    return 'Full name is required';
  }
  
  const trimmed = fullName.trim();
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters long';
  }
  
  if (trimmed.length > 100) {
    return 'Full name is too long (max 100 characters)';
  }
  
  return null;
}

export function validateTextLength(text: string, fieldName: string, min: number, max: number): string | null {
  if (text === undefined || text === null) {
    return null; // Optional fields
  }
  
  if (typeof text !== 'string') {
    return `${fieldName} must be a string`;
  }
  
  if (text.length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  
  if (text.length > max) {
    return `${fieldName} is too long (max ${max} characters)`;
  }
  
  return null;
}

export function validateNumberRange(value: number | string, fieldName: string, min: number, max: number): string | null {
  if (value === undefined || value === null || value === '') {
    return null; // Optional fields
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (numValue > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  
  return null;
}

export function validateArrayLength(value: any[], fieldName: string, minLength?: number, maxLength?: number): string | null {
  if (value === undefined || value === null) {
    return null; // Optional fields
  }
  
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`;
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return `${fieldName} must have at least ${minLength} item(s)`;
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} items`;
  }
  
  return null;
}

export function validateFile(file: File | null, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']): string | null {
  if (!file) {
    return 'File is required';
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must not exceed ${maxSizeMB} MB`;
  }
  
  return null;
}

