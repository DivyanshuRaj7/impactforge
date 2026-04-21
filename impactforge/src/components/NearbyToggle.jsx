import React, { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyItems } from '../utils/getNearbyItems';
import './NearbyToggle.css';

/**
 * Pin / location icon (inline SVG so we don't need an icon library).
 */
const PinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/**
 * Spinner icon displayed while the geolocation request is in flight.
 */
const SpinnerIcon = () => (
  <svg
    className="nearby-toggle__spinner"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/**
 * `NearbyToggle` — a toggle button that filters a list of geo-tagged items
 * to only those within a configurable radius of the user's current location.
 *
 * @param {Object}   props
 * @param {Array<{ lat: number, lng: number, [key: string]: any }>} props.items
 *   The full list of items to filter. Each must include `lat` and `lng`.
 * @param {(items: Array) => void} props.onFilter
 *   Callback invoked with the filtered (or full) items array whenever the
 *   toggle state changes or new location data arrives.
 * @param {number}   [props.radiusKm=2]
 *   Maximum distance in kilometres to include items.
 *
 * @example
 * <NearbyToggle
 *   items={donations}
 *   onFilter={setFilteredDonations}
 *   radiusKm={5}
 * />
 */
export default function NearbyToggle({ items = [], onFilter, radiusKm = 2 }) {
  const [active, setActive] = useState(false);
  const { coords, loading, error, supported, requestLocation } =
    useGeolocation();

  // ---- Filtering logic ------------------------------------------------
  // Runs whenever the toggle is active AND we receive new coords / items.
  useEffect(() => {
    if (!active) return;

    if (coords) {
      const filtered = getNearbyItems(items, coords, radiusKm);
      onFilter(filtered);
    }
  }, [active, coords, items, radiusKm, onFilter]);

  // ---- Toggle handler --------------------------------------------------
  const handleToggle = useCallback(() => {
    if (active) {
      // Turning OFF → reset to full list
      setActive(false);
      onFilter(items);
    } else {
      // Turning ON → request location (results handled by the effect above)
      setActive(true);
      requestLocation();
    }
  }, [active, items, onFilter, requestLocation]);

  // ---- Determine button label ------------------------------------------
  let label;
  if (loading && active) {
    label = 'Getting location…';
  } else if (active) {
    label = `Nearby (${radiusKm} km)`;
  } else {
    label = `Show Nearby (${radiusKm} km)`;
  }

  // ---- Build CSS class list --------------------------------------------
  const btnClasses = [
    'nearby-toggle__btn',
    active && 'nearby-toggle__btn--active',
    loading && active && 'nearby-toggle__btn--loading',
  ]
    .filter(Boolean)
    .join(' ');

  // ---- Feedback message ------------------------------------------------
  let message = null;

  if (active && loading) {
    message = (
      <span className="nearby-toggle__message nearby-toggle__message--loading">
        📡 Fetching your location…
      </span>
    );
  } else if (active && error) {
    message = (
      <span className="nearby-toggle__message nearby-toggle__message--error">
        ⚠️ {error}
      </span>
    );
  } else if (active && coords && !loading) {
    const count = getNearbyItems(items, coords, radiusKm).length;
    message = (
      <span className="nearby-toggle__message nearby-toggle__message--success">
        📍 {count} {count === 1 ? 'item' : 'items'} found within {radiusKm} km
      </span>
    );
  }

  // ---- Render -----------------------------------------------------------
  return (
    <div className="nearby-toggle">
      <button
        type="button"
        className={btnClasses}
        onClick={handleToggle}
        disabled={loading && active}
        aria-pressed={active}
        title={
          !supported
            ? 'Geolocation is not supported in this browser'
            : undefined
        }
      >
        <span className="nearby-toggle__icon">
          {loading && active ? <SpinnerIcon /> : <PinIcon />}
        </span>
        {label}
      </button>

      {message}
    </div>
  );
}
