import axios from 'axios';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Sends push notifications to multiple recipients
 * @param {Array<string>} emailList - List of recipient email addresses
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} apiURL - Base API URL
 * @returns {Promise<void>}
 */
export const sendRequestNotifications = async (emailList, title, message, apiURL) => {
  if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
    console.log('No recipients provided for push notifications');
    return;
  }

  try {
    // Process each email recipient
    const notificationPromises = emailList.map(async (email) => {
      try {
        // Get contact ID from email
        const contactIdResponse = await axios.get(`${apiURL}/api/contact/email/${email}`);
        if (!contactIdResponse.data?._id) {
          console.log(`No contact found for email: ${email}`);
          return;
        }
        // Get full contact details including push token
        const contactResponse = await axios.get(`${apiURL}/api/contact/${contactIdResponse.data._id}`);
        const contact = contactResponse.data;

        if (!contact?.pushToken) {
          console.log(`No push token found for contact: ${email}`);
          return;
        }

        // Send push notification
        const notificationData = {
          to: contact.pushToken,
          title: title,
          body: message,
          data: { // Optional additional data
            type: 'new_request',
            timestamp: new Date().toISOString()
          },
          sound: Platform.OS === 'android' ? 'default' : undefined,
          priority: 'high',
        };

        await axios.post('https://exp.host/--/api/v2/push/send', notificationData, {
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
        });

        console.log(`Push notification sent successfully to ${email}`);
        return true;
      } catch (error) {
        console.error(`Error sending notification to ${email}:`, error);
        return false;
      }
    });

    // Wait for all notifications to be processed
    const results = await Promise.allSettled(notificationPromises);
    
    // Log results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    console.log(`Successfully sent ${successful} out of ${emailList.length} push notifications`);

  } catch (error) {
    console.error('Error in sendRequestNotifications:', error);
    Toast.show({
      type: 'error',
      text1: 'Notification Error',
      text2: 'Failed to send some notifications',
      visibilityTime: 3000,
    });
  }
}; 