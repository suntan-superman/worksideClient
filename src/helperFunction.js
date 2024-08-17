import Toast from "react-native-toast-message";
// import { PermissionsAndroid, Platform } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

export const getCurrentLocation = async () => {
	let location = await Location.getCurrentPositionAsync({});
	// console.log("Current Location: " + JSON.stringify(location));
	return location;
};

export const locationPermission = async () => {
	let { status } = await Location.requestForegroundPermissionsAsync();
	if (status !== "granted") {
		console.log("Please grant location permissions");
		return false;
	}

	let currentLocation = await Location.getCurrentPositionAsync({});
	// console.log("Latitude: " + currentLocation.coords.latitude);
	// console.log("Longitude: " + currentLocation.coords.longitude);
	return true;
};

const showError = (message) => {
	Toast.show({
		type: "error",
		text1: "Workside Software",
		text2: message,
		visibilityTime: 5000,
		autoHide: true,
	});
};

const showSuccess = (message) => {
	Toast.show({
		type: "success",
		text1: "Workside Software",
		text2: message,
		visibilityTime: 5000,
		autoHide: true,
	});
};

export const logTransaction = async (
	userID,
	tableName,
	action,
	result,
	targetID
) => {
	const app = "CLIENT";
	const apiURL = "https://keen-squid-lately.ngrok-free.app";
	const strAPI = `${apiURL}/api/transaction`;

	try {
		const response = await axios.post(strAPI, {
			app: app,
			user_id: userID,
			tablename: tableName,
			action: action,
			result: result,
			target_id: targetID,
		});

		if (response.status === 200) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		if (error.response.status === 404) {
			console.log("error", error);
			return false;
		}
	}
};

export { showError, showSuccess };
