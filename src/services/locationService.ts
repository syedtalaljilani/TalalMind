import { Linking, Platform } from "react-native";
import * as Location from "expo-location";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  city?: string;
}

export const LocationService = {
  async getPermissionStatus(): Promise<Location.PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (e) {
      console.warn("Failed to get location permission status", e);
      return Location.PermissionStatus.DENIED;
    }
  },

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (e) {
      console.warn("Failed to request location permission", e);
      return false;
    }
  },

  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      const status = await Location.getProviderStatusAsync();
      return status.locationServicesEnabled;
    } catch (e) {
      try {
        return await Location.hasServicesEnabledAsync();
      } catch {
        return false;
      }
    }
  },

  async requestLocationServices(): Promise<boolean> {
    try {
      if (await this.isLocationServicesEnabled()) {
        return true;
      }

      if (Platform.OS === "android") {
        await Location.enableNetworkProviderAsync();
        return await this.isLocationServicesEnabled();
      }

      return false;
    } catch (e) {
      console.warn("Failed to enable location services", e);
      return false;
    }
  },

  async openLocationSettings(): Promise<void> {
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
      } else {
        await Linking.openURL("App-prefs:LOCATION_SERVICES");
      }
    } catch (e) {
      console.warn("Failed to open location settings", e);
    }
  },

  async getDeviceLocation(): Promise<LocationCoords | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        console.warn("Foreground location permission not granted");
        return null;
      }

      const location = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        8000,
      );

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
          coords.city =
            reverse[0].city ||
            reverse[0].district ||
            reverse[0].region ||
            "Current Location";
        }
      } catch {
        coords.city = "GPS Location";
      }

      return coords;
    } catch (e) {
      console.error("Failed to get location:", e);
      return null;
    }
  },
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Location request timed out")),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
