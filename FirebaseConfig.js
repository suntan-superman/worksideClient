import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
// import "firebase/auth"; // Import the authentication module
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAh5GhuMoz2EaD8bmMv-JZr42QbIbcLVyE",
	authDomain: "workside-4b103.firebaseapp.com",
	projectId: "workside-4b103",
	storageBucket: "workside-4b103.appspot.com",
	messagingSenderId: "859787325345",
	appId: "1:859787325345:web:498a5a7fdbe66b8be825e0",
	measurementId: "G-4PRFTZ6H0W",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
	persistence: getReactNativePersistence(AsyncStorage),
});
