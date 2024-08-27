import * as React from "react";
import { useState, useEffect } from "react";
import useDataStore from "../src/stores/DataStore";
import {
	Text,
	StyleSheet,
	View,
	Pressable,
	TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Color, Padding } from "../GlobalStyles";
import { useStateContext } from "../src/contexts/ContextProvider";
import { Icon, List, ListItem, IndexPath } from "@ui-kitten/components";
import axios from "axios";
import { format, set } from "date-fns";

const ActiveRequests = () => {
	const navigation = useNavigation();
	const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
	const [projectID, setProjectID] = useState(
		useDataStore((state) => state.currentProjectId)
	);
	const [customerName, setCustomerName] = useState(
		useDataStore((state) => state.currentCustomer)
	);
	const [projectName, setProjectName] = useState(
		useDataStore((state) => state.currentProject)
	);
	const [projectDescription, setProjectDescription] = useState(
		useDataStore((state) => state.currentProjectDesc)
	);
	const [projectRig, setProjectRig] = useState(
		useDataStore((state) => state.currentRigCompany)
	);
	const modifyRequestBidFlag = useDataStore(
		(state) => state.modifyRequestBidFlag
	);
	const setModifyRequestBidFlag = useDataStore(
		(state) => state.setModifyRequestBidFlag
	);

	//////////////////////////////////////////////////////////////

	const [disabledFlag, setDisabledFLag] = useState(true);
	const [dataModifiedFlag, setDataModifiedFlag] = useState(false);
	const { apiURL } = useStateContext();
	const [requestData, setRequestData] = useState([]);
	const [iconName, setIconName] = useState("truck-alert");

	const GetActiveRequests = async () => {
		const strAPI = `${apiURL}/api/request`;

		try {
			const response = await axios.get(strAPI);
			const requests = response.data.filter((r) => r.project_id === projectID);
			setRequestData(requests);
		} catch (error) {
			console.log("error", error);
		}
	};

	useEffect(() => {
		GetActiveRequests();
	}, []);

	useEffect(() => {
		// console.log("ActiveRequests Modify Request Bid Flag:", modifyRequestBidFlag);
		GetActiveRequests();
		setModifyRequestBidFlag(false);
	}, [modifyRequestBidFlag === true]);

	useEffect(() => {
		GetActiveRequests();
		setDataModifiedFlag(false);
	}, [dataModifiedFlag]);

	const pressHandler = (item) => {
		// setProjectID(item._id);
		// setCustomerName(item.customer);
		// setProjectName(item.projectname);
		// setProjectDescription(item.description);
		// setProjectRig(item.rigcompany);
		// Navigate to Active Requests for the selected project
	};

	const renderItemAccessory = (props) => {
		let buttonFormat = null;
		let buttonColor = null;
		let textFormat = null;
		let textColor = "text-black";
		let buttonText= null;

		if( props.selectedItem.status === "OPEN")
		{
			buttonColor = "bg-green-300";
			buttonText = "OPEN";
		}
		else if( props.selectedItem.status === "NOT-AWARDED" )
		{
			buttonColor = "bg-yellow-300";
			buttonText = "NOT-AWARDED";
		}
		else if( props.selectedItem.status === "AWARDED-WOA" )
		{
			buttonColor = "bg-blue-200";
			buttonText = "AWARDED-WOA";
		}
			else if( props.selectedItem.status === "AWARDED-A" ) {
			buttonColor = "bg-green-800";
			textColor= "text-white";
			buttonText = "AWARDED-A";
		}
		else if( props.selectedItem.status === "AWARDED-P" )
		{
			buttonColor = "bg-yellow-300";
			buttonText = "AWARDED-P";
		}
		else if( props.selectedItem.status === "IN-PROGRESS" )
		{
			buttonColor = "bg-orange-400";
			buttonText = "IN-PROGRESS";
		}
		else if( props.selectedItem.status === "CANCELED" )
		{
			buttonColor = "bg-gray-500";
			textColor= "text-white";
			buttonText = "CANCELED";
		}
		else if( props.selectedItem.status === "POSTPONED" )
			{
				buttonColor = "bg-blue-400";
				textColor= "text-white";
				buttonText = "POSTPONED";
			}
		else // COMPLETED
		{
			buttonColor = "bg-black-500";
			textColor= "text-white";
			buttonText = "COMPLETED";
		}
		buttonFormat = `${buttonColor} hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-32 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4`;
		textFormat = `${textColor} text-sm font-semibold`;

		return (
			<Pressable
				// Let's pass the selected item to the BidsScreen
				onPress={() =>
					navigation.navigate("RequestBids", {
						// callbackFunction={GetActiveRequests} // This is the callback function to update the status
						reqID: props.selectedItem._id,
					})
				}
				className={ buttonFormat }
			>
				<Text className={textFormat}>
					{/* {props.selectedItem.status === "AWARDED" ? "AWARDED" : "OPEN"} */}
					{buttonText}
				</Text>
			</Pressable>
	);
};

	// Active lightbulb-on
	// Cancelled close-circle
	// Completed checkmark-circle
	// En route truck-alert
	// Pending clock-alert

	const getIconName = (status) => {
		switch (status) {
			case "ACTIVE":
				return "lightbulb-on";
			case "CANCELLED":
				return "close-circle";
			case "COMPLETED":
				return "checkmark-circle";
			case "ENROUTE":
				return "truck-alert";
			default:
				break;
		}
		return "clock-alert";
	};

	const renderItemIcon = (props) => (
		<Icon
			{...props}
			name={getIconName(props.selectedItem.status)}
			style={{ color: "red", width: 24, height: 24 }}
		/>
	);

	const renderRequests = ({ item }) => (
		<ListItem
			style={{
				backgroundColor: item._id === selectedIndex ? "yellow" : "white",
			}}
			title={item.requestname}
			description={`${format(item.datetimerequested, "MM/dd/yyyy")} ${
				item.status
			}`}
			accessoryLeft={(props) =>
				renderItemIcon({ ...{ selectedItem: item, ...props } })
			}
			accessoryRight={(props) =>
				renderItemAccessory({ ...{ selectedItem: item, ...props } })
			}
			backgroundColor="#f9c2ff"
			onPress={(index) => {
				setDisabledFLag(false);
				setSelectedIndex(item._id);
				pressHandler(item);
			}}
		/>
	);

	return (
		<View w-full h-full>
			<View className="items-center">
				<Text>
					<Text className="text-green-500 text-2xl font-bold">WORK</Text>
					<Text className="text-black text-2xl font-bold">SIDE</Text>
				</Text>
				<Text className="text-black text-xl font-bold">
					{projectID === null ? "No Project Selected" : projectName}
				</Text>
				<Text className="text-black text-xl font-bold">{projectRig}</Text>
			</View>
			{requestData.length === 0 ? (
				<View className="items-center p-2">
					<Text className="text-red-500 text-xl font-bold">
						NO ACTIVE REQUESTS
					</Text>
				</View>
			) : (
				<List
					style={{ maxHeight: 500 }}
					data={requestData}
					renderItem={renderRequests}
				/>
			)}
			{/* //////////////////////////////////////////////////////////////////// */}
			{/* Format View for Buttons */}
			{/* //////////////////////////////////////////////////////////////////// */}
			<View
				style={{
					marginLeft: 0,
					top: 550,
					width: "100%",
					height: 100,
					paddingHorizontal: 0,
					paddingVertical: 10,
					justifyContent: "center",
					alignItems: "center",
					position: "absolute",
				}}
			>
				<View
					style={{
						marginTop: 10,
						padding: Padding.p_2xs,
						alignItems: "center",
					}}
				>
					<TouchableOpacity
						disabled={disabledFlag}
						className={
							disabledFlag
								? "bg-gray-300 p-1 rounded-lg w-56 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
								: "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-56 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
						}
						onPress={() => (
							// console.log("Request ID:", selectedIndex),
							navigation.navigate("RequestDetails", { reqID: selectedIndex })
						)}
					>
						<Text className="text-xl font-bold text-black">
							Request Details
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={{
						marginTop: 10,
						padding: Padding.p_2xs,
						alignItems: "center",
					}}
				>
					<TouchableOpacity
						className={
							"bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-56 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
						}
						onPress={() => navigation.navigate("NewRequest")}
					>
						<Text className="text-xl font-bold text-black">New Request</Text>
					</TouchableOpacity>
				</View>
				{/* Refresh Button */}
				{/* <View
          style={{
            marginTop: 10,
            padding: Padding.p_2xs,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg items-center justify-center border-2 border-solid border-black border-r-4 border-b-4 h-12 w-12"
            }
            onPress={() => setDataModifiedFlag(true)}
          >
            <Icon
              name={"restore"}
              style={{ color: "black", width: 16, height: 16 }}
            />
          </TouchableOpacity>
        </View> */}
			</View>
			{/* //////////////////////////////////////////////////////////////////// */}
		</View>
	);
};

export default ActiveRequests;
