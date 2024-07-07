import * as React from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Padding, Color, Border } from "../GlobalStyles";

const RequestAlerts = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.requestAlerts}>
      <Text style={styles.workside}>WORKSIDE</Text>
      <Text style={[styles.login, styles.loginTypo, styles.loginTypo1]}>
        ELK HILLS 26Z 383
      </Text>
      <Text style={[styles.login1, styles.loginTypo, styles.loginTypo1]}>
        GPS 84
      </Text>
      <Pressable style={styles.requestDetails}>
        <Text style={[styles.requestDetails1, styles.loginTypo]}>
          REQUEST DETAILS
        </Text>
      </Pressable>
      <TextInput
        style={[
          styles.requestAlertsChild,
          styles.frameChildFlexBox,
          styles.framePosition,
        ]}
        placeholder="Request"
        keyboardType="default"
        placeholderTextColor="#000"
      />
      <TextInput
        style={[
          styles.requestAlertsItem,
          styles.goBackAgainLayout,
          styles.frameChildFlexBox,
          styles.requestFlexBox,
        ]}
        placeholder={`Req
Date`}
        keyboardType="default"
        placeholderTextColor="rgba(0, 0, 0, 0.99)"
      />
      <TextInput
        style={[
          styles.requestAlertsInner,
          styles.frameChildFlexBox,
          styles.framePosition,
        ]}
        placeholder={`Req
Time`}
        keyboardType="default"
        placeholderTextColor="rgba(0, 0, 0, 0.99)"
      />
      <TextInput
        style={[
          styles.frameTextinput,
          styles.frameChildFlexBox,
          styles.framePosition,
        ]}
        placeholder="Status"
        keyboardType="default"
        placeholderTextColor="rgba(0, 0, 0, 0.99)"
      />
      <View
        style={[
          styles.frameView,
          styles.frameChildFlexBox,
          styles.framePosition,
        ]}
      />
      <TextInput
        style={[
          styles.requestAlertsChild1,
          styles.frameChildFlexBox,
          styles.requestFlexBox,
        ]}
        placeholder="Welder"
        keyboardType="default"
        placeholderTextColor="rgba(0, 0, 0, 0.99)"
      />
      <Pressable
        style={[styles.goBackAgain, styles.goBackAgainLayout]}
        onPress={() => navigation.navigate("ActiveRequests2")}
      >
        <Image
          style={styles.goBackAgainChild}
          resizeMode="cover"
          source={require("../assets/arrow-1.png")}
        />
      </Pressable>
      <Text style={[styles.login2, styles.loginTypo, styles.loginTypo1]}>
        AlERTS
      </Text>
      <Text style={styles.callAtThis}>Call At This Time</Text>
      <TextInput
        style={styles.rectangleTextinput}
        placeholder="Placeholder text"
        keyboardType="default"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loginTypo: {
    height: 31,
    width: 289,
    justifyContent: "center",
    alignItems: "flex-end",
    display: "flex",
    textAlign: "center",
    fontFamily: FontFamily.workSansSemibold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: FontSize.size_base,
  },
  loginTypo1: {
    left: 69,
    width: 289,
    justifyContent: "center",
    alignItems: "flex-end",
    display: "flex",
    textAlign: "center",
    fontFamily: FontFamily.workSansSemibold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    position: "absolute",
  },
  frameChildFlexBox: {
    justifyContent: "space-between",
    left: "50%",
    flexDirection: "row",
  },
  framePosition: {
    padding: Padding.p_md,
    justifyContent: "space-between",
    left: "50%",
    top: 283,
    position: "absolute",
  },
  goBackAgainLayout: {
    width: 61,
    padding: Padding.p_md,
    position: "absolute",
  },
  requestFlexBox: {
    justifyContent: "space-between",
    left: "50%",
  },
  workside: {
    top: 50,
    left: 84,
    fontSize: FontSize.size_lg,
    textAlign: "left",
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
    color: Color.backgroundPrimary,
    position: "absolute",
  },
  login: {
    top: 159,
    color: Color.backgroundPrimary,
  },
  login1: {
    top: 190,
    color: Color.backgroundPrimary,
  },
  requestDetails1: {
    color: Color.backgroundPrimary,
  },
  requestDetails: {
    top: 834,
    left: 34,
    borderRadius: Border.br_3xs,
    backgroundColor: Color.lightgreen_100,
    width: 359,
    paddingHorizontal: Padding.p_xl,
    paddingVertical: Padding.p_lg,
    flexDirection: "row",
    position: "absolute",
  },
  requestAlertsChild: {
    marginLeft: -209,
    width: 54,
  },
  requestAlertsItem: {
    marginLeft: -121.75,
    top: 283,
    width: 61,
    justifyContent: "space-between",
    left: "50%",
  },
  requestAlertsInner: {
    marginLeft: -27.5,
    width: 50,
  },
  frameTextinput: {
    marginLeft: 55.75,
    width: 65,
  },
  frameView: {
    marginLeft: 154,
    width: 55,
  },
  requestAlertsChild1: {
    marginTop: -138,
    marginLeft: -214,
    top: "50%",
    backgroundColor: Color.red,
    width: 428,
    padding: Padding.p_sm,
    alignItems: "center",
    opacity: 0.5,
    position: "absolute",
  },
  goBackAgainChild: {
    width: 41,
    height: 22,
  },
  goBackAgain: {
    top: 20,
    left: 19,
    height: 20,
  },
  login2: {
    top: 231,
    color: Color.crimson_100,
  },
  callAtThis: {
    top: 402,
    left: 24,
    fontSize: FontSize.size_base,
    textAlign: "left",
    color: Color.backgroundPrimary,
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
    position: "absolute",
  },
  rectangleTextinput: {
    top: 434,
    left: 23,
    backgroundColor: Color.silver_200,
    width: 360,
    height: 30,
    position: "absolute",
  },
  requestAlerts: {
    backgroundColor: Color.labelPrimary,
    flex: 1,
    width: "100%",
    height: 926,
    overflow: "hidden",
  },
});

export default RequestAlerts;
