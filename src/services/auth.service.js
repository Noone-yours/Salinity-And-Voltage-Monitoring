import { auth, db, FIREBASE_CONFIG } from "../firebaseConfig";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  setPersistence, 
  browserSessionPersistence,
  getAuth,
  updatePassword 
} from "firebase/auth";

import { generateDefaultPassword } from "../utils/passwordGenerator";
import { sendOnboardingEmail } from "./email.service"

/**
 * ERROR MAPPER: Centralized for all auth actions.
 */
const AUTH_ERROR_MESSAGES = Object.freeze({
  "auth/email-already-in-use": "This email is already registered in the system.",
  "auth/invalid-email": "The email address format is not valid.",
  "auth/weak-password": "Security Check: Password must be at least 8 characters and include numbers/symbols.",
  "auth/user-not-found": "Invalid email or password. Please try again.", 
  "auth/wrong-password": "Invalid email or password. Please try again.", 
  "auth/invalid-credential": "Invalid email or password. Please try again.", 
  "auth/missing-credentials": "Email and password are required.",
  "auth/requires-recent-login": "Security timeout. Please re-verify your identity again.",
  "auth/network-request-failed": "Connection Error: Please check the facility's internet stability.",
  "db/permission-denied": "Security Check: You do not have permission to access this data.",
  "db/unavailable": "The database is currently offline. Please check your connection.",
  "default": "An unexpected authentication error occurred."
});

export const validateEmail = (email) => {
  // Mas matibay kaysa sa .includes("@"). Sinisiguro nito ang format na: user@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    throw new Error(AUTH_ERROR_MESSAGES["auth/invalid-email"] || "A valid email is required.");
  }
};

export const validatePassword = (password) => {
  // 1. LENGTH CHECK (Minimum 8 characters)
  if (!password || password.length < 8) {
    throw new Error(AUTH_ERROR_MESSAGES["auth/weak-password"] || "Security Check: Password must be at least 8 characters.");
  }

  const complexityRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
  
  if (!complexityRegex.test(password)) {
    // Maaari mong gawing mas descriptive ang message sa loob ng AUTH_ERROR_MESSAGES object
    throw new Error(AUTH_ERROR_MESSAGES["auth/weak-password"] || "Security Check: Password must include at least one number and one special character.");
  }
};

/**
 * FINALIZED: Updates password for the current user.
 */

export const PasswordReset = async (newPassword) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Session expired. Please log in again.");
  }

  try {
    // Local check para sa password complexity
    validatePassword(newPassword); 
    
    // Baguhin ang password sa Firebase Authentication
    await updatePassword(user, newPassword);

    //I-update ang flags gamit ang destructured UID
    const { uid } = user; 
    const updates = {};
    
    updates[`/accounts/${uid}/requiresPasswordChange`] = false;
    updates[`/accounts/${uid}/updatedAt`] = serverTimestamp();

    await update(ref(db), updates);

    // Alisin ang pansamantalang security flags sa browser storage
    sessionStorage.removeItem('is_verified');
    
    return { success: true };

  } catch (error) {
    throw new Error("Password update failed. For security reasons, please try logging out and in again.");
  }
};

/**
 * Registers a new user account.
 */

export const registerUserAccount = async (userData) => {
  const { email, firstName, role } = userData;
  let tempApp = null;

  try {
    validateEmail(email);

    const autoPassword = generateDefaultPassword();

    const appName = `TempApp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    tempApp = initializeApp(FIREBASE_CONFIG, appName);
    const tempAuth = getAuth(tempApp);

    // 5. ATOMIC ACCOUNT CREATION
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, autoPassword);
    const uid = userCredential.user.uid;

    // 6. SECURE CREDENTIAL DELIVERY (EmailJS)
    let emailSent = false;
    try {
      await sendOnboardingEmail({ email, firstName, role }, autoPassword);
      emailSent = true;
    } catch (emailError) {
      emailSent = false;
    }

    //Memory Management
    await deleteApp(tempApp);
    tempApp = null;

    //MINIMAL DATA RETURN
    return {
      uid,
      tempPassword: autoPassword,
      emailSent
    };

  } catch (error) {
    // EMERGENCY CLEANUP
    if (tempApp) {
      try { await deleteApp(tempApp); } catch (e) { /* silent cleanup fail */ }
    }

    // ERROR MASKING
    const message = AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default;
    throw new Error(message);
  }
};

/**
 * Logs in a user.
 */
export const loginUser = async (email, password) => {
  try {
    //SANITIZATION
    const cleanEmail = email?.toLowerCase().trim();
    
    if (!cleanEmail || !password) {
      throw { code: "auth/missing-credentials" }; 
    }

    //PERSISTENCE
    await setPersistence(auth, browserSessionPersistence);
    
    //AUTHENTICATION
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    
    //SESSION FLAG
    sessionStorage.setItem("is_verified", "true");
    
    return userCredential;

  } catch (error) {
    sessionStorage.removeItem("is_verified");
    
    // SECURITY: Mapping specific errors to generic message to prevent account sniffing
    const secureErrors = ["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"];
    const errorCode = secureErrors.includes(error.code) ? "auth/invalid-credential" : error.code;

    const message = AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default;
    throw new Error(message);
  }
};

/**
 * SECURE LOGOUT SERVICE
 */
export const logoutUser = async () => {
  try {
    //CLEAR STORAGE
    sessionStorage.clear();

    //FIREBASE SIGNOUT
    await signOut(auth);

    //HARD REDIRECT
    window.location.href = "/login";
    
    return { success: true };
  } catch (error) {
    throw new Error("Security Check: Failed to securely terminate the session.");
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (typeof callback !== "function") {
    throw new Error("Auth Callback must be a function.");
  }
  return onAuthStateChanged(auth, callback);
};

export const getFullUserData = async (uid) => {
  if (!uid) throw new Error(AUTH_ERROR_MESSAGES["auth/user-not-found"] || "User ID is required.");

  try {
    const [userSnap, roleSnap, accountSnap] = await Promise.all([
      get(ref(db, `users/${uid}`)),
      get(ref(db, `roles/${uid}`)),
      get(ref(db, `accounts/${uid}`))
    ]);

    // 3. Document Existence Check (Crucial for Production)
    if (!userSnap.exists()) {
      // Fallback: Default to lowest privilege if profile is missing
      return { 
        role: "viewer", 
        status: "unprovisioned",
        requiresPasswordChange: false 
      };
    }

    const userData = userSnap.val();
    return {
      profile: userData,
      // Fallback to 'user' if role node is missing
      role: roleSnap.exists() ? roleSnap.val().role : 'user',
      requiresPasswordChange: accountSnap.exists() 
        ? accountSnap.val().requiresPasswordChange 
        : false,
        isPrivate: userData.isPrivate || false
    };

  } catch (error) {
    const message = AUTH_ERROR_MESSAGES[error.code] || "Failed to synchronize user profile.";
    throw new Error(message);
  }
};