import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  city?: string;
}

export const LocationService = {
  async getDeviceLocation(): Promise<LocationCoords | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Foreground location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (reverse && reverse.length > 0) {
          coords.city = reverse[0].city || reverse[0].district || reverse[0].region || 'Current Location';
        }
      } catch {
        coords.city = 'GPS Location';
      }

      return coords;
    } catch (e) {
      console.error('Failed to get location:', e);
      return null;
    }
  },
};
