import { useState, useCallback } from 'react';
import { db } from '../services/firebaseConfig';
import { ref, get, update, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database';

export const useDeviceRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (macAddress, userDeviceName, userInfo) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Data Normalization
      const email = userInfo?.email;
      if (!email) throw new Error("User email is required for registration.");
      const normalizedEmail = email.toLowerCase().trim();

      // 2. Fetch Device Data & Safety Check
      const deviceRef = ref(db, `devices/${macAddress}`);
      const deviceSnap = await get(deviceRef);

      if (!deviceSnap.exists()) {
        throw new Error("Hardware ID not found in registry.");
      }

      const deviceData = deviceSnap.val();

      // Check if the device is already owned
      if (deviceData.ownerId) {
        throw new Error("This device is already registered to another account.");
      }

      // 3. Email Uniqueness Check (Server-Side Filtering)
      const ownersRef = ref(db, 'owners');
      const emailQuery = query(ownersRef, orderByChild('email'), equalTo(normalizedEmail));
      const ownerSnapshot = await get(emailQuery);

      let ownerId;
      let existingData = {};

      if (ownerSnapshot.exists()) {
        const entries = Object.entries(ownerSnapshot.val());
        ownerId = entries[0][0]; 
        existingData = entries[0][1];
      } else {
        ownerId = `user_${Date.now()}`;
      }

      const finalDeviceName = userDeviceName?.trim() || deviceData.deviceName || "Unnamed Node";

      // 4. ATOMIC UPDATE (Multi-Path)
      const updates = {};
      updates[`/devices/${macAddress}/ownerId`] = ownerId;
      updates[`/devices/${macAddress}/deviceName`] = finalDeviceName;
      updates[`/devices/${macAddress}/registeredAt`] = serverTimestamp();
      updates[`/devices/${macAddress}/isConfigured`] = true;

      updates[`/owners/${ownerId}`] = {
        ...existingData, 
        ...userInfo, 
        ownerId,
        email: normalizedEmail,
        updatedAt: serverTimestamp()
      };

      await update(ref(db), updates);

      return { success: true, ownerId };

    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
};