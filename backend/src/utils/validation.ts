import { BadRequestException } from '@nestjs/common';

// Email validation
export function validateEmail(email: string): void {
  if (!email || typeof email !== 'string') {
    throw new BadRequestException('Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new BadRequestException('Invalid email format');
  }
  
  if (email.length > 255) {
    throw new BadRequestException('Email is too long (max 255 characters)');
  }
}

// Password validation
export function validatePassword(password: string): void {
  if (!password || typeof password !== 'string') {
    throw new BadRequestException('Password is required');
  }
  
  if (password.length < 6) {
    throw new BadRequestException('Password must be at least 6 characters long');
  }
  
  if (password.length > 100) {
    throw new BadRequestException('Password is too long (max 100 characters)');
  }
}

// Full name validation
export function validateFullName(fullName: string): void {
  if (!fullName || typeof fullName !== 'string') {
    throw new BadRequestException('Full name is required');
  }
  
  const trimmed = fullName.trim();
  if (trimmed.length < 2) {
    throw new BadRequestException('Full name must be at least 2 characters long');
  }
  
  if (trimmed.length > 100) {
    throw new BadRequestException('Full name is too long (max 100 characters)');
  }
}

// Text length validation
export function validateTextLength(text: string, fieldName: string, min: number, max: number): void {
  if (text !== undefined && text !== null) {
    if (typeof text !== 'string') {
      throw new BadRequestException(`${fieldName} must be a string`);
    }
    
    if (text.length < min) {
      throw new BadRequestException(`${fieldName} must be at least ${min} characters long`);
    }
    
    if (text.length > max) {
      throw new BadRequestException(`${fieldName} is too long (max ${max} characters)`);
    }
  }
}

// Number range validation
export function validateNumberRange(value: number, fieldName: string, min: number, max: number): void {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }
    
    if (value < min) {
      throw new BadRequestException(`${fieldName} must be at least ${min}`);
    }
    
    if (value > max) {
      throw new BadRequestException(`${fieldName} must not exceed ${max}`);
    }
  }
}

// Array validation
export function validateArray(value: any, fieldName: string, minLength?: number, maxLength?: number): void {
  if (value !== undefined && value !== null) {
    if (!Array.isArray(value)) {
      throw new BadRequestException(`${fieldName} must be an array`);
    }
    
    if (minLength !== undefined && value.length < minLength) {
      throw new BadRequestException(`${fieldName} must have at least ${minLength} item(s)`);
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      throw new BadRequestException(`${fieldName} must not exceed ${maxLength} items`);
    }
  }
}

// String array validation (for skills, languages, etc.)
export function validateStringArray(value: any, fieldName: string, minLength?: number, maxLength?: number): void {
  validateArray(value, fieldName, minLength, maxLength);
  
  if (value !== undefined && value !== null && Array.isArray(value)) {
    for (const item of value) {
      if (typeof item !== 'string') {
        throw new BadRequestException(`${fieldName} must contain only strings`);
      }
      
      if (item.trim().length === 0) {
        throw new BadRequestException(`${fieldName} cannot contain empty strings`);
      }
    }
  }
}

// Enum validation
export function validateEnum(value: any, fieldName: string, allowedValues: any[]): void {
  if (value !== undefined && value !== null) {
    if (!allowedValues.includes(value)) {
      throw new BadRequestException(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }
}

// UUID validation (simple check)
export function validateId(id: string, fieldName: string = 'ID'): void {
  if (!id || typeof id !== 'string') {
    throw new BadRequestException(`${fieldName} is required`);
  }
  
  if (id.trim().length === 0) {
    throw new BadRequestException(`${fieldName} cannot be empty`);
  }
  
  // Basic UUID format check (8-4-4-4-12 hex characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }
}

// File type validation
export function validateFileType(mimetype: string, allowedTypes: string[]): void {
  if (!mimetype) {
    throw new BadRequestException('File type is required');
  }
  
  if (!allowedTypes.includes(mimetype)) {
    throw new BadRequestException(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
}

// File extension validation - blocks executable and dangerous file types
export function validateFileExtension(filename: string): void {
  if (!filename || typeof filename !== 'string') {
    throw new BadRequestException('Filename is required');
  }

  // List of dangerous/executable file extensions to block
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.msi', '.dll', '.sh', '.ps1', '.psm1', '.psd1', '.ps1xml', '.psc1',
    '.scf', '.lnk', '.inf', '.reg', '.app', '.deb', '.rpm', '.dmg', '.pkg',
    '.run', '.bin', '.appimage', '.deb', '.rpm', '.apk', '.ipa', '.msix',
    '.appx', '.xap', '.gadget', '.msp', '.mst', '.action', '.command', '.csh',
    '.ksh', '.zsh', '.fish', '.pl', '.py', '.rb', '.php', '.asp', '.aspx',
    '.jsp', '.cgi', '.htaccess', '.htpasswd'
  ];

  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (dangerousExtensions.includes(extension)) {
    throw new BadRequestException(`File type ${extension} is not allowed. Executable and potentially dangerous files are prohibited.`);
  }
}

// File size validation (in bytes)
export function validateFileSize(size: number, maxSizeBytes: number): void {
  if (size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    throw new BadRequestException(`File size must not exceed ${maxSizeMB} MB`);
  }
}

