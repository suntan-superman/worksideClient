import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Margin,
  FontFamily,
  FontSize,
  Color,
  Padding,
  Border,
} from "../GlobalStyles";
import Animated, {
useSharedValue,
useAnimatedStyle,
withTiming,
} from "react-native-reanimated";

const phrase = "WORKSIDE SOFTWARE";
const firstWord = "WORKSIDE";
const secondWord = "SOFTWARE";

const LetterAnimation = ({ word, delay, color, fontSize, startDelay }) => {
	const animatedValues = word.split("").map(() => useSharedValue(-50));

	useEffect(() => {
		animatedValues.forEach((value, index) => {
			setTimeout(
				() => {
					value.value = withTiming(0, { duration: 300 });   // 500
				},
				startDelay + index * delay,
			); // Delay between each letter animation
		});
	}, []);

	return (
		<View style={styles.row}>
			{word.split("").map((letter, index) => {
				const animatedStyle = useAnimatedStyle(() => {
					return {
						transform: [{ translateX: animatedValues[index].value }],
						opacity: animatedValues[index].value === 0 ? 1 : 0,
					};
				});

				return (
					<Animated.Text
						key={index}
						style={[styles.letter, { color, fontSize }, animatedStyle]}
					>
						{letter}
					</Animated.Text>
				);
			})}
		</View>
	);
};

const ShowAnimation = () => {
	const firstWordDelay = firstWord.length * 300; // Total delay after "WORKSIDE" completes
	const secondWordDelay = firstWordDelay + secondWord.length * 300; // Total delay after "SOFTWARE" completes

	return (
		<View style={styles.container}>
			{/* "WORKSIDE" in green */}
			<LetterAnimation
				word={firstWord}
				delay={300}
				color="#86EFAC"
				fontSize={54}
				startDelay={0}
			/>
			<LetterAnimation
				word={secondWord}
				delay={300}
				color="white" // black
				fontSize={40}
				startDelay={firstWordDelay}
			/>
		</View>
	);
};

const WorksideAnimation = () => {
		const navigation = useNavigation();

		useEffect(() => {
			setTimeout(() => {
				navigation.navigate("LoginScreen");
			}, 5000);
		}, []);

		return <ShowAnimation />;
	};

// const WorksideAnimation = () => {
//   const navigation = useNavigation();

//   const [isVisible, setIsVisible] = useState(true);

//   const width = new Animated.Value(0);
//   const height = new Animated.Value(0);

//   useEffect(() => {
//     Animated.timing(width, {
//       toValue: 360,
//       duration: 1200,
//       useNativeDriver: false,
//     }).start();

//     Animated.timing(height, {
//       toValue: 100,
//       duration: 1200,
//       useNativeDriver: false,
//     }).start();
//   }, []);

//   const Hide_Splash_Screen = () => {
//     setIsVisible(false);
//   };

//   useEffect(() => {
//     setTimeout(() => {
//       // setAnimating(false);
//       Hide_Splash_Screen();
//       //Check if user_id is set or not
//       //If not then send for Authentication
//       //else send to Home Screen
//       // navigation.navigate("RootDrawer");
//       // navigation.navigate("Auth");
//       navigation.navigate("LoginScreen");
//     }, 5000);
//   }, []);

//   const Splash_Screen = () => {
//     return (
//       <View style={styles.container}>
//         <Animated.Image
//           source={require("../assets/Workside.png")}
//           style={{
//             width: width,
//             height: height,
//             position: "absolute",
//           }}
//           resizeMode="cover"
//         />
//       </View>
//     );
//   };

//   const Copyright = () => {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Copyright Workside LLC 2024</Text>
//       </View>
//     );
//   };

//   //  return <>{isVisible === true ? Splash_Screen() : Copyright()}</>;
//   return <>{Splash_Screen()}</>;
// };

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		// marginTop: 100,
		alignItems: "center",
		backgroundColor: "black", // "#fff"
	},
	row: {
		flexDirection: "row",
	},
	letter: {
		fontSize: 32,
		fontWeight: "bold",
		marginHorizontal: 2, // Space between letters
	},
  // container: {
  //   flex: 1,
  //   backgroundColor: "#FFF",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // title: {
  //   fontSize: 23,
  //   fontWeight: "800",
  // },
  // spaceBlock: {
  //   paddingVertical: Padding.p_lg,
  //   paddingHorizontal: Padding.p_xl,
  //   flexDirection: "row",
  //   width: 359,
  //   borderRadius: Border.br_3xs,
  //   left: 41,
  //   position: "absolute",
  // },
  // continueButton: {
  //   top: 707,
  //   backgroundColor: Color.cornflowerblue,
  // },
  // continueButtonText: {
  //   letterSpacing: 0.5,
  //   textTransform: "uppercase",
  //   fontWeight: "600",
  //   fontFamily: FontFamily.workSansSemibold,
  //   textAlign: "center",
  //   display: "flex",
  //   alignItems: "flex-end",
  //   justifyContent: "center",
  //   width: 289,
  //   height: 31,
  // },
  // continueButtonTypo: {
  //   fontSize: FontSize.size_base,
  //   color: Color.backgroundPrimary,
  // },
});

export default WorksideAnimation;
