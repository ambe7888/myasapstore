import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerDeviceToken, unregisterDeviceToken } from '@/api/deviceTokens';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permission, obtains this device's Expo push token, and registers
 * it with the backend so `OrderCreated` triggers a push to this device.
 *
 * Requires the project to be linked to EAS (`eas init`) so a projectId
 * exists in app config — without it we skip silently rather than crash.
 * Also requires a development build on Android: Expo Go dropped support
 * for remote push notifications there since SDK 53.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Commandes',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('No EAS projectId configured — run `eas init` to enable push notifications.');
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerDeviceToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
    return token;
  } catch (e) {
    console.warn('Failed to register for push notifications:', e);
    return null;
  }
}

export async function unregisterCurrentDeviceToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await unregisterDeviceToken(token);
  } catch {
    // Best-effort — nothing to clean up if this fails (e.g. no permission).
  }
}
