/**
 * Earth's mean radius in kilometres, used for Haversine distance calculations.
 * @constant {number}
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians.
 * @param {number} deg — angle in degrees
 * @returns {number} angle in radians
 */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula.
 *
 * @param {number} lat1 — latitude  of point A (degrees)
 * @param {number} lng1 — longitude of point A (degrees)
 * @param {number} lat2 — latitude  of point B (degrees)
 * @param {number} lng2 — longitude of point B (degrees)
 * @returns {number} Distance in kilometres
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Filters an array of items to only those within a given radius of the user's
 * coordinates, using the Haversine formula for accurate great-circle distance.
 *
 * Each item **must** contain numeric `lat` and `lng` properties.
 * Items missing valid coordinates are silently excluded from the result.
 *
 * @param {Array<{ lat: number, lng: number, [key: string]: any }>} items
 *   The full list of items to filter. Each item must have `lat` and `lng`.
 * @param {{ lat: number, lng: number }} userCoords
 *   The user's current position.
 * @param {number} [radiusKm=2]
 *   Maximum distance (in km) an item can be from the user to be included.
 * @returns {Array<{ lat: number, lng: number, distance: number, [key: string]: any }>}
 *   A new array of items within the radius, each augmented with a `distance`
 *   property (km, rounded to 2 decimals), sorted nearest-first.
 *
 * @example
 * const nearby = getNearbyItems(donations, { lat: 12.97, lng: 77.59 }, 5);
 * // => [{ id: 3, lat: 12.98, lng: 77.60, distance: 1.42, ... }, ...]
 */
export function getNearbyItems(items, userCoords, radiusKm = 2) {
  if (!Array.isArray(items) || !userCoords) {
    return [];
  }

  return items
    .map((item) => {
      // Skip items that don't carry valid coordinates
      if (
        item == null ||
        typeof item.lat !== 'number' ||
        typeof item.lng !== 'number'
      ) {
        return null;
      }

      const distance = haversineDistance(
        userCoords.lat,
        userCoords.lng,
        item.lat,
        item.lng
      );

      return { ...item, distance: Math.round(distance * 100) / 100 };
    })
    .filter((item) => item !== null && item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
