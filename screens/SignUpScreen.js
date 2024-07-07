import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, Color, FontSize, Border, Padding } from "../GlobalStyles";

const SignUpScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.signUpScreen}>
      <Text style={[styles.workside, styles.nameTypo1]}>WORKSIDE</Text>
      <View style={[styles.signUpScreenChild, styles.signPosition]} />
      <Text
        style={[
          styles.firstName,
          styles.nameTypo,
          styles.namePosition,
          styles.nameTypo1,
          styles.nameTypo2,
        ]}
      >{`First Name `}</Text>
      <TextInput
        style={[styles.signUpScreenItem, styles.signPosition]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Text
        style={[
          styles.lastName,
          styles.nameTypo,
          styles.namePosition,
          styles.nameTypo1,
          styles.nameTypo2,
        ]}
      >
        Last Name
      </Text>
      <View
        style={[styles.signUpScreenInner, styles.signUpScreenInnerPosition]}
      />
      <TextInput
        style={[styles.rectangleTextinput, styles.signUpScreenInnerPosition]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Pressable
        style={[styles.signUpButton, styles.namePosition]}
        onPress={() => navigation.navigate("Auth", { screen: "LoginScreen" })}
      >
        <Text style={[styles.login, styles.nameTypo]}>Create ACCOUNT</Text>
      </Pressable>
      <Text
        style={[
          styles.company,
          styles.nameTypo,
          styles.namePosition,
          styles.nameTypo1,
          styles.nameTypo2,
        ]}
      >
        Company
      </Text>
      <View style={[styles.rectangleView, styles.rectangleViewPosition]} />
      <TextInput
        style={[styles.signUpScreenChild1, styles.rectangleViewPosition]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Text
        style={[
          styles.cellNumber,
          styles.nameTypo,
          styles.namePosition,
          styles.nameTypo1,
          styles.nameTypo2,
        ]}
      >
        Cell Number
      </Text>
      <View style={[styles.signUpScreenChild2, styles.signChildPosition4]} />
      <TextInput
        style={[styles.signUpScreenChild3, styles.signChildPosition4]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Text style={[styles.userName, styles.passwordTypo]}>User Name</Text>
      <View style={[styles.signUpScreenChild4, styles.signChildPosition3]} />
      <Text style={[styles.userName, styles.passwordTypo]}>User Name</Text>
      <TextInput
        style={[styles.signUpScreenChild5, styles.signChildPosition3]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Text style={[styles.password, styles.passwordTypo]}>Password</Text>
      <View style={[styles.signUpScreenChild6, styles.signChildPosition2]} />
      <TextInput
        style={[styles.signUpScreenChild7, styles.signChildPosition2]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Text style={[styles.confirmPassword, styles.passwordTypo]}>
        Confirm Password
      </Text>
      <View style={[styles.signUpScreenChild8, styles.signChildPosition1]} />
      <TextInput
        style={[styles.signUpScreenChild9, styles.signChildPosition1]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
      <Pressable
        style={styles.goBackAgain}
        onPress={() => navigation.navigate("Auth", { screen: "WorksideLogin" })}
      >
        <Image
          style={styles.goBackAgainChild}
          resizeMode="cover"
          source={require("../assets/arrow-1.png")}
        />
      </Pressable>
      <Text
        style={[
          styles.email,
          styles.nameTypo,
          styles.namePosition,
          styles.nameTypo1,
          styles.nameTypo2,
        ]}
      >
        Email
      </Text>
      <View style={[styles.signUpScreenChild10, styles.signChildPosition]} />
      <TextInput
        style={[styles.signUpScreenChild11, styles.signChildPosition]}
        placeholder="Placeholder text"
        keyboardType="default"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  nameTypo1: {
    textAlign: "left",
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
  },
  signPosition: {
    width: 360,
    backgroundColor: Color.silver_200,
    left: 40,
    top: 143,
    position: "absolute",
  },
  nameTypo: {
    fontSize: FontSize.size_base,
    color: Color.backgroundPrimary,
  },
  namePosition: {
    left: 41,
    position: "absolute",
  },
  nameTypo2: {
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
    fontSize: FontSize.size_base,
    left: 41,
    textAlign: "left",
  },
  signUpScreenInnerPosition: {
    top: 227,
    width: 360,
    backgroundColor: Color.silver_200,
    left: 40,
    position: "absolute",
  },
  rectangleViewPosition: {
    top: 309,
    width: 360,
    backgroundColor: Color.silver_200,
    left: 40,
    position: "absolute",
  },
  signChildPosition4: {
    top: 393,
    width: 360,
    backgroundColor: Color.silver_200,
    left: 40,
    position: "absolute",
  },
  passwordTypo: {
    left: 42,
    fontSize: FontSize.size_base,
    textAlign: "left",
    color: Color.backgroundPrimary,
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
    position: "absolute",
  },
  signChildPosition3: {
    top: 563,
    left: 41,
    width: 360,
    backgroundColor: Color.silver_200,
    position: "absolute",
  },
  signChildPosition2: {
    top: 647,
    left: 41,
    width: 360,
    backgroundColor: Color.silver_200,
    position: "absolute",
  },
  signChildPosition1: {
    top: 739,
    left: 41,
    width: 360,
    backgroundColor: Color.silver_200,
    position: "absolute",
  },
  signChildPosition: {
    top: 480,
    width: 360,
    backgroundColor: Color.silver_200,
    left: 40,
    position: "absolute",
  },
  workside: {
    top: 50,
    left: 84,
    fontSize: FontSize.size_lg,
    color: Color.backgroundPrimary,
    textAlign: "left",
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
    position: "absolute",
  },
  signUpScreenChild: {
    height: 30,
  },
  firstName: {
    top: 111,
  },
  signUpScreenItem: {
    height: 40,
  },
  lastName: {
    top: 195,
  },
  signUpScreenInner: {
    height: 30,
  },
  rectangleTextinput: {
    height: 40,
  },
  login: {
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
  signUpButton: {
    top: 822,
    borderRadius: Border.br_3xs,
    backgroundColor: Color.lightgreen_100,
    width: 359,
    flexDirection: "row",
    paddingHorizontal: Padding.p_xl,
    paddingVertical: Padding.p_lg,
  },
  company: {
    top: 277,
  },
  rectangleView: {
    height: 30,
  },
  signUpScreenChild1: {
    height: 40,
  },
  cellNumber: {
    top: 361,
  },
  signUpScreenChild2: {
    height: 30,
  },
  signUpScreenChild3: {
    height: 40,
  },
  userName: {
    top: 531,
  },
  signUpScreenChild4: {
    height: 30,
  },
  signUpScreenChild5: {
    height: 40,
  },
  password: {
    top: 615,
  },
  signUpScreenChild6: {
    height: 30,
  },
  signUpScreenChild7: {
    height: 40,
  },
  confirmPassword: {
    top: 707,
  },
  signUpScreenChild8: {
    height: 30,
  },
  signUpScreenChild9: {
    height: 40,
  },
  goBackAgainChild: {
    width: 41,
    height: 22,
  },
  goBackAgain: {
    top: 20,
    left: 19,
    width: 61,
    height: 20,
    padding: Padding.p_md,
    position: "absolute",
  },
  email: {
    top: 447,
  },
  signUpScreenChild10: {
    height: 30,
  },
  signUpScreenChild11: {
    height: 40,
  },
  signUpScreen: {
    backgroundColor: Color.labelPrimary,
    flex: 1,
    width: "100%",
    height: 926,
    overflow: "hidden",
  },
});

export default SignUpScreen;
