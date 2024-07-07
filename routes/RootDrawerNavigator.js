import { Text, View, Alert, TouchableOpacity } from "react-native";
import "react-native-gesture-handler";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import HomeStackScreen from "./HomeStack";
import { DrawerContent } from "../routes/DrawerContent";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

import PendingProjects from "../screens/PendingProjects";
import SelectProject from "../screens/SelectProject";

const DrawerNavigator = createDrawerNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Workside Notification",
      body: "Notification Details...",
      data: { data: "More Data" },
      sound: "notification_message.wav",
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

const alarmSelected = () => {
  Toast.show({
    type: "info",
    text1: "Workside Software",
    text2: "Alarm Selected!",
    visibilityTime: 3000,
    autoHide: true,
  });
  // Alert.alert("Alarm Selected...");
};

const RootDrawerNavigator = () => {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <DrawerNavigator.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <DrawerNavigator.Screen name="Home" component={HomeStackScreen} />

      <DrawerNavigator.Screen
        name="Select Project"
        component={SelectProject}
        options={{
          title: "Select Project",
          headerRight: () => (
            <View>
              <TouchableOpacity style={{ marginLeft: 15 }}>
                {/* <Icon name='alarm' size={28} onPress={alarmSelected} style={styles.alarmIcon} /> */}
                <Icon name="alarm" size={28} onPress={alarmSelected} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <DrawerNavigator.Screen
        name="Pending Projects"
        component={PendingProjects}
        options={{
          title: "Pending Projects",
          headerRight: () => (
            <View>
              <TouchableOpacity style={{ marginLeft: 15 }}>
                {/* <Icon name='alarm' size={28} onPress={alarmSelected} style={styles.alarmIcon} /> */}
                <Icon name="alarm" size={28} onPress={alarmSelected} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </DrawerNavigator.Navigator>
  );
};

export default RootDrawerNavigator;
