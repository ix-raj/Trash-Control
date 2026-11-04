export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Failed to retrieve location.';
        if (error.code === 1) msg = 'Location access denied.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export const searchAddresses = async (query) => {
  if (!query.trim() || query.trim().length < 3) return [];
  const params = new URLSearchParams({
    q: `${query}, India`,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'in'
  });
  const response = await fetch(`${NOMINATIM_URL}/search?${params}`);
  if (!response.ok) throw new Error('Address search failed.');
  return response.json();
};

export const reverseGeocode = async (latitude, longitude) => {
  const params = new URLSearchParams({ lat: latitude, lon: longitude, format: 'jsonv2' });
  const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`);
  if (!response.ok) throw new Error('Reverse geocoding failed.');
  const data = await response.json();
  return data.display_name || '';
};
