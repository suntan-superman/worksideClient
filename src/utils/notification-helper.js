import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  try {
    // Check if physical device with fallback
    const isDevice = Device?.isDevice ?? false;
    if (!isDevice) {
      console.log('Push notifications are not supported in emulator/simulator');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If no existing permission, request it
    if (existingStatus !== 'granted') {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return null;
      }
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      // Get Expo push token
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      if (!token?.data) {
        throw new Error('Token data is undefined');
      }

      console.log('Push Token:', token.data);

      // Special handling for Android
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            enableVibrate: true,
            enableLights: true,
          });
        } catch (error) {
          console.error('Error setting up Android notification channel:', error);
          // Don't return null here as the token is still valid
        }
      }

      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    if (error.message.includes('ExpoDevice')) {
      console.log('Device module not available, assuming physical device');
      // Continue with token registration
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          return null;
        }

        token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        return token.data;
      } catch (innerError) {
        console.error('Error getting push token:', innerError);
        return null;
      }
    }
    return null;
  }
};

export const addNotificationResponseReceivedListener = (callback) => {
  try {
    return Notifications.addNotificationResponseReceivedListener(response => {
      try {
        callback(response);
      } catch (error) {
        console.error('Error in notification response callback:', error);
      }
    });
  } catch (error) {
    console.error('Error adding notification response listener:', error);
    return null;
  }
};

export const addNotificationReceivedListener = (callback) => {
  try {
    return Notifications.addNotificationReceivedListener(notification => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification received callback:', error);
      }
    });
  } catch (error) {
    console.error('Error adding notification received listener:', error);
    return null;
  }
}; 