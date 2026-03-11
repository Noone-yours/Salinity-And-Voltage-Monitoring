export const generateDefaultPassword = () => {
  const prefix = "Aqua@";
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const specialChars = "!#$%&*";
  
  // 1. Create a buffer for 6 random 32-bit unsigned integers
  const array = new Uint32Array(6);
  
  // 2. Fill the array with cryptographically secure random numbers
  window.crypto.getRandomValues(array);
  
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    // Map the large random number to our charset length using modulo
    randomString += charset[array[i] % charset.length];
  }

  // 3. Generate one secure special character
  const specialArray = new Uint32Array(1);
  window.crypto.getRandomValues(specialArray);
  const randomSpecial = specialChars[specialArray[0] % specialChars.length];

  return `${prefix}${randomString}${randomSpecial}`;
};