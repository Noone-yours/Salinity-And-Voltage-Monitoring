const register = useCallback(async (macAddress, userDeviceName, userInfo) => {
  setLoading(true);
  setError(null);

  try {
    // 1. Destructure and Normalize input data
    const { 
      firstName, 
      middleName = "", 
      lastName, 
      email, 
      mobile, 
      barangay, 
      street 
    } = userInfo;

    const normalizedEmail = email.toLowerCase().trim();
    const cleanFirstName = firstName.trim();
    const cleanMiddleName = middleName.trim();
    const cleanLastName = lastName.trim();

    // 2. FETCH the existing device record (To see the default name from ESP32)
    const deviceRef = doc(db, 'devices', macAddress);
    const deviceSnap = await getDoc(deviceRef);

    if (!deviceSnap.exists()) {
      throw new Error("This MAC Address is not recognized by the system.");
    }

    const deviceData = deviceSnap.data();

    // Safety: Ensure it's not already owned
    if (deviceData.ownerId) {
       throw new Error("This device is already registered to another user.");
    }

    // 3. LOGIC: Use User's Name OR Fallback to ESP32's Default Name
    // If the user didn't type a name, we use what the ESP32 sent (deviceData.deviceName)
    const finalDeviceName = userDeviceName?.trim() || deviceData.deviceName || "Unnamed Device";

    // 4. CHECK for existing Owner profile
    const ownersRef = collection(db, 'owners');
    const q = query(ownersRef, where("email", "==", normalizedEmail));
    const ownerQuerySnap = await getDocs(q);

    let ownerId;
    if (!ownerQuerySnap.empty) {
      ownerId = ownerQuerySnap.docs[0].id;
    } else {
      ownerId = `ID-${Date.now()}`;
    }

    // 5. EXECUTE the link (Atomic Update)
    const ownerRef = doc(db, 'owners', ownerId);

    

    await Promise.all([
      // Table: owners
      setDoc(ownerRef, {
        ownerId,
        email: normalizedEmail,
        firstName: cleanFirstName,
        middleName: cleanMiddleName,
        lastName: cleanLastName,
        fullName: `${cleanFirstName} ${cleanMiddleName ? cleanMiddleName + ' ' : ''}${cleanLastName}`,
        mobile: mobile.trim(),
        address: { 
          barangay: barangay.trim(), 
          street: street.trim() 
        },
        updatedAt: serverTimestamp()
      }, { merge: true }),

      // Table: devices
      setDoc(deviceRef, {
        deviceName: finalDeviceName, // This is either the User Name or the DEVICE-XXXX name
        ownerId: ownerId,
        registeredAt: serverTimestamp(),
        status: 'active',
        isConfigured: true // Useful flag to distinguish from warehouse stock
      }, { merge: true })
    ]);

    return { success: true, ownerId };

  } catch (err) {
    setError(err.message);
    return { success: false };
  } finally {
    setLoading(false);
  }
}, []);