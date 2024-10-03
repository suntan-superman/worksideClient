import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import WorksideAnimation from "./screens/WorksideAnimation";
import LoginScreen from "./screens/LoginScreen";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { IconRegistry, ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { ContextProvider } from "./src/contexts/ContextProvider";
import { default as theme } from "./blacktheme.json";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { ModalPortal } from "react-native-modals";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AuthContextProvider } from "./src/contexts/authContext";
import { MenuProvider } from "react-native-popup-menu";

import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";
// import EventListener from "./src/EventListener";

import RootDrawerNavigator from "./routes/RootDrawerNavigator";
// import { DrawerContent } from "./routes/DrawerContent";
// import { set } from "date-fns";

const Stack = createStackNavigator();

const toastConfig = {
  success: ({ text1, text2, props, ...rest }) => (
    <BaseToast
      {...rest}
      position="top"
      offset={350}
      text2NumberOfLines={2}
      style={{
        borderLeftColor: "green",
        borderRightColor: "green",
        borderLeftWidth: 7,
        borderRightWidth: 7,
        width: "75%",
        height: 150,
        borderRadius: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      titleStyle={{
        color: "green",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
      }}
      titleText="Workside"
      text1={text1}
      text1Style={{ color: "green", fontSize: 18, fontWeight: "bold" }}
      text2={text2}
      text2Style={{ color: "green", fontSize: 14, fontWeight: "bold" }}
    />
  ),
  error: ({ text1, text2, props, ...rest }) => (
    <ErrorToast
      {...rest}
      position="top"
      offset={350}
      text2NumberOfLines={2}
      style={{
        borderLeftColor: "red",
        borderRightColor: "red",
        borderLeftWidth: 7,
        borderRightWidth: 7,
        width: "75%",
        height: 150,
        borderRadius: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      titleStyle={{
        color: "green",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
      }}
      titleText="Workside"
      text1={text1}
      text1Style={{ color: "red", fontSize: 18, fontWeight: "bold" }}
      // text2={props.text2}
      text2={text2}
      text2Style={{ color: "red", fontSize: 14, fontWeight: "bold" }}
    />
  ),
  info: ({ text1, text2, props, ...rest }) => (
    <BaseToast
      {...rest}
      position="top"
      offset={350}
      text2NumberOfLines={2}
      style={{
        borderLeftColor: "blue",
        borderRightColor: "blue",
        borderLeftWidth: 7,
        borderRightWidth: 7,
        width: "75%",
        height: 150,
        borderRadius: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      titleStyle={{
        color: "green",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
      }}
      titleText="Workside"
      text1={text1}
      text1Style={{ color: "blue", fontSize: 18, fontWeight: "bold" }}
      text2={text2}
      text2Style={{ color: "blue", fontSize: 14, fontWeight: "bold" }}
    />
  ),
};

const App = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHideSplashScreen(true);
    }, 1000);
  }, []);

  return (
    <>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SplashScreen">
            {/* SplashScreen which will come once for 5 Seconds */}
            <Stack.Screen
              name="SplashScreen"
              component={WorksideAnimation}
              options={{ headerShown: false }}
            />
            {/* )} */}
            <Stack.Screen name="LoginScreen" options={{ headerShown: false }}>
              {(props) => (
                <LoginScreen
                  {...props}
                  setIsAuthenticated={setIsAuthenticated}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="RootDrawer"
              component={RootDrawerNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
    </>
  );
};

const AppWrapper = () => {

  const [fontsLoaded, error] = useFonts({
    "Work Sans": require("./assets/fonts/Work_Sans.ttf"),
    "Work Sans_semibold": require("./assets/fonts/Work_Sans_semibold.ttf"),
    "Work Sans_bold": require("./assets/fonts/Work_Sans_bold.ttf"),
    Inter: require("./assets/fonts/Inter.ttf"),
    Inter_regular: require("./assets/fonts/Inter_regular.ttf"),
    Inter_bold: require("./assets/fonts/Inter_bold.ttf"),
    Inter_extrabold: require("./assets/fonts/Inter_extrabold.ttf"),
    Montserrat: require("./assets/fonts/Montserrat.ttf"),
    Montserrat_regular: require("./assets/fonts/Montserrat_regular.ttf"),
    Montserrat_bold: require("./assets/fonts/Montserrat_bold.ttf"),
    "SF Pro Text": require("./assets/fonts/SF_Pro_Text.ttf"),
    "SF Pro Text_Regular": require("./assets/fonts/SF_Pro_Text_Regular.ttf"),
    "SF Pro Text_Semibold": require("./assets/fonts/SF_Pro_Text_Semibold.ttf"),
    "SF Pro Text_Bold": require("./assets/fonts/SF_Pro_Text_Bold.ttf"),
    "SF Pro Display": require("./assets/fonts/SF_Pro_Display.ttf"),
    "SF Pro Display_Regular": require("./assets/fonts/SF_Pro_Display_Regular.ttf"),
    "SF Pro Display_Medium": require("./assets/fonts/SF_Pro_Display_Medium.ttf"),
    "SF Pro Display_Semibold": require("./assets/fonts/SF_Pro_Display_Semibold.ttf"),
  });

  function MaterialIcon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <MIcon name={name} size={height} color={tintColor} style={iconStyle} />
    );
  }

  const IconProvider = (name) => ({
    toReactElement: (props) => MaterialIcon({ name, ...props }),
  });

  function createIconsMap() {
    return new Proxy(
      {},
      {
        get(target, name) {
          return IconProvider(name);
        },
      }
    );
  }

  const MaterialIconsPack = {
    name: "material",
    icons: createIconsMap(),
  };

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={[MaterialIconsPack]} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MenuProvider>
            <AuthContextProvider>
              <ContextProvider>
                <BottomSheetModalProvider>
                  <App />
                  <Toast config={toastConfig} />
                </BottomSheetModalProvider>
                {/* <EventListener /> */}
                <ModalPortal />
              </ContextProvider>
          </AuthContextProvider>
        </MenuProvider>
       </GestureHandlerRootView>
      </ApplicationProvider>
    </>
  );
};

export default AppWrapper;