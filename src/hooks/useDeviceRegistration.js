import { useCallback } from 'react';
import { rtdb } from '../firebase';
import { ref, get, update, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database';

const register = useCallback(async (macAddress, userDeviceName, userInfo) => {
  setLoading(true);
  setError(null);

  try {
    // 1. Data Normalization
    const { email } = userInfo;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Fetch Device Data & Safety Check (Race Condition Prevention)
    const deviceRef = ref(rtdb, `devices/${macAddress}`);
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
    const ownersRef = ref(rtdb, 'owners');
    const emailQuery = query(ownersRef, orderByChild('email'), equalTo(normalizedEmail));
    const ownerSnapshot = await get(emailQuery);

    let ownerId;
    let existingData = {};

    if (ownerSnapshot.exists()) {
      // Logic: If user exists, link the new device to their existing ID
      const entries = Object.entries(ownerSnapshot.val());
      ownerId = entries[0][0]; // The unique user key
      existingData = entries[0][1];
    } else {
      // Logic: New user profile
      ownerId = `user_${Date.now()}`;
    }

    // 4. Logic: Use custom nickname or fallback to hardware default
    const finalDeviceName = userDeviceName?.trim() || deviceData.deviceName || "Unnamed Node";

    // 5. ATOMIC UPDATE (Multi-Path)
    // 
    const updates = {};

    // Update Device Tree
    updates[`/devices/${macAddress}/ownerId`] = ownerId;
    updates[`/devices/${macAddress}/deviceName`] = finalDeviceName;
    updates[`/devices/${macAddress}/registeredAt`] = serverTimestamp();
    updates[`/devices/${macAddress}/isConfigured`] = true;

    // Update/Merge Owner Tree
    updates[`/owners/${ownerId}`] = {
      ...existingData, 
      ...userInfo, // Overwrites fields with latest info from form
      ownerId,
      email: normalizedEmail,
      updatedAt: serverTimestamp()
    };

    // Execute all updates simultaneously (Safety check: all or nothing)
    await update(ref(rtdb), updates);

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