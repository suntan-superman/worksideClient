import { Text, View, Alert, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import RequestMapping from "../screens/RequestMapping";
import NewRequest from "../screens/NewRequest";
import RequestDetails from "../screens/RequestDetails";
import ActiveRequests from "../screens/ActiveRequests";
import SelectProject from "../screens/SelectProject";
import RequestBids from "../screens/RequestBids";
import PasscodeScreen from "../screens/PasscodeScreen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
// import LoginScreen from "../screens/LoginScreen";

// import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
      title: "Workside HomeStack Notification",
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
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

const HomeStack = createStackNavigator();

const alarmSelected = () => {
  // Alert.alert('Alarm Selected...');
  schedulePushNotification();
};

const HomeStackScreen = ({ navigation }) => (
  // useEffect(() => {
  //   registerForPushNotificationsAsync();
  //   }, []);

  <HomeStack.Navigator headerShown="false">
    <HomeStack.Screen
      name="SelectProject"
      component={SelectProject}
      options={{
        title: "WORKSIDE",
        headerRight: () => (
          <View>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon name="alarm" size={28} onPress={alarmSelected} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    <HomeStack.Screen
      name="ActiveRequests"
      component={ActiveRequests}
      options={{
        title: "WORKSIDE Requests",
        headerRight: () => (
          <View>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon name="alarm" size={28} onPress={alarmSelected} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    <HomeStack.Screen
      name="RequestDetails"
      component={RequestDetails}
      options={{
        title: "WORKSIDE Details",
        headerRight: () => (
          <View>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon name="alarm" size={28} onPress={alarmSelected} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    <HomeStack.Screen
      name="RequestBids"
      component={RequestBids}
      options={{
        title: "WORKSIDE Request Bids",
        headerRight: () => (
          <View>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon name="alarm" size={28} onPress={alarmSelected} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    {/* <HomeStack.Screen name="NewRequest" component={NewRequest}/> */}
    <HomeStack.Screen
      name="NewRequest"
      component={NewRequest}
      options={{
        title: "WORKSIDE New Request",
        headerRight: () => (
          <View>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon name="alarm" size={28} onPress={alarmSelected} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />

    {/* <HomeStack.Screen name="RequestMapping" component={RequestMapping}/> */}
    <HomeStack.Screen
      name="RequestMapping"
      component={RequestMapping}
      options={{
        title: "WORKSIDE Tracking",
        headerRight: () => (
          <View>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon name="alarm" size={28} onPress={alarmSelected} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    <HomeStack.Screen
      name="PasscodeScreen"
      component={PasscodeScreen}
      options={{
        title: "WORKSIDE Confirmation",
      }}
    />
  </HomeStack.Navigator>
);

export default HomeStackScreen;
