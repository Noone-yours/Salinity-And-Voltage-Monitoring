import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useAvailableDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted components

    // Logic: Fetch only devices that don't have an owner yet
    const q = query(collection(db, "devices"), where("ownerId", "==", null));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return; // Stop if the user navigated away

        try {
        const deviceList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDevices(deviceList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch devices.");
        setLoading(false);
      }
    }, (err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
    });

    return () => {
      isMounted = false; // Set flag to false
      unsubscribe();     // Unsubscribe from Firebase
    };
    
  }, []);

  return { devices, loading, error };
};