/**
 * Utility functions for generating and validating slugs
 */

/**
 * Generate a URL-friendly slug from a service title
 * @param title - The service title to convert to a slug
 * @param email - The email to use for uniqueness
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string, email: string): string {
  // Convert to lowercase and replace spaces with hyphens
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '') // Remove special characters except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens

  // Add email hash for uniqueness (first 8 characters of email hash)
  const emailHash = email
    .split('')
    .reduce((hash, char) => {
      const charCode = char.charCodeAt(0);
      return ((hash << 5) - hash) + charCode;
    }, 0)
    .toString(36)
    .substring(0, 8);

  return `${slug}-${emailHash}`;
}

/**
 * Validate if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function validateSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false;
  }

  // Check for invalid characters
  const invalidChars = /[^a-z0-9\-]/;
  if (invalidChars.test(slug)) {
    return false;
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    return false;
  }

  // Check for leading or trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return false;
  }

  return true;
}

/**
 * Convert a service title to a readable slug (without email hash)
 * @param title - The service title to convert
 * @returns A readable slug
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Extract the readable part of a slug (remove email hash)
 * @param slug - The full slug with email hash
 * @returns The readable part of the slug
 */
export function extractReadableSlug(slug: string): string {
  const lastHyphenIndex = slug.lastIndexOf('-');
  if (lastHyphenIndex === -1) {
    return slug;
  }
  
  // Check if the part after the last hyphen looks like an email hash (8 characters, alphanumeric)
  const potentialHash = slug.substring(lastHyphenIndex + 1);
  if (potentialHash.length === 8 && /^[a-z0-9]+$/.test(potentialHash)) {
    return slug.substring(0, lastHyphenIndex);
  }
  
  return slug;
}
