import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
	Alert,
	View,
	Text,
	TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FloatingLabelInput } from "react-native-floating-label-input";
import { useNavigation, useRoute } from "@react-navigation/native";
import useUserStore from "../src/stores/UserStore";


const SettingsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const worksidePassword = useUserStore((state) => state.password);
  const setWorksidePasscode = useUserStore((state) => state.setPasscode);

	const [userPassword, setUserPassword] = useState("");
	const [passcode, setPasscode] = useState("");
	const [confirmPasscode, setConfirmPasscode] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showCode, setShowCode] = useState(false);
	const [showConfirmCode, setShowConfirmCode] = useState(false);


	const SaveChanges = async () => {
    // Validate Data
    if(userPassword !== worksidePassword) {
      console.log(`User: ${userPassword} Workside Login: ${worksidePassword}`);
      Alert.alert("Error", "Password is incorrect");
      return;
    }
    if (passcode.length !== 6 || confirmPasscode.length !== 6) {
      Alert.alert("Error", "Passcode must be 6 digits");
      return;
    }
    if (passcode !== confirmPasscode) {
      Alert.alert("Error", "Passcodes do not match");
      return;
    }
    setWorksidePasscode(passcode);
		// Save Data
    await AsyncStorage.setItem("passcode", passcode);
    // Show Success Message
    Alert.alert("Success", "Passcode has been updated");
    // Redirect to Home
    navigation.goBack();
	};

  return (
    <>
      {/* Output Header */}
      <View className="flex-1">
        <View className="flex-row justify-center items-center p-1">
          <View className="flex-1">
            <Text className="text-center">
              <Text className="text-green-500 text-2xl font-bold">WORK</Text>
              <Text className="text-black text-2xl font-bold">SIDE</Text>
            </Text>
          </View>
          {/* <Icon
            name="close-octagon-outline"
            size={25}
            color="red"
            onPress={handlePasscodeClose}
          /> */}
        </View>
        <View className="flex-start justify-center items-center">
          {/* <Text>
            <Text className="text-green-500 text-2xl font-bold">WORK</Text>
            <Text className="text-black text-2xl font-bold">SIDE</Text>
          </Text> */}
          <Text className="text-black text-xl font-bold">Set/Change Passcode</Text>
        </View>
        <View className="flex-row items-center justify-between w-[100%] pt-1 pb-4">
          <View className="h-2 bg-green-300 flex-grow w-1/2" />
        </View>
        <View className="w-[100%] justify-center items-center">
          <View className="w-[80%]">

            <View className="pb-3">
              <FloatingLabelInput
                label="Password"
                staticLabel
                value={userPassword}
                isPassword
                // maskType="password"
                togglePassword={showPassword}
                customShowPasswordComponent={<Text>Show</Text>}
                customHidePasswordComponent={<Text>Hide</Text>}
                hintTextColor={"#aaa"}
                hint="Password"
                onChangeText={(value) => {
                  setUserPassword(value);
                }}
                containerStyles={{
                  height: 50,
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  backgroundColor: "#fff",
                  borderColor: "black",
                  borderRadius: 8,
                }}
                customLabelStyles={{
                  colorFocused: "red",
                  fontSizeFocused: 12,
                }}
                labelStyles={{
                  fontSize: 16,
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  paddingHorizontal: 10,
                }}
                inputStyles={{
                  fontSize: 16,
                  color: "black",
                  paddingHorizontal: 10,
                }}
              />
            </View>
            <View className="pb-3">
              <FloatingLabelInput
                label="Passcode"
                staticLabel
                maxLength={6}
                value={passcode}
                hintTextColor={"#aaa"}
                hint="Passcode"
                keyboardType="numeric"
                mask="999999"
                onChangeText={(value) => {
                  setPasscode(value);
                }}
                containerStyles={{
                  height: 50,
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  backgroundColor: "#fff",
                  borderColor: "black",
                  borderRadius: 8,
                }}
                customLabelStyles={{
                  colorFocused: "red",
                  fontSizeFocused: 12,
                }}
                labelStyles={{
                  fontSize: 16,
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  paddingHorizontal: 10,
                }}
                inputStyles={{
                  fontSize: 16,
                  color: "black",
                  paddingHorizontal: 10,
                }}
              />
            </View>
            <View className="pb-3">
              <FloatingLabelInput
                label="Confirm Passcode"
                staticLabel
                value={confirmPasscode}
                maxLength={6}
                keyboardType="numeric"
                mask="999999"
                hintTextColor={"#aaa"}
                hint="Confirm Passcode"
                onChangeText={(value) => {
                  setConfirmPasscode(value);
                }}
                containerStyles={{
                  height: 50,
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  backgroundColor: "#fff",
                  borderColor: "black",
                  borderRadius: 8,
                }}
                customLabelStyles={{
                  colorFocused: "red",
                  fontSizeFocused: 12,
                }}
                labelStyles={{
                  fontSize: 16,
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  paddingHorizontal: 10,
                }}
                inputStyles={{
                  fontSize: 16,
                  color: "black",
                  paddingHorizontal: 10,
                }}
              />
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-center gap-7 pt-1 pb-2">
          <TouchableOpacity
            className={
              (userPassword.length < 5 || passcode.length < 5 || confirmPasscode.length < 5) ?
              "bg-gray-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
              : "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            disabled={userPassword.length < 5 || passcode.length < 5 || confirmPasscode.length < 5}
            onPress={SaveChanges}
          >
            <Text className="text-base font-bold text-black">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={navigation.goBack} 
          >
            <Text className="text-base font-bold text-black">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

export default SettingsScreen
