import { db } from "../firebaseConfig";
import { ref, update, serverTimestamp } from "firebase/database";

const DB_ERRORS = Object.freeze({
  MISSING_UID: "Safety Check: User ID is required to provision data.",
  MISSING_DATA: "Safety Check: Form data is incomplete.",
  PROVISION_FAILED: "Server Error: Could not initialize user tables.",
  FETCH_FAILED: "Server Error: Could not retrieve user profile."
});

const superAdmin = import.meta.env.VITE_SUPER_ADMIN_EMAIL;

const sanitizeUserData = (data) =>{
    const inputEmail = data.email?.toLowerCase().trim();
  
    const isSuper = data.role === "superAdmin" && inputEmail === superAdmin;
    
    if (isSuper) {
    return {
      email: superAdmin,
      role: "superAdmin",
      title: "Creator",
      isPrivate: true
    };
  }

  return {
    firstName: data.firstName?.trim() || "",
    middleName: data.middleName?.trim() || "",
    lastName: data.lastName?.trim() || "",
    suffix: data.suffix?.trim() || "",
    age: parseInt(data.age) || 0,
    gender: data.gender || "Not Specified",
    email: data.email?.toLowerCase().trim() || "",
    userName: data.userName?.trim() || `user_${Date.now()}`,
    mobileNum: data.mobileNum || "N/A",
    address: {
        street: data.street || "Unset",
        baranggay: data.baranggay || "Unset",
        cityProvince: data.cityProvince || "Unset",
        region: data.region || "Unset",
        zipCode: data.zipCode || ""
    }
};
}
/**
 * PROVISIONING: Now includes the 'requiresPasswordChange' flag.
 */
export const provisionUserSystem = async (uid, formData) => {
  if (!uid) throw new Error(DB_ERRORS.MISSING_UID);
  if (!formData) throw new Error(DB_ERRORS.MISSING_DATA);

  const isSuperAdmin = formData.role === "superAdmin";
  const clean = sanitizeUserData(formData);
  const updates = {};

  updates[`/users/${uid}`] = {
    ...clean,
    role: formData.role || "user",
    isPrivate: isSuperAdmin, // <--- This makes the Creator invisible
    updatedAt: serverTimestamp()
  };

  // ACCOUNTS NODE: Added security flag for default passwords
  updates[`/accounts/${uid}`] = {
    userId: uid,
    userName: clean.userName,
    status: "active",
    requiresPasswordChange: isSuperAdmin ? false : true, 
    isPrivate: isSuperAdmin,
    createdAt: serverTimestamp()
  };

  updates[`/roles/${uid}`] = {
    role: formData.role || "user",
    isPrivate: isSuperAdmin
  };

  try {
    await update(ref(db), updates);
    return { success: true };
  } catch (error) {
    console.error("Provisioning Error:", error);
    throw new Error(DB_ERRORS.PROVISION_FAILED);
  }
};


