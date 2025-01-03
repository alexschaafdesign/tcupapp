// utils/arrayUtils.js

/**
 * Cleans an array by removing null, undefined, empty strings, or whitespace-only strings.
 * @param {Array} arr - The array to clean.
 * @returns {Array} - The cleaned array.
 */
const cleanArray = (arr) => {
    if (!Array.isArray(arr)) {
      console.error("Expected an array but got:", arr); // Debugging
      return [];
    }
    return arr.filter((item) => item && item.trim() !== ""); // Remove falsy and empty items
  };
  
  export default cleanArray;