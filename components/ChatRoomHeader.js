import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Toast from "react-native-toast-message";

function CallSupplier() {
    Toast.show({
        type: "info",
        text1: "Workside Software",
        text2: "Call Supplier!",
        visibilityTime: 5000,
        autoHide: true,
    });
};

export default function ChatRoomHeader({clientName, supplierName}) {
   return (
        <View style={styles.container}>
            <Text style={styles.leftText}>{supplierName}</Text>
            <TouchableOpacity onPress={CallSupplier}>
                <Text style={styles.centerText}>Call</Text>
            </TouchableOpacity>
            {/* <Text style={styles.centerText}>Call</Text> */}
            <Text style={styles.rightText}>{clientName}</Text>
        </View>    
  )
};

const styles = StyleSheet.create({
    container: {
         height: hp(3), // Set the height of the container
        flexDirection: 'row', // Align items in a row
        justifyContent: 'space-between', // Distribute space between the items
        paddingTop: 2, // Add padding for layout spacing
        paddingLeft: 4, // Add padding for layout spacing
        paddingRight: 4, // Add padding for layout spacing
        width: '100%', // Make sure the container takes the full width
    },
    leftText: {
		color: "red",
		fontSize: hp(1.9),
        textAlign: 'left', // Align the text to the left
    },
    rightText: {
		color: "green",
		fontSize: hp(1.9),
        textAlign: 'right', // Align the text to the right
    },
    centerText: {
		color: "black",
		fontSize: hp(1.9),
        textAlign: 'center', // Align the text to the left
    },
  });
