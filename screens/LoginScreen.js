// screens/LoginScreen.js

import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	Alert,
	View,
	Text,
	TextInput,
	StatusBar,
	TouchableOpacity,
	KeyboardAvoidingView,
} from "react-native";
import { GlobalStyles } from "../GlobalStyles";

import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useStateContext } from "../src/contexts/ContextProvider";
import useUserStore from "../src/stores/UserStore";
////////////////////////////////////////////////////////////////////////
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Loading from "../components/Loading";
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as LocalAuthentication from 'expo-local-authentication';

////////////////////////////////////////////////////////////////////////

export default function LoginScreen({ setIsAuthenticated }) {
	const navigation = useNavigation();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userID, setUserID] = useState(null);
	const [loggedIn, setLoggedIn] = useState(false);
	const [rootFlag, setRootFlag] = useState(false);
	const { apiURL, setCurrentUserID, isLoggedIn, setIsLoggedIn, dispatch } =
		useStateContext();
	const focusRef = useRef(null);
	const setLoggedInState = useUserStore((state) => state.setLoggedIn);
	const setWorksideUsername = useUserStore((state) => state.setUsername);
	const setWorksideUserId = useUserStore((state) => state.setUserID);
	const setWorksidePassword = useUserStore((state) => state.setPassword);
	const setWorksideEmail = useUserStore((state) => state.setEmail);
	const setWorksidePasscode = useUserStore((state) => state.setPasscode);
	const setPasscodeFlag = useUserStore((state) => state.setPasscodeFlag);

	const setBiometricSupported = useUserStore((state) => state.setBiometricSupported);
	const setBiometricEnrolled = useUserStore((state) => state.setBiometricEnrolled);

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const value = await AsyncStorage.getItem("userName");
				if (!value) {
					return;
				}
				setUsername(value);
			} catch (error) {
				console.error("useAsyncStorage getUserName error:", error);
			}
			try {
				const value = await AsyncStorage.getItem("password");
				if (!value) {
					return;
				}
				setPassword(value);
			} catch (error) {
				console.error("useAsyncStorage getPassword error:", error);
			}
			try {
				const value = await AsyncStorage.getItem("passcode");
				if (!value) {
					setPasscodeFlag(false);
					return;
				}
				setPasscodeFlag(true);
				setWorksidePasscode(value);
			} catch (error) {
				console.error("useAsyncStorage getPasscode error:", error);
			}
		};

		fetchData();
	}, []);

	const validateForm = () => {
		if (username.length < 6 || password.length < 6) {
			Toast.show({
				type: "error",
				text1: "Workside Software",
				text2: "Valid Email and Password Required!",
				visibilityTime: 5000,
				autoHide: true,
			});
			return false;
		} 
		return true;
	};

	const CheckBiometrics = async () => {
		const compatible = await LocalAuthentication.hasHardwareAsync();
		setBiometricSupported(compatible);
		// If compatible, check if user is enrolled
		if( compatible ) {
			const enrolled = await LocalAuthentication.isEnrolledAsync();
			console.log("Enrolled: ", enrolled);
			setBiometricEnrolled(enrolled);
			if( enrolled ) {
				// Authenticate the user if we need to, but not necessary
				// onAuthenticate();
			}
		};
	};

	const handleLogin = async (event) => {
		const reqURL = `${apiURL}/api/user/${username}?password=${password}`;
console.log("reqURL: ", reqURL);
		event.preventDefault();
		if (validateForm()) {
			const response = await fetch(reqURL, {
				method: "GET",
				body: null,
				headers: {
					"Content-Type": "application/json",
				},
			}).then((response) => {
				if (response.ok) {
					setLoggedIn(true);
					setLoggedInState(true);
				} else {
					setLoggedInState(false);
					console.log("Authentication Error");
					Toast.show({
						type: "error",
						text1: "Workside Software",
						text2: "Unable to Log In",
						visibilityTime: 3000,
						autoHide: true,
					});
					throw response;
				}

				return response.json();
			});

			if (response.status === false) {
				Toast.show({
					type: "error",
					text1: "Workside Software",
					text2: "Invalid Email or Password",
					visibilityTime: 5000,
					autoHide: true,
				});
			}
			if (response.status === true) {
				setIsAuthenticated(true);
				// Toast.show({
				//   type: 'info',
				//   text1: 'Workside Software',
				//   text2: 'User Id: ' + response.user.userId,
				//   visibilityTime: 5000,
				//   autoHide: true,
				// });
				if (response.user.userId !== null) {
					setUserID(response.user.userId);
					// Context Problem
					// SetContextUserID(response.user.userId);
					setCurrentUserID(response.user.userId);
					setWorksideUserId(response.user.userId);
				}
				setWorksideUsername(response.user.user);
				setWorksidePassword(response.user.password);
				setWorksideEmail(response.user.email);

				setLoading(true);

				CheckBiometrics();

				const userName = response.user.user;
				const phone = "123-456-7890";

				const email = response.user.email;
				const password= response.user.password;
				const mongoDbId = response.user.userId;
				try {
					const response = await createUserWithEmailAndPassword(
						FIREBASE_AUTH,
						email,
						password,
					);
					console.log("Create User response message: ", response.message);
					// let msg = response.message;
					// if (msg.includes("(auth/invalid-email)")) msg = "Invalid email";
					// if (msg.includes("(auth/email-already-in-use)"))
					// 	msg = "This email is already in use";
		
					const userId = response.user.uid;
					await setDoc(doc(FIREBASE_DB, "users", userId), {
						username: userName,
						email: email,
						company: "Workside Software",
						profileUrl: "privateURL",
						phone: phone,
						uid: userId,
						mongoDbId: mongoDbId,
					});
					setLoading(false);

				} catch (error) {
					let msg = error.message;
					if (msg.includes("(auth/invalid-email)")) msg = "Invalid email";
					if (msg.includes("(auth/email-already-in-use)"))
						msg = "This email is already in use";
						console.log("Error: ", msg);
				// Alert.alert("Create User", response.msg);
				setLoading(false);
			}
	
			// Check to see if Passcode Exists and Set Global State
			try {
				const value = await AsyncStorage.getItem("passcode");
				if (!value) {
					setPasscodeFlag(false);
					Toast.show({
						type: "error",
						text1: "Workside Software",
						text2: "Passcode Required!\nPlease Set Passcode in Settings.",
						visibilityTime: 5000,
						autoHide: true,
					});	
				}
				else	{
					setPasscodeFlag(true);
					setWorksidePasscode(value);
				}
			} catch (error) {
					console.error("useAsyncStorage getPasscode error:", error);
			}
	
				// localStorage.setItem(
				//   process.env.REACT_APP_LOCALHOST_KEY,
				//   JSON.stringify(data.user)
				// );
			}

			//////////////////////////////////////////////////////////////
			// Save email and password and userID in local storage
			//////////////////////////////////////////////////////////////
			if (username !== null) await AsyncStorage.setItem("userName", username);
			if (password !== null) await AsyncStorage.setItem("password", password);
			if (response.user.userId !== null)
				await AsyncStorage.setItem("userId", response.user.userId);
			// Navigate to the Home page
			navigation.navigate("RootDrawer");
		}
	};

	const handleBiometric = (event) => {
		event.preventDefault();
		const auth = LocalAuthentication.authenticateAsync({
			promptMessage: 'Authenticate',
			fallbackLabel: 'Enter Password',
		});
		auth.then(result => {
			setIsAuthenticated(result.success);
			Toast.show({
				type: "success",
				text1: "Workside Software",
				text2: `Biometrics Result: ${result.success}`,
				visibilityTime: 5000,
				autoHide: true,
			});
				return result.success;
		}
		);
		return false;
};

