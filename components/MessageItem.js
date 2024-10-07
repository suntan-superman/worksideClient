import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function MessageItem({ message, currentUserId }) {
	if (currentUserId === message?.userId) {
		return (
			<View style={styles.container}>
				<Text style={styles.rightAlignedTimeStamp}>
					{message?.createdAt.toDate().toLocaleString()}
				</Text>
				<Text style={styles.rightAlignedText}>{message?.text}</Text>
			</View>
		);
	}
	return (
		<View style={styles.container}>
			<Text style={styles.leftAlignedTimeStamp}>
				{message?.createdAt.toDate().toLocaleString()}
			</Text>
			<Text style={styles.leftAlignedText}>{message?.text}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1, // Ensures the view takes up the full height of the screen
		justifyContent: "center", // Centers the content vertically
		padding: 4, // Adds padding to the view
		marginRight: 4,
		marginLeft: 4,
	},
	rightAlignedText: {
		color: "green",
		fontSize: hp(1.9),
		textAlign: "right", // Aligns the text to the right
		width: "100%", // Ensures the text spans the full width of the container
	},
	rightAlignedTimeStamp: {
		fontSize: hp(1.0),
		fontWeight: "600",
		textAlign: "right", // Aligns the text to the right
		width: "100%", // Ensures the text spans the full width of the container
	},
	leftAlignedText: {
		color: "red",
		fontSize: hp(1.9),
		textAlign: "left", // Aligns the text to the right
		width: "100%", // Ensures the text spans the full width of the container
	},
	leftAlignedTimeStamp: {
		fontSize: hp(1.0),
		fontWeight: "600",
		textAlign: "left", // Aligns the text to the right
		width: "100%", // Ensures the text spans the full width of the container
	},
});
