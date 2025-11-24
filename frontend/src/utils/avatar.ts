/**
 * Generates user initials from their full name
 * - For single word names: returns first two letters uppercase
 * - For multiple word names: returns first letter of each word (up to two words) uppercase
 * 
 * @param fullName User's full name
 * @returns String with initials
 */
export const getInitials = (fullName: string): string => {
  if (!fullName) return '';
  
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    // Single word name - return first two letters
    return nameParts[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple word name - return first letter of first two words
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
};

/**
 * Generates a random background color for the avatar
 * Returns one of a few preset colors for consistency
 */
export const getAvatarBgColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
  ];
  
  // Handle empty or undefined names
  if (!name || name.trim() === '') {
    return colors[0]; // Default to first color
  }
  
  // Use the sum of character codes to deterministically generate a color
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

/**
 * Creates an Avatar component with user's initials and background color
 */
export const getInitialsAvatar = (fullName: string): { initials: string, bgColor: string } => {
  const initials = getInitials(fullName) || '?';
  const bgColor = getAvatarBgColor(fullName || '');
  
  return { initials, bgColor };
}; 