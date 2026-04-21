/**
 * Geolocation module for Impact Forge.
 *
 * Re-exports the public API so teammates can do:
 *
 *   import { NearbyToggle, useGeolocation, getNearbyItems } from '../geolocation';
 */

export { default as NearbyToggle } from './components/NearbyToggle';
export { useGeolocation } from './hooks/useGeolocation';
export { getNearbyItems } from './utils/getNearbyItems';
