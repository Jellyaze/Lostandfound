// Olongapo City coordinates
export const OLONGAPO_CENTER = {
  latitude: 14.8294,
  longitude: 120.2828,
};

export const OLONGAPO_BOUNDS = {
  north: 14.8800,
  south: 14.7800,
  east: 120.3300,
  west: 120.2300,
};

export const isWithinOlongapo = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= OLONGAPO_BOUNDS.south &&
    latitude <= OLONGAPO_BOUNDS.north &&
    longitude >= OLONGAPO_BOUNDS.west &&
    longitude <= OLONGAPO_BOUNDS.east
  );
};

export const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};