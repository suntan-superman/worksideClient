import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import useDataStore from "../src/stores/DataStore";
import {
	Text,
	StyleSheet,
	View,
	Pressable,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import { GlobalStyles } from "../GlobalStyles";
import { useNavigation } from "@react-navigation/native";
import { BottomSheetView, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useStateContext } from "../src/contexts/ContextProvider";
import { Icon, List, ListItem, IndexPath,	Radio, RadioGroup } from "@ui-kitten/components";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";
import { format, set } from "date-fns";

let ganttRequests = [];

const ActiveRequests = () => {
	const navigation = useNavigation();
	const filterSheetModalRef = useRef(null);
	const snapPoints = useMemo(() => ["25%", "50%", "75%", "90%"], []);
	const [filterSelectedIndex, setFilterSelectedIndex] = useState(0);
	const [filterLabel, setFilterLabel] = useState("Show All");

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
	const worksideModifyFlag = useDataStore(
		(state) => state.worksideModifyFlag
	);
	const setWorksideModifyFlag = useDataStore(
		(state) => state.setWorksideModifyFlag
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
		GeRequestFilter();
	}, []);

	useEffect(() => {
		// console.log("ActiveRequests Modify Request Bid Flag:", modifyRequestBidFlag);
		GetActiveRequests();
		setModifyRequestBidFlag(false);
		setWorksideModifyFlag(false);
	}, [modifyRequestBidFlag === true || worksideModifyFlag === true]);

	useEffect(() => {
		GetActiveRequests();
		setDataModifiedFlag(false);
		setWorksideModifyFlag(false);
	}, [dataModifiedFlag || worksideModifyFlag === true]);

	const pressHandler = (item) => {
		// setProjectID(item._id);
		// setCustomerName(item.customer);
		// setProjectName(item.projectname);
		// setProjectDescription(item.description);
		// setProjectRig(item.rigcompany);
		// Navigate to Active Requests for the selected project
	};

	const SetFilterLabel = (index) => {
		switch (index) {
			case 0:
				setFilterLabel("Show All");
				break;
			case 1:
				setFilterLabel("Show Open");
				break;
			case 2:
				setFilterLabel("Show Awarded");
				break;
			case 3:
				setFilterLabel("Show Postponed");
				break;
			case 4:
				setFilterLabel("Show Completed");
				break;
			default:
				break;
		}
	};

	const renderItemAccessory = (props) => {
		let buttonFormat = null;
		let buttonColor = null;
		let textFormat = null;
		let textColor = "text-black";
		let buttonText= null;
		
		// TODO - Need to validate proper status codes being returned
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
		buttonFormat = `${buttonColor} hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-36 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4`;
		// textFormat = `${textColor} text-xs font-semibold`;
		textFormat = `${textColor}`;

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
				<Text 
        style={GlobalStyles.activeRequestsDetailsButtonLabelStyle}
				className={textFormat}>
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

	const renderRequests = ({ item }) => {
		if (filterSelectedIndex === 1 && item.status !== "OPEN") return null;
		if (
			filterSelectedIndex === 2 &&
			item.status !== "AWARDED-WOA" &&
			item.status !== "AWARDED-A" &&
			item.status !== "AWARDED-P"
		)
			return null;
		if (filterSelectedIndex === 3 && item.status !== "POSTPONED") return null;
		if (filterSelectedIndex === 4 && item.status !== "COMPLETED") return null;

		return <ListItem
			style={{
				backgroundColor: item._id === selectedIndex ? "yellow" : "white",
			}}
			title={item.requestname}
			description={`${format(item.datetimerequested, "MM/dd/yyyy")} ${
				item.status
			}`}
			// TODO - Do we need an icon on the left and if so what should it be?
			// accessoryLeft={(props) =>
			// 	renderItemIcon({ ...{ selectedItem: item, ...props } })
			// }
			accessoryRight={(props) =>
				renderItemAccessory({ ...{ selectedItem: item, ...props } })
			}
			backgroundColor="#f9c2ff"
			onPress={(index) => {
				setDisabledFLag(false);
				setSelectedIndex(item._id);
				pressHandler(item);
			}}
		/>;
	};

	const handlePresentFilterModalPress = () => {
		filterSheetModalRef.current?.present();
	};

	const handleCloseFilterModal = () => {
		filterSheetModalRef.current?.dismiss();
	};

	const GeRequestFilter = async () => {
		await AsyncStorage.getItem("RequestFilter").then((value) => {
			// console.log("Get RequestFilter: ", Number.parseInt(value));
			if (value !== null) {
				setFilterSelectedIndex(Number.parseInt(value));
			}
		});
	};

	const SaveRequestFilter = async (value) => {
		// console.log("SaveRequestFilter: ", value);
		await AsyncStorage.setItem("RequestFilter", value.toString());
	};

	const renderFilterModal = () => {
		return (
			<>
			<View className="flex-1">
			<View className="flex-row justify-items-end justify-end gap-5 pr-2">
				<MaterialIcon
					name="close-octagon-outline"
					size={25}
					color="red"
					onPress={handleCloseFilterModal}
				/>
			</View>

				<View className="flex-start justify-center items-center">
					<Text>
						<Text className="text-green-500 text-xl font-bold">WORK</Text>
						<Text className="text-black text-xl font-bold">SIDE </Text>
						<Text className="text-black text-xl font-bold">Requests </Text>
						<Text className="text-black text-xl font-bold">Filter</Text>
					</Text>
				</View>
				{/* /////////////////////////////////////////////////////////////// */}
				{/* Outline Line */}
				<View className="flex-row items-center justify-between w-[100%] pt-1 pb-2">
					<View className="h-2 bg-green-300 flex-grow w-1/2" />
				</View>
				{/********************************************************** */}
				{/* Radio Button Group to Make Changes */}
				{/********************************************************** */}

				<View className="pt-2 pb-2 items-center">
					<RadioGroup
						selectedIndex={filterSelectedIndex}
						onChange={(index) => {
							setFilterSelectedIndex(index);
							SaveRequestFilter(index);
							SetFilterLabel(index);
							// console.log("Filter Selected Index: ", index);
						}}
					>
						<Radio status="success">Show All</Radio>
						<Radio status="success">Show Open</Radio>
						<Radio status="success">Show Awarded</Radio>
						<Radio status="success">Show Postponed</Radio>
						<Radio status="success">Show Completed</Radio>
					</RadioGroup>
				</View>
				</View>
			</>
		);
	};

const addDays = (date, days) => {
		const copy = new Date(date.getTime());
		copy.setDate(copy.getDate() + days);
		return copy;
};	

const getGanttColor = (status) => {
	if( status === "OPEN")
		{
			return "#FDE047";
		}
 if( status === "NOT-AWARDED" )
		{
			return "#FDE047";
		}
	if( status === "AWARDED-WOA" )
		{
			return "#22C55E";
		}
	if( status === "AWARDED-A" ) {
		return "#22C55E";
	}
	if( status === "AWARDED-P" )
		{
			return "#22C55E";
		}
	if( status === "IN-PROGRESS" )
		{
			return "#22C55E";
		}
	if( status === "CANCELED" )
		{
			return "#FDE047";
		}
	if( status === "POSTPONED" )
			{
				return "#FDE047";
			}
	// COMPLETED
	return "#FDE047";
};

const handleGanttChartPress = () => {
	let count = 1;
	const minDays=10;
	ganttRequests = [];

	 for (const currentRequests of requestData) {
		const startDate = new Date(currentRequests.datetimerequested);

		const details = `Request: ${currentRequests.requestname}\nStatus: ${currentRequests.status}\nDate: ${format(startDate, "yyyy/MM/dd")}`;	
		const endDate = addDays(startDate, minDays);
		const maxDate = addDays(endDate, 10);

		ganttRequests.push({
				id: count++,
				name: currentRequests.requestname,
				details: details,				
				// details: currentRequests.requestname,				
				status: currentRequests.status,
				start: format(	startDate, "yyyy-MM-dd"),
				end: format(endDate, "yyyy-MM-dd"),
				maxdate: format(maxDate, "yyyy-MM-dd"),
				color: getGanttColor(currentRequests.status),	
			});
	};

	// console.log("Gantt Chart Data: ", ganttRequests);
	navigation.navigate("GanttChart", { requests: ganttRequests });
};

	return (
		<View className="flex-1 bg-white">
			<View className="items-center">
				{/* <Text>
					<Text className="text-green-500 text-2xl font-bold">WORK</Text>
					<Text className="text-black text-2xl font-bold">SIDE</Text>
				</Text> */}
				<View className="flex justify-between items-center w-full">
					<View>
					<Text className="text-black text-xl font-bold">
						{projectID === null ? "No Project Selected" : projectName}
					</Text>
					</View>
				</View>
				<Text className="text-black text-xl font-bold">{projectRig}</Text>
			</View>
			{requestData.length === 0 ? (
				<View className="items-center p-2">
					<Text className="text-red-500 text-xl font-bold">
						NO ACTIVE REQUESTS
					</Text>
				</View>
			) : (
				<>
				<View className="flex-row justify-items-end justify-between gap-5 pr-2 pl-2 pt-1">
					<Text>
						<Text className="text-black text-sm font-bold">Filter Setting: </Text>
						<Text className="text-red-500 text-sm font-bold">{filterLabel}</Text>
					</Text>
					<TouchableOpacity
						onPress={() => {
							handlePresentFilterModalPress();
						} }
					>
						<MaterialIcon
							name="filter-variant"
							size={30} />
					</TouchableOpacity>
				</View>
					<List
						contentContainerStyle className="flex-grow"
						// style={{ maxHeight: 500 }}
						data={requestData}
						renderItem={renderRequests} />
					</>
			)}
			{/* //////////////////////////////////////////////////////////////////// */}
			{/* Format View for Buttons */}
			{/* //////////////////////////////////////////////////////////////////// */}
			<View className="flex-row justify-center gap-2.5 pb-4">
			{/* <View className="flex-row items-center justify-between gap-3 pr-3 pl-3 pb-4"> */}
				<TouchableOpacity
					disabled={disabledFlag}
					className={
						disabledFlag
							? "bg-gray-300 p-0 rounded-lg w-32 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
							: "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-32 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					onPress={() => (
						// console.log("Request ID:", selectedIndex),
						navigation.navigate("RequestDetails", { reqID: selectedIndex })
					)}
				>
					<Text
		        style={GlobalStyles.projectButtonLabelStyle}
						>
						Details
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={
						"bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-32 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					onPress={() => navigation.navigate("NewRequest")}
				>
					<Text 
					style={GlobalStyles.projectButtonLabelStyle}
					>
						New
						</Text>
				</TouchableOpacity>
				<TouchableOpacity
					disabled={requestData.length === 0}
					className={
						requestData.length === 0
							? "bg-gray-300 p-0 rounded-lg items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
							: "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					// 	className={
					// 		"bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					// }
						onPress={() => {
							handleGanttChartPress();
						} }
					>
						<MaterialIcon
							name="chart-gantt"
							size={30} />
					</TouchableOpacity>
				{/* Date/Time Modal */}
			<View>
			
				<BottomSheetModal
					ref={filterSheetModalRef}
					index={1}
					snapPoints={snapPoints}
					// onDismiss={handleCloseDateTimeModal}
				>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<BottomSheetView style={styles.contentContainer}>
							{renderFilterModal()}
						</BottomSheetView>
					</TouchableWithoutFeedback>
				</BottomSheetModal>
				</View>
			</View>
			{/* //////////////////////////////////////////////////////////////////// */}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		height: "50%", // 50%
		justifyContent: "center",
		backgroundColor: "white",
	},
	contentContainer: {
		flex: 1,
		height: "50%", // 50%
		paddingTop: 12,
		width: "100%",
		alignSelf: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "black",
		borderRadius: 10,
    // backgroundColor: "#D4D4D8",
    backgroundColor: "white",
	},
	button: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 4,
		elevation: 3,
		backgroundColor: "black",
	},
	text: {
		fontSize: 16,
		lineHeight: 21,
		fontWeight: "bold",
		letterSpacing: 0.25,
		color: "white",
	},
	main: {
		flex: 1,
		justifyContent: "space-around",
		// justifyContent: "center",
		alignItems: "center",
	},
	radioText: {
		fontSize: 14, // 16
		color: "black",
		fontWeight: "700",
	},
	radio: {
		width: 25,
		height: 25,
		borderColor: "black",
		borderRadius: 15,
		borderWidth: 3,
		margin: 10,
	},
	wrapper: {
		flexDirection: "row",
		alignItems: "center",
	},
	radioBg: {
		backgroundColor: "black",
		height: 25,
		width: 25,
		margin: 3,
		borderRadius: 15,
	},
});

export default ActiveRequests;
