import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

/**
 * Push Token Management Module
 * Handles checking, registering, and saving push notification tokens
 * @module pushTokenManager
 */

/**
 * Check if a contact has a registered push token
 * @async
 * @param {string} contactId - The ID of the contact to check
 * @param {string} apiURL - Base API URL
 * @returns {Promise<boolean>} True if contact has a push token, false otherwise
 * @throws {Error} If contact ID is invalid or network error occurs
 */
export const hasPushToken = async (contactId, apiURL) => {
	try {
		if (!contactId) {
			throw new Error("Contact ID is required");
		}

		const response = await axios.get(`${apiURL}/api/contacts/${contactId}`);

		if (!response.data) {
			throw new Error("Contact not found");
		}

		return !!response.data.pushToken; // Convert to boolean
	} catch (error) {
		console.error("Error checking push token:", error);
		throw new Error(`Failed to check push token: ${error.message}`);
	}
};

/**
 * Register and save a push notification token for a contact
 * @async
 * @param {string} contactId - The ID of the contact
 * @param {string} apiURL - Base API URL
 * @returns {Promise<Object>} Object containing success status and token or error message
 */
export const registerPushToken = async (contactId, apiURL) => {
	try {
		// Validate inputs
		if (!contactId) {
			throw new Error("Contact ID is required");
		}

		if (!apiURL) {
			throw new Error("API URL is required");
		}

		// Check if device is physical (not simulator/emulator)
		if (!Device.isDevice) {
			throw new Error(
				"Push notifications are not supported in simulator/emulator",
			);
		}

		// Request notification permissions
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			throw new Error("Permission to send push notifications was denied");
		}

		// Get push token
		const tokenData = await Notifications.getExpoPushTokenAsync({
			projectId: process.env.EXPO_PROJECT_ID, // Make sure this is set in your environment
		});

		if (!tokenData.data) {
			throw new Error("Failed to get push token");
		}

		// Save token to backend
		const response = await axios.patch(
			`${apiURL}/api/contacts/${contactId}/push-token`,
			{ pushToken: tokenData.data },
		);

		if (!response.data.success) {
			throw new Error("Failed to save push token to server");
		}

		return {
			success: true,
			token: tokenData.data,
		};
	} catch (error) {
		console.error("Error registering push token:", error);
		return {
			success: false,
			error: error.message,
		};
	}
};

/**
 * Remove push token for a contact
 * @async
 * @param {string} contactId - The ID of the contact
 * @param {string} apiURL - Base API URL
 * @returns {Promise<Object>} Object containing success status
 */
export const removePushToken = async (contactId, apiURL) => {
	try {
		if (!contactId) {
			throw new Error("Contact ID is required");
		}

		const response = await axios.patch(
			`${apiURL}/api/contacts/${contactId}/push-token`,
			{ pushToken: null },
		);

		return {
			success: true,
			message: "Push token removed successfully",
		};
	} catch (error) {
		console.error("Error removing push token:", error);
		return {
			success: false,
			error: error.message,
		};
	}
}; 