import { ref, onValue, query, limitToLast, orderByChild, startAt, limitToFirst } from "firebase/database";
import { db } from "./firebaseConfig";

/**
 * SERVICE: Subscribe to ALL devices (Fleet View)
 */
export const subscribeToAllDevices = (onUpdate) => {
  const devicesRef = ref(db, 'devices');
  return onValue(devicesRef, (snapshot) => {
    const data = snapshot.val() || {};
    onUpdate(data);
  }, (err) => console.error("🔥 Fleet Subscription Error:", err));
};

/**
 * SERVICE: Subscribe to a single device's LATEST data
 */
export const subscribeToDeviceLatest = (deviceId, onUpdate) => {
  if (!deviceId) return () => {}; 
  const latestRef = ref(db, `devices/${deviceId}/latest`); 
  
  return onValue(latestRef, (snapshot) => {
    const data = snapshot.val();
    onUpdate(data ? {
      tds_ppm: data.tds_ppm ?? 0,
      water_temp: data.water_temp ?? 0,
      timestamp: data.timestamp || Date.now()
    } : {});
  }, (err) => console.error(`🔥 Latest Data Error:`, err));
};

/**
 * SERVICE: Subscribe to device logs for CHARTS
 * UPDATED: Now supports startDate for historical lookup
 */
export const subscribeToDeviceLogs = (deviceId, limit = 50, onUpdate, startDate = null) => {
  if (!deviceId) return () => {};

  const logsRef = ref(db, `devices/${deviceId}/logs`);
  let logsQuery;

  if (startDate) {
    /**
     * HISTORICAL MODE:
     * 1. Order by the 'timestamp' key
     * 2. Start at the chosen millisecond timestamp
     * 3. Take the first X logs from that point forward
     */
    logsQuery = query(
      logsRef, 
      orderByChild('timestamp'), 
      startAt(startDate), 
      limitToFirst(limit)
    );
  } else {
    /**
     * LIVE MODE:
     * Standard behavior - just get the most recent logs
     */
    logsQuery = query(logsRef, limitToLast(limit));
  }

  return onValue(logsQuery, (snapshot) => {
    const data = snapshot.val() || {};
    
    const logsArray = Object.entries(data)
      .map(([id, values]) => ({ 
        id, 
        tds_ppm: Number(values.tds_ppm) || 0,
        water_temp: Number(values.water_temp) || 0,
        timestamp: values.timestamp || Date.now(),
        __normalizedTs: values.timestamp || Date.now()
      }))
      // Always sort so the chart reads left-to-right (Chronological)
      .sort((a, b) => a.timestamp - b.timestamp);

    onUpdate(logsArray);
  }, (err) => console.error(`Logs Error:`, err));
};