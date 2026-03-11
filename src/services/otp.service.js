import { db } from "../config/firebase";
import { 
  doc, 
  getDoc, 
  runTransaction, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
// IMPORT your email delivery function
import { sendOTPEmail } from "./email.service";

const COLLECTIONS = Object.freeze({
  USERS: "users",
  OTPS: "otps" 
});

const LIMITS = Object.freeze({
  RATE_LIMIT_MS: 60000,
  EXPIRY_MS: 300000,
  MAX_ATTEMPTS: 5
});

/**
 * REQUEST PASSWORD RESET OTP
 * Now fully integrated with Database Integrity Checks and EmailJS.
 */
export const requestPasswordResetOTP = async (typedEmail, userId) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const otpRef = doc(db, COLLECTIONS.OTPS, userId);

  try {
    // 1. DATABASE INTEGRITY CHECK (The Guard)
    const userSnap = await getDoc(userRef);

    // OWASP: Silent return if user doesn't exist
    if (!userSnap.exists()) {
      console.warn(`Enumeration attempt blocked: ${userId}`);
      return { success: true }; 
    }

    // 2. EMAIL VALIDATION: Ensure the input matches the DB record
    const userData = userSnap.data();
    if (userData.email.toLowerCase() !== typedEmail.toLowerCase().trim()) {
      console.warn(`Email mismatch for ID: ${userId}`);
      return { success: true };
    }

    // This variable will hold the code generated inside the transaction 
    // so we can use it for the email later.
    let generatedCode = "";

    // 3. ATOMIC TRANSACTION
    await runTransaction(db, async (transaction) => {
      const otpDoc = await transaction.get(otpRef);

      if (otpDoc.exists()) {
        const data = otpDoc.data();
        const createdAt = data.createdAt 
          ? data.createdAt.toMillis() 
          : Date.now() - (LIMITS.RATE_LIMIT_MS + 1000);

        if (Date.now() - createdAt < LIMITS.RATE_LIMIT_MS) {
          const remaining = Math.ceil((LIMITS.RATE_LIMIT_MS - (Date.now() - createdAt)) / 1000);
          throw new Error(`Please wait ${remaining}s before requesting again.`);
        }
      }

      // SECURE GENERATION
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const otpCode = (array[0] % 900000 + 100000).toString();
      generatedCode = otpCode; // Store for email function

      transaction.set(otpRef, {
        userId,
        email: userData.email, // Use DB verified email
        code: otpCode,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + LIMITS.EXPIRY_MS)),
        createdAt: serverTimestamp(),
        attempts: 0,
        type: "password_reset"
      });
    });

    // 4. DELIVERY: Send email ONLY if transaction succeeded
    // We use userData.email (the Source of Truth)
    await sendOTPEmail(userData.email, generatedCode);

    return { success: true };
  } catch (error) {
    console.error("OTP Request Error:", error.message);
    throw error;
  }
};

/**
 * VERIFY PASSWORD RESET OTP
 */
export const verifyResetOTP = async (userId, submittedCode) => {
  const otpRef = doc(db, COLLECTIONS.OTPS, userId);

  try {
    return await runTransaction(db, async (transaction) => {
      const otpSnap = await transaction.get(otpRef);

      if (!otpSnap.exists()) {
        throw new Error("No active reset request found.");
      }

      const data = otpSnap.data();

      if (Timestamp.now().toMillis() > data.expiresAt.toMillis()) {
        transaction.delete(otpRef);
        throw new Error("This code has expired.");
      }

      if (data.attempts >= (LIMITS.MAX_ATTEMPTS - 1) && data.code !== submittedCode) {
        transaction.delete(otpRef);
        throw new Error("Security lockout: Too many failed attempts.");
      }

      // In your current service file:
        if (data.code === submittedCode) {
        const verifiedEmail = data.email; // Capture email before deleting doc
        transaction.delete(otpRef);
        return { verified: true, email: verifiedEmail }; // Return email

      } else {
        const newAttempts = (data.attempts || 0) + 1;
        transaction.update(otpRef, { attempts: newAttempts });
        throw new Error(`Invalid code. ${LIMITS.MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    });
  } catch (error) {
    console.error("OTP Verification Error:", error.message);
    throw error;
  }
};