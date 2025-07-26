/**
 * Get the color class/variable name for a stat value based on rarity tiers
 * @param {number|string} statValue - The stat value to evaluate
 * @returns {string} CSS variable name for the color
 */
export function getStatColor(statValue) {
  const value = Number(statValue);
  
  // Handle invalid values
  if (isNaN(value) || statValue === 'N/A') {
    return 'var(--color-common-alt)';
  }
  
  // Apply color tiers based on stat ranges
  if (value <= 54) {
    return 'var(--color-common)';
  } else if (value >= 55 && value <= 64) {
    return 'var(--color-limited)';
  } else if (value >= 65 && value <= 74) {
    return 'var(--color-uncommon)';
  } else if (value >= 75 && value <= 84) {
    return 'var(--color-rare)';
  } else if (value >= 85 && value <= 94) {
    return 'var(--color-legendary)';
  } else if (value >= 95) {
    return 'var(--color-ultimate)';
  }
  
  // Fallback
  return 'var(--color-common)';
}

/**
 * Get both text and background colors for a stat value
 * @param {number|string} statValue - The stat value to evaluate
 * @returns {Object} Object with textColor and backgroundColor properties
 */
export function getStatColors(statValue) {
  const value = Number(statValue);
  
  // Handle invalid values
  if (isNaN(value) || statValue === 'N/A') {
    return {
      textColor: 'var(--color-common-alt)',
      backgroundColor: 'rgba(159, 159, 159, 0.15)'
    };
  }
  
  // Apply color tiers based on stat ranges
  if (value <= 54) {
    return {
      textColor: 'var(--color-common-alt)',
      backgroundColor: 'rgba(54, 54, 54, 0.15)'
    };
  } else if (value >= 55 && value <= 64) {
    return {
      textColor: 'var(--color-limited)',
      backgroundColor: 'rgba(236, 209, 127, 0.15)'
    };
  } else if (value >= 65 && value <= 74) {
    return {
      textColor: 'var(--color-uncommon)',
      backgroundColor: 'rgba(113, 255, 48, 0.15)'
    };
  } else if (value >= 75 && value <= 84) {
    return {
      textColor: 'var(--color-rare)',
      backgroundColor: 'rgba(0, 71, 255, 0.15)'
    };
  } else if (value >= 85 && value <= 94) {
    return {
      textColor: 'var(--color-legendary)',
      backgroundColor: 'rgba(250, 83, 255, 0.15)'
    };
  } else if (value >= 95) {
    return {
      textColor: 'var(--color-ultimate)',
      backgroundColor: 'rgba(77, 159, 152, 0.15)'
    };
  }
  
  // Fallback
  return {
    textColor: 'var(--color-common-alt)',
    backgroundColor: 'rgba(54, 54, 54, 0.15)'
  };
}

/**
 * Get the rarity tier name for a stat value
 * @param {number|string} statValue - The stat value to evaluate
 * @returns {string} Rarity tier name
 */
export function getStatTier(statValue) {
  const value = Number(statValue);
  
  if (isNaN(value) || statValue === 'N/A') {
    return 'unknown';
  }
  
  if (value <= 54) {
    return 'common';
  } else if (value >= 55 && value <= 64) {
    return 'limited';
  } else if (value >= 65 && value <= 74) {
    return 'uncommon';
  } else if (value >= 75 && value <= 84) {
    return 'rare';
  } else if (value >= 85 && value <= 94) {
    return 'legendary';
  } else if (value >= 95) {
    return 'ultimate';
  }
  
  return 'common';
}