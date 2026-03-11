import emailjs from '@emailjs/browser';

//CONFIGURATION
const CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  // Using specific IDs for different business logic
  ONBOARDING_TEMPLATE: import.meta.env.VITE_EMAILJS_ONBOARDING_TEMPLATE_ID,
  OTP_TEMPLATE: import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID,
  COMPANY_EMAIL: import.meta.env.VITE_COMPANY_EMAIL
};

// SEND OTP EMAIL
export const sendOTPEmail = async (email, otpCode) => {
  // SAFETY CHECK
  if (!email || !otpCode) {
    throw new Error("Validation Error: Missing recipient or reset code.");
  }

  // Kinakalkula ang expiry time (15 minutes mula ngayon)
  const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const templateParams = {
    to_email: email,
    passcode: otpCode,       
    time: expiryTime,         
    company_name: "SmartAqua" 
  };

  try {
    const { SERVICE_ID, OTP_TEMPLATE, PUBLIC_KEY } = CONFIG;
    await emailjs.send(SERVICE_ID, OTP_TEMPLATE, templateParams, PUBLIC_KEY);

    
    return { success: true };
  } catch (error) {
    // I-mask ang error para sa security
    throw new Error("Failed to deliver the security code. Please try again later.");
  }
};

//SEND ONBOARDING EMAIL
export const sendOnboardingEmail = async (userData, autoPassword) => {
  // SAFETY CHECK
  if (!userData?.email || !autoPassword) {
    throw new Error("Validation Error: Missing user data or generated password.");
  }

  const templateParams = {
    to_email: userData.email,
    firstName: userData.firstName,
    userName: userData.userName || "N/A",
    defaultPassword: autoPassword,
    system_role: userData.role || "Staff",
    website_link: "https://smartaqua-monitoring.web.app",
    company_email: COMPANY_EMAIL
  };

  try {
    const { SERVICE_ID, ONBOARDING_TEMPLATE, PUBLIC_KEY } = CONFIG;
    
    await emailjs.send(
      SERVICE_ID, 
      ONBOARDING_TEMPLATE, 
      templateParams, 
      PUBLIC_KEY
    );

    return { success: true, emailSent: true };
  } catch (error) {
    return { success: true, emailSent: false };
  }
};