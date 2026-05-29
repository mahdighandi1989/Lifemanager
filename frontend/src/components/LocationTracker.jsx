import { useEffect } from 'react';
import api from '../lib/api';

// LocationTracker (audit task 2165524b AC 6): every 5 minutes, read the
// browser's geolocation and POST it to /api/context/location so the
// recommendation engine has fresh location context. Renders nothing; mounted
// once in Layout so it runs on every protected page.
const FIVE_MIN_MS = 5 * 60 * 1000;

function LocationTracker() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return undefined;

    const send = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          api
            .post('/context/location', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy_m: pos.coords.accuracy,
            })
            .catch(() => {});
        },
        () => {}, // permission denied / unavailable — silently skip
        { maximumAge: FIVE_MIN_MS },
      );
    };

    send(); // initial ping on mount
    const id = setInterval(send, FIVE_MIN_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}

export default LocationTracker;
