import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Margin,
  FontFamily,
  FontSize,
  Color,
  Padding,
  Border,
} from "../GlobalStyles";

const WorksideAnimation = () => {
  const navigation = useNavigation();

  const [isVisible, setisVisible] = useState(true);

  const width = new Animated.Value(0);
  const height = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(width, {
      toValue: 360,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    Animated.timing(height, {
      toValue: 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, []);

  const Hide_Splash_Screen = () => {
    setisVisible(false);
  };

  useEffect(() => {
    setTimeout(() => {
      // setAnimating(false);
      Hide_Splash_Screen();
      //Check if user_id is set or not
      //If not then send for Authentication
      //else send to Home Screen
      // navigation.navigate("RootDrawer");
      // navigation.navigate("Auth");
      navigation.navigate("LoginScreen");
    }, 5000);
  }, []);

  const Splash_Screen = () => {
    return (
      <View style={styles.container}>
        <Animated.Image
          source={require("../assets/Workside.png")}
          style={{
            width: width,
            height: height,
            position: "absolute",
          }}
          resizeMode="cover"
        />
      </View>
    );
  };

  const Copyright = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Copyright Workside LLC 2023</Text>
      </View>
    );
  };

  //  return <>{isVisible === true ? Splash_Screen() : Copyright()}</>;
  return <>{Splash_Screen()}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
  },
  spaceBlock: {
    paddingVertical: Padding.p_lg,
    paddingHorizontal: Padding.p_xl,
    flexDirection: "row",
    width: 359,
    borderRadius: Border.br_3xs,
    left: 41,
    position: "absolute",
  },
  continueButton: {
    top: 707,
    backgroundColor: Color.cornflowerblue,
  },
  continueButtonText: {
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: "600",
    fontFamily: FontFamily.workSansSemibold,
    textAlign: "center",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    width: 289,
    height: 31,
  },
  continueButtonTypo: {
    fontSize: FontSize.size_base,
    color: Color.backgroundPrimary,
  },
});

export default WorksideAnimation;
