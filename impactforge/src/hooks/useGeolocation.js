import { useState, useCallback } from 'react';

/**
 * Custom React hook for accessing the browser's Geolocation API.
 *
 * Provides a simple interface to request the user's current position,
 * with built-in loading and error state management.
 *
 * @returns {{
 *   coords: { lat: number, lng: number } | null,
 *   loading: boolean,
 *   error: string | null,
 *   supported: boolean,
 *   requestLocation: () => void
 * }} Geolocation state and a function to trigger the location request.
 *
 * @example
 * const { coords, loading, error, supported, requestLocation } = useGeolocation();
 *
 * useEffect(() => {
 *   if (coords) {
 *     console.log(`User is at ${coords.lat}, ${coords.lng}`);
 *   }
 * }, [coords]);
 */
export function useGeolocation() {
  const supported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Maps a GeolocationPositionError code to a human-readable message.
   * @param {GeolocationPositionError} err
   * @returns {string}
   */
  const formatError = (err) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Location access denied. Please allow location permissions in your browser settings.';
      case err.POSITION_UNAVAILABLE:
        return 'Location information is currently unavailable. Please try again later.';
      case err.TIMEOUT:
        return 'Location request timed out. Please check your connection and try again.';
      default:
        return 'An unknown error occurred while fetching your location.';
    }
  };

  /**
   * Triggers a geolocation request. Safe to call multiple times —
   * each call resets loading / error state before fetching.
   */
  const requestLocation = useCallback(() => {
    if (!supported) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(formatError(err));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // cache position for 1 minute
      }
    );
  }, [supported]);

  return { coords, loading, error, supported, requestLocation };
}
