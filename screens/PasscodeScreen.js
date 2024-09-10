import React, { useState, useEffect } from "react";
import {
	Alert,
	View,
	Text,
	TouchableOpacity,
	Dimensions,
	FlatList,
	StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import usePasscodeStore from "../src/stores/PasscodeStore";

const { width, height } = Dimensions.get("window");
const OFFSET = 20;
const TIMING = 80;

const dialPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"];
const dialPadSize = width * 0.15;
const pinLength = 6;
let numOfAttempts = 0;
const targetDestination = "Home";

const PasscodeScreen = () => {
	const navigation = useNavigation();
	const setValidatedFlag = usePasscodeStore((state) => state.setValidated);
	const setPasscodeRequested = usePasscodeStore((state) => state.setPasscodeRequested);

	const [pinCode, setPinCode] = useState([]);
	const codeLength = Array(6).fill(0);
	const offset = useSharedValue(0);
	const style = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: offset.value }],
		};
	});

	useEffect(() => {
		numOfAttempts = 0;
		setPinCode([]);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (numOfAttempts === 3) {
			Alert.alert("Error", "Too many attempts");
			setPinCode([]);
			// Navigate to home screen
		}
	}, [numOfAttempts]);

	useEffect(() => {
		if (pinCode.length === pinLength) {
			numOfAttempts += 1;
			// Validate passcode and re-route to home screen
			if (pinCode.join("") !== "123456") {
				offset.value = withSequence(
					withTiming(-OFFSET, { duration: TIMING }),
					withRepeat(withTiming(OFFSET, { duration: TIMING }), 4, true),
					withTiming(0, { duration: TIMING }),
				);

				setPinCode([]);
				if(numOfAttempts === 3) {
					Alert.alert("Error", "Too many attempts");
					setValidatedFlag(false);
					setPasscodeRequested(true);
					navigation.goBack();
					return;
				}
				return;
			}

			numOfAttempts = 0;
			setPinCode([]);
			setValidatedFlag(true);
			setPasscodeRequested(true);
			console.log("Passcode validated");
			navigation.goBack();
		}
	}, [pinCode]);

	const DialPad = ({ onPress }) => {
		return (
			// <View style={{ height: 420 }}>
			<View className="flex-1 pt-2">
				<FlatList
					data={dialPad}
					numColumns={3}
					style={{ flexGrow: 1 }}
					keyExtractor={(_, index) => index.toString()}
					scrollEnabled={false}
					columnWrapperStyle={{ gap: 30 }}
					contentContainerStyle={{ gap: 30 }}
					renderItem={({ item }) => {
						return (
							<TouchableOpacity
								onPress={() => onPress(item)}
								disabled={item === ""}
							>
								<View
									style={{
										width: dialPadSize,
										height: dialPadSize,
										borderRadius: dialPadSize / 2,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{item === "del" ? (
										<Ionicons
											name="backspace-outline"
											size={dialPadSize / 2}
											color="black"
										/>
									) : item === "" ? (
										<Ionicons
											name="finger-print"
											size={dialPadSize / 2}
											color="black"
										/>
									) : (
										<Text className="text-green-500 text-4xl font-bold">
											{item}
										</Text>
									)}
								</View>
							</TouchableOpacity>
						);
					}}
				/>
			</View>
		);
	};

	return (
		<View className="flex-1 bg-white items-center">
			<View className="items-center pb-3 pt-3">
				<Text>
					<Text className="text-green-500 text-3xl font-bold">WORK</Text>
					<Text className="text-black text-3xl font-bold">SIDE</Text>
				</Text>
			</View>

			<Text className="text-2xl font-bold text-center mb-2 text-black">
				Confirm with Passcode
			</Text>
			<Animated.View style={[styles.codeView, style]}>
				{codeLength.map((_, index) => (
					<View
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						style={[
							styles.codeEmpty,
							{
								backgroundColor: pinCode[index] ? "black" : "transparent",
							},
						]}
					/>
				))}
			</Animated.View>
			<DialPad
				onPress={(item) => {
					if (item === "del") {
						setPinCode((prevCode) => prevCode.slice(0, prevCode.length - 1));
					} else if (typeof item === "number") {
						setPinCode((prevCode) => [...prevCode, item]);
					}
				}}
			/>
			{numOfAttempts > 0 ? (
				<View>
					<Text className="text-sm font-bold text-center text-red-500">
						{`Invalid passcode. Attempts Left: ${3 - numOfAttempts}`}
					</Text>
				</View>
			) : null}
			<View>
				<Text className="text-sm font-bold text-center mb-2 text-black">
					After Three Failed Attempts, You Will Be Locked Out
				</Text>
				<Text className="text-sm font-bold text-center mb-2 text-black">
					Workside Software Copyright 2024
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	codeView: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 20,
		marginVertical: 50,
	},
	codeEmpty: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
	},
});

export default PasscodeScreen;
