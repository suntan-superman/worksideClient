import { Text, View, Alert, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RequestMapping from "../screens/RequestMapping";
import NewRequest from "../screens/NewRequest";
import RequestDetails from "../screens/RequestDetails";
import ActiveRequests from "../screens/ActiveRequests";
import SelectProject from "../screens/SelectProject";
import RequestBids from "../screens/RequestBids";
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

const screens = {
  //////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  // LoginScreen: {
  //   screen: LoginScreen,
  // },
  ///////////////////////////////////////////////////////////
  SelectProject: {
    screen: SelectProject,
    navigationOptions: ({ navigation }) => {
      return {
        // May Not Need This
        headerTitle: () => (
          <Header title="Select Project" navigation={navigation} />
        ),
      };
    },
  },
  ActiveRequests: {
    screen: ActiveRequests,
    navigationOptions: ({ navigation }) => {
      return {
        headerTitle: () => (
          <Header title="Active Requests" navigation={navigation} />
        ),
      };
    },
  },
  RequestDetails: {
    screen: RequestDetails,
    navigationOptions: {
      title: "Request Details",
    },
  },
  RequestBids: {
    screen: RequestBids,
    navigationOptions: {
      title: "Request Bids",
    },
  },
  NewRequest: {
    screen: NewRequest,
    navigationOptions: {
      title: "New Request",
    },
  },
  RequestMapping: {
    screen: RequestMapping,
    navigationOptions: {
      title: "Request Mapping",
    },
  },
};

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
    <HomeStack.Screen
      name="ActiveRequests"
      component={ActiveRequests}
      options={{
        title: "Active Requests",
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
    {/* <HomeStack.Screen name="RequestDetails" component={RequestDetails}/> */}
    <HomeStack.Screen
      name="RequestDetails"
      component={RequestDetails}
      options={{
        title: "Request Details",
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
    <HomeStack.Screen
      name="RequestBids"
      component={RequestBids}
      options={{
        title: "Request Bids",
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
    {/* <HomeStack.Screen name="NewRequest" component={NewRequest}/> */}
    <HomeStack.Screen
      name="NewRequest"
      component={NewRequest}
      options={{
        title: "New Request",
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

    {/* <HomeStack.Screen name="RequestMapping" component={RequestMapping}/> */}
    <HomeStack.Screen
      name="RequestMapping"
      component={RequestMapping}
      options={{
        title: "Request Mapping",
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
  </HomeStack.Navigator>
);

export default HomeStackScreen;
