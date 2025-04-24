const crypto = require("crypto");
const { format, parseISO } = require("date-fns");
const fr = require("date-fns/locale/fr");

/**
 * Format date to specified format
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 */
exports.formatDate = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

/**
 * Format time from date
 * @param {string|Date} date - Date to extract time from
 * @returns {string} Formatted time (HH:mm)
 */
exports.formatTime = (date) => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "HH:mm", { locale: fr });
};

/**
 * Format date range (start and end date)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
exports.formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  const isSameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

  if (isSameDay) {
    return `${format(start, "dd MMMM yyyy", { locale: fr })} de ${format(
      start,
      "HH:mm",
      { locale: fr }
    )} à ${format(end, "HH:mm", { locale: fr })}`;
  }

  return `Du ${format(start, "dd MMMM yyyy HH:mm", { locale: fr })} au ${format(
    end,
    "dd MMMM yyyy HH:mm",
    { locale: fr }
  )}`;
};

/**
 * Generate a random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
exports.truncate = (text, length = 100) => {
  if (!text) return "";

  if (text.length <= length) return text;

  return text.substring(0, length) + "...";
};

/**
 * Format phone number to French format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
exports.formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Apply French format: XX XX XX XX XX
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);

  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }

  return phone;
};

/**
 * Sort array of objects by property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
exports.sortArrayByProperty = (array, property, direction = "asc") => {
  if (!array || !Array.isArray(array)) return [];

  const sortMultiplier = direction.toLowerCase() === "desc" ? -1 : 1;

  return [...array].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return (
        sortMultiplier *
        valueA.localeCompare(valueB, "fr", { sensitivity: "base" })
      );
    }

    if (valueA < valueB) return -1 * sortMultiplier;
    if (valueA > valueB) return 1 * sortMultiplier;
    return 0;
  });
};

/**
 * Calculate age from date of birth
 * @param {string|Date} birthDate - Date of birth
 * @returns {number} Age in years
 */
exports.calculateAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Convert object keys from camelCase to snake_case
 * @param {Object} obj - Object to convert
 * @returns {Object} Converted object
 */
exports.camelToSnake = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;

  const result = {};

  Object.keys(obj).forEach((key) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[snakeKey] = obj[key];
  });

  return result;
};

/**
 * Convert object keys from snake_case to camelCase
 * @param {Object} obj - Object to convert
 * @returns {Object} Converted object
 */
exports.snakeToCamel = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;

  const result = {};

  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    // Recursively convert nested objects
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      result[camelKey] = exports.snakeToCamel(obj[key]);
    } else if (Array.isArray(obj[key])) {
      // Convert objects in arrays
      result[camelKey] = obj[key].map((item) =>
        typeof item === "object" && item !== null
          ? exports.snakeToCamel(item)
          : item
      );
    } else {
      result[camelKey] = obj[key];
    }
  });

  return result;
};
