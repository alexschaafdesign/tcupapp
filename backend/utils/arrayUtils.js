// utils/arrayUtils.js

/**
 * Cleans an array by removing null, undefined, empty strings, or whitespace-only strings.
 * @param {Array} arr - The array to clean.
 * @returns {Array} - The cleaned array.
 */
const cleanArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => item && typeof item === 'string' && item.trim() !== '');
};

export default cleanArray;