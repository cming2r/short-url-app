/**
 * URL validation utility functions
 */

/**
 * Validates if a URL is properly formatted
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function validateUrl(url) {
  if (!url || !/^https?:\/\//.test(url)) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Formats a URL by adding https:// if protocol is missing
 * @param {string} url - The URL to format
 * @returns {string} - The formatted URL
 */
export function formatUrl(url) {
  if (!url) return url;
  
  let formattedUrl = url.trim();
  if (!/^https?:\/\//.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }
  
  return formattedUrl;
}

/**
 * Validates if a custom code meets the requirements
 * @param {string} code - The custom code to validate
 * @returns {boolean} - Whether the code is valid
 */
export function validateCustomCode(code) {
  if (!code) return false;
  
  const isValidLength = code.length >= 4 && code.length <= 5;
  const hasLetter = /[a-zA-Z]/.test(code);
  const hasNumber = /[0-9]/.test(code);
  const isValidChars = /^[a-zA-Z0-9]+$/.test(code);
  
  return isValidLength && hasLetter && hasNumber && isValidChars;
}