return (
		<KeyboardAvoidingView
			// behavior={Platform.OS === "ios" ? "padding" : "null"}
			// keyboardVerticalOffset={Platform.OS === "ios" ? "100" : 0}
			// Items-center centers items horizontally
			className="flex-1 items-center bg-white pt-[10vh] "
		>
			<StatusBar />
			<Text>
				<Text className="text-green-500 text-4xl font-bold">WORK</Text>
				<Text className="text-black text-4xl font-bold">SIDE</Text>
			</Text>
			<Text>
				<Text className="text-green-500 text-xl font-bold">CLIENT</Text>
			</Text>

			{/* ////////////////////////////////////////////////////////////////////////// */}
			{/* Email input Field */}
			{/* ////////////////////////////////////////////////////////////////////////// */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					// gap: 5,
					// backgroundColor: "#D0D0D0",
					marginLeft: 25,
					marginRight: 25,
					backgroundColor: "white",
					paddingVertical: 5,
					borderRadius: 5,
					marginTop: 20,
				}}
			>
				<TextInput
					className={
						"bg-green-200 relative rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-[300px] h-12 border-[1px] border-solid border-black text-black text-bold my-1 border-r-4 border-b-4 text-lg align-middle pl-2 pb-1 flex-1"
					}
					type="text"
					placeholder="Email"
					value={username}
					onChangeText={(text) => setUsername(text)}
					// autoFocus
				/>
				<MaterialIcons
					style={{
						position: "absolute",
						right: 10,
						color: "black",
						alignItems: "center",
					}}
					name="email"
					size={24}
				/>
			</View>
			{/* ////////////////////////////////////////////////////////////////////////// */}
			{/* Password Input Field */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginLeft: 25,
					marginRight: 25,
					backgroundColor: "white",
					paddingVertical: 5,
					borderRadius: 5,
					marginTop: 5,
				}}
			>
				<TextInput
					className={
						"bg-green-200 relative rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-[300px] h-12 border-[1px] border-solid border-black text-black text-bold my-1 border-r-4 border-b-4 text-lg align-top pl-2 pb-1 flex-1"
					}
					type="text"
					placeholder="Password"
					secureTextEntry
					value={password}
					onChangeText={(text) => setPassword(text)}
				/>
				<AntDesign
					name="lock1"
					size={24}
					color="black"
					style={{
						position: "absolute",
						right: 10,
						color: "black",
						alignItems: "center",
					}}
				/>
			</View>
			<View className="mt-5 justify-center items-center" />
			{loading ? (
				<View className="flex-row justify-center">
					<Loading size={hp(6.5)} />
				</View>
				) : (
				<View className="gap-2">
					<TouchableOpacity
							className="bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-36 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
							onPress={handleLogin}
							ref={focusRef}
							autoFocus
						>
							<Text className="text-xl font-bold text-black">Login</Text>
						</TouchableOpacity>
					</View>
				)}
				<View className="flex-1">
		        <View className="flex-1 justify-end items-center">
						<Text 
							style={GlobalStyles.copyrightTextStyle}
							className="text-gray-500 text-center font-bold mb-1"
						>
							By logging into Workside, you agree to our Terms of Service and
							Privacy Policy. By using Workside, you acknowledge and accept the
							potential risks involved.
						</Text>
		        </View>
      		</View>
			<Text
				style={GlobalStyles.copyrightTextStyle}
				className="text-black font-bold pt-1 mb-4"
			>
				Workside Copyright 2024
			</Text>
		</KeyboardAvoidingView>
	);
}
