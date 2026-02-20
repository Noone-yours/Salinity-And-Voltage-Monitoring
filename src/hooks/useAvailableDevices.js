import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig'; // Ensure this points to Realtime Database
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

/**
 * useAvailableDevices
 * Custom hook to discover "Fresh" hardware nodes ready for registration.
 */
export const useAvailableDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Server-Side Filtering Logic
    // Only fetch nodes where ownerId is explicitly null
    const devicesRef = ref(db, 'devices');
    const availableQuery = query(
      devicesRef, 
      orderByChild('ownerId'), 
      equalTo(null)
    );

    // 2. Real-time Subscription
    const unsubscribe = onValue(availableQuery, (snapshot) => {
      if (!isMounted) return;

      try {
        const data = snapshot.val();
        
        if (!data) {
          setDevices([]); 
        } else {
          // Transformation: Convert Firebase object-map to a clean UI Array
          const deviceList = Object.entries(data).map(([id, val]) => ({
            id, // This is the MAC address/Device ID
            ...val
          }));
          setDevices(deviceList);
        }
        setError(null);
      } catch (err) {
        console.error("RTDB Data Processing Error:", err);
        setError("Data link established, but failed to parse hardware list.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      // Security/Network Error Handling
      if (!isMounted) return;
      setError(err.message);
      setLoading(false);
    });

    // 3. Cleanup: Prevents memory leaks and state updates on unmounted components
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { devices, loading, error };
};