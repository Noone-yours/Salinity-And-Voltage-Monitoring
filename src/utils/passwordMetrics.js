/**
 * PASSWORD METRICS UTILITY
 * Synchronized with auth.service.js security requirements.
 * Total Score: 100
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (!password) return 0;
  
  // RULE 1: LENGTH (REQUIRED) - 20 pts
  if (password.length >= 8) score += 20;
  
  // RULE 2: NUMERIC (REQUIRED) - 20 pts
  if (/[0-9]/.test(password)) score += 20;
  
  // RULE 3: SPECIAL CHAR (REQUIRED) - 20 pts
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  
  // RULE 4: LOWERCASE (BONUS) - 20 pts
  if (/[a-z]/.test(password)) score += 20; 
  
  // RULE 5: UPPERCASE (BONUS) - 20 pts
  if (/[A-Z]/.test(password)) score += 20;
  
  return score;
};

/**
 * HELPER: Checks if the password meets the ABSOLUTE MINIMUM 
 * defined in auth.service.js
 */
export const meetsMinRequirements = (password) => {
  const complexityRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return complexityRegex.test(password);
};