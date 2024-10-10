import * as React from "react";
import { useState, useEffect } from "react";
import {
	Text,
	TextInput,
	StyleSheet,
	View,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	Alert,
} from "react-native";
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, Color } from "../GlobalStyles";
import { Select, SelectItem, IndexPath } from "@ui-kitten/components";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import useUserStore from "../src/stores/UserStore";

import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import useDataStore from "../src/stores/DataStore";

let newRequestData = null;

const NewRequest = () => {
	const [disabledFlag, setDisabledFLag] = useState(false);
	//////////////////////////////////////////////////////////////
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
	const setWorksideModifyFlag = useDataStore(
		(state) => state.setWorksideModifyFlag
	);
	const userId = useUserStore((state) => state.userID);

	//////////////////////////////////////////////////////////////

	const getRoundedDate = (minutes, d = new Date()) => {
		const ms = 1000 * 60 * minutes; // convert minutes to ms
		const roundedDate = new Date(Math.round(d.getTime() / ms) * ms);

		return roundedDate;
	};

	const [reqDateTime, setReqDateTime] = useState(
		getRoundedDate(15, new Date())
	);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [allCategories, setAllCategories] = useState([]);
	const [allProducts, setAllProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedProduct, setSelectedProduct] = useState("");
	const [quantity, setQuantity] = useState(1);
	// const [strQuantity, setStrQuantity] = useState("1");
	const [comment, setComment] = useState("");
	const [selectedSupplier, setSelectedSupplier] = useState("");
	const [selectedSupplierID, setSelectedSupplierID] = useState(null);
	const [selectedLink, setSelectedLink] = useState([]);
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(
		new IndexPath(0)
	);
	const [selectedProductIndex, setSelectedProductIndex] = useState(
		new IndexPath(0)
	);
	const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(
		new IndexPath(0)
	);
	const [selectedLinkIndex, setSelectedLinkIndex] = useState(new IndexPath(0));
	const [supplierList, setSupplierList] = useState([]);
	const [emptyFields, setEmptyFields] = useState([]);
	const setModifyRequestFlag = useDataStore(
		(state) => state.setModifyRequestFlag
	);
	const [reqList, setReqList] = useState([]);

	const [selectedRadio, setSelectedRadio] = useState(1);
	const [msaRequest, setMSARequest] = useState(true);
	const [openRequest, setOpenRequest] = useState(false);
	const [reqType, setReqType] = useState("MSA");
	const { apiURL, worksideSocket } = useStateContext();
	///////////////////////////////////////////////////////
	const [emailAddress, setEmailAddress] = useState("sroy@prologixsa.com");
	const [emailSubject, setEmailSubject] = useState(
		"Workside Request Notification"
	);
	const [emailReqDateTime, setEmailReqDateTime] = useState(new Date());
	const [emailBody, setEmailBody] = useState(
		"Please review the Workside request and respond accordingly!"
	);
	///////////////////////////////////////////////////////
	const navigation = useNavigation();
	const [modifyFlag, setModifyFlag] = useState(false);
	///////////////////////////////////////////////////////////////////
	// Need this to get rid of warnings to console
	const error = console.error;
	console.error = (...args) => {
		if (/defaultProps/.test(args[0])) return;
		error(...args);
	};

	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			// Prevent Default Behavior
			e.preventDefault();
			if (modifyFlag === false) {
				navigation.dispatch(e.data.action);
			} else {
				Alert.alert(
					"Discard Changes?",
					"Are you sure you want to discard changes?",
					[
						{
							text: "Yes",
							style: "destructive",
							onPress: () => {
								setModifyFlag(false);
								navigation.removeListener("beforeRemove", () => {});
								navigation.dispatch(e.data.action);
							},
						},
						{ text: "No", style: "cancel", onPress: () => {} },
					]
				);
			}
		});
		return unsubscribe;
	}, [navigation]);

	const GetProducts = async () => {
		const strAPI = `${apiURL}/api/product`;

		try {
			const response = await axios.get(strAPI);
			setAllProducts(response.data);
			const cats = [...new Set(response.data.map((p) => p.categoryname))];
			setAllCategories(cats);
		} catch (error) {
			console.log("error", error);
		}
	};

	// const GetCategories = () => {
	//   const cats = [...new Set(allProducts.map((p) => p.categoryname))];
	//   setAllCategories(cats);
	// };

	useEffect(() => {
		const GetRequestList = async () => {
			const strAPI = `${apiURL}/api/request`;

			try {
				const response = await axios.get(strAPI);
				const requests = response.data.filter(
					(r) => r.project_id === projectID
				);
				// console.log("Requests: ", requests);
				setReqList(requests);
			} catch (error) {
				console.log("error", error);
			}
		};

		GetRequestList();
	}, []);

	const GetSuppliers = async () => {
		////////////////////////////////////////////////
		// Let's Get Vendor List for Selected Category and Product
		if (selectedCategory === "" || selectedProduct === "") {
			Alert.alert(
				"Please select a Category and Product before selecting a Vendor!"
			);
			setSelectedRadio(1);
			return;
		}

		const vendorAPI = `${apiURL}/api/supplierproductsview/byproduct`;

		const suppliers = await axios.post(vendorAPI, {
			category: selectedCategory,
			product: selectedProduct,
		});
		console.log("Suppliers: ", suppliers.data);

		const filteredSuppliers = suppliers.data.filter((s) => {
			if (s.category === selectedCategory && s.product === selectedProduct) {
				return true;
			}
			return false;
		});
		if (filteredSuppliers.length === 0) {
			Alert.alert("No Sole Source Vendors/Suppliers Found!");
			setSelectedRadio(1);
		} else {
			const suppliers = [...new Set(filteredSuppliers.map((s) => s.supplier))];
			setSupplierList(suppliers);
		}
	};

	useEffect(() => {
		GetProducts();
		// GetSuppliers();
	}, []);

	const FilterProducts = (selectedItem) => {
		const products = allProducts.filter((p) => p.categoryname === selectedItem);
		const productList = [...new Set(products.map((p) => p.productname))];
		setFilteredProducts(productList);
	};

	const hideDatePicker = () => {
		setShowDatePicker(false);
		setShowTimePicker(false);
	};

	const onChange = (e, selectedDate) => {
		const currentDate = selectedDate;
		setShowDatePicker(false);
		setShowTimePicker(false);
		setModifyFlag(true)
		
		const roundedDate = getRoundedDate(15, currentDate);
		setReqDateTime(roundedDate);
	};

	const onChangeQuantity = (text) => {
		if (+text) {
			// Allow only numbers
			const numericValue = text.replace(/[^0-9]/g, "");
			setQuantity(numericValue);
		}
	};

	const roundTime = (time, minutesToRound) => {
		let [hours, minutes] = time.split(":");
		hours = Number.parseInt(hours);
		minutes = Number.parseInt(minutes);
	
		// Convert hours and minutes to time in minutes
		const totalMinutes = hours * 60 + minutes;
	
		const rounded = Math.round(totalMinutes / minutesToRound) * minutesToRound;
		const rHr = `${Math.floor(rounded / 60)}`;
		const rMin = `${rounded % 60}`;
	
		return `${rHr.padStart(2, "0")}:${rMin.padStart(2, "0")}`;
	};

	const SendRequestEmail = () => {
		// setEmailReqDateTime(reqDateTime);
		const strAPI = `${apiURL}/api/email/${emailAddress}*${emailSubject}*${emailReqDateTime}*${emailBody}"`;

		axios
			.get(strAPI)
			.then((response) => {
				console.log("Email Sent: ", response.data);
			})
			.catch((error) => {
				console.log("Error: ", error);
			});
	};

	const SendRequestMessage = async (requestID) => {
		const strAPI = `${apiURL}/api/message/addMsg`;
		const smsMessage = `New Workside Request: ${selectedProduct} for ${quantity} units. Please review and respond accordingly!`;

		const currentUser = await AsyncStorage.getItem("userId");
		if (!currentUser) {
			return;
		}
		const targetUser = "659e0b13b8b92651f2c65fd2";

		await axios.post(strAPI, {
			from: currentUser,
			to: targetUser,
			message: smsMessage,
			projectId: projectID,
			projectName: projectName,
			requestId: requestID,
		});
	};

	const ValidateData = () => {
		const selectedVendorType =
			selectedRadio === 1 ? "MSA" : selectedRadio === 2 ? "OPEN" : "SSR";
		if (selectedRadio === 3) {
			// const selectedVendor = supplierList.find((s) => s === selectedSupplier);
			// const selectedVendorIndex = supplierList.indexOf(selectedVendor);
			// setSelectedSupplierID(selectedVendorIndex);
		}
		const reqData = {
			projectname: projectName,
			customername: customerName,
			customercontact: "Customer Contact",
			rigcompany: projectRig,
			rigcompanycontact: "Rig Contact",
			requestcategory: selectedCategory,
			requestname: selectedProduct,
			quantity: quantity,
			comments: comment,
			vendortype: selectedVendorType,
			vendorName: selectedSupplier,
			ssrVendorId: selectedSupplierID,
			datetimerequested: reqDateTime,
			status: "OPEN",
			statusdate: new Date(),
			project_id: projectID,
		};
		//////////////////////////////////////////////
		// Validate Data Fields
		//////////////////////////////////////////////
		setEmptyFields([]);
		if (!reqData.projectname) emptyFields.push("projectname");
		if (!reqData.customername) emptyFields.push("customername");
		if (!reqData.customercontact) emptyFields.push("customercontact");
		if (!reqData.rigcompany) emptyFields.push("rigcompany");
		if (!reqData.rigcompanycontact) emptyFields.push("rigcompanycontact");
		if (!reqData.requestcategory) emptyFields.push("requestcategory");
		if (!reqData.requestname) emptyFields.push("requestname");
		if (!reqData.quantity) emptyFields.push("quantity");
		// if (!reqData.comments) emptyFields.push("comments");
		if (!reqData.vendortype) emptyFields.push("vendortype");
		if (!reqData.datetimerequested) emptyFields.push("datetimerequested");
		if (!reqData.status) emptyFields.push("status");
		if (!reqData.statusdate) emptyFields.push("statusdate");
		if (!reqData.project_id) emptyFields.push("project_id");

		if (emptyFields.length > 0) {
			Toast.show({
				type: "error",
				text1: "Workside Software",
				text2: "Please fill in all required fields!",
				visibilityTime: 5000,
				autoHide: true,
			});

			// Alert.alert(
			//   "Please fill in all required fields!\nFields: ",
			//   JSON.stringify(emptyFields)
			// );
			return false;
		}
		return true;
	};

	const SaveData = async () => {
		const strAPI = `${apiURL}/api/request`;
		const selectedVendorType =
			selectedRadio === 1 ? "MSA" : selectedRadio === 2 ? "OPEN" : "SSR";
		const datetimerequested = new Date();

		if (projectID === null) {
			console.log("Project ID is NULL");
			return false;
		}
		const reqData = {
			requestorid: userId,
			projectname: projectName,
			customername: customerName,
			customercontact: "Customer Contact",
			rigcompany: projectRig,
			rigcompanycontact: "Rig Contact",
			requestcategory: selectedCategory,
			creationdate: new Date(),
			requestname: selectedProduct,
			quantity: quantity,
			comments: comment,
			vendortype: selectedVendorType,
			vendorName: selectedSupplier,
			ssrVendorId: selectedRadio === 3 ? selectedSupplierID : null,
			datetimerequested: reqDateTime,
			// TODO - Need to fix	
			// Need to fix
			// reqlinkname: null,
			// reqLinkId: null,
			// reqlinkname:
			// 	selectedLink !== 0 ? reqList(selectedLinkIndex).requestname : null,
			// reqLinkId:
			// 	selectedLinkIndex !== 0 ? reqList(selectedLinkIndex)._id : null,
			//////////////////////////////}}////////////////
			status: "OPEN",
			statusdate: datetimerequested,
			project_id: projectID,
		};

		// console.log(`Linked Request: ${selectedLink}` !== 0 ? selectedLink : null);
		// console.log(
		// 	`Linked Request ID: ${selectedLinkIndex}` !== 0
		// 		? reqList(selectedLinkIndex)._id
		// 		: null
		// );

		//////////////////////////////////////////////
		// Validate Data Fields
		//////////////////////////////////////////////
		setEmptyFields([]);
		if (!reqData.projectname) emptyFields.push("projectname");
		if (!reqData.customername) emptyFields.push("customername");
		if (!reqData.customercontact) emptyFields.push("customercontact");
		if (!reqData.rigcompany) emptyFields.push("rigcompany");
		if (!reqData.rigcompanycontact) emptyFields.push("rigcompanycontact");
		if (!reqData.requestcategory) emptyFields.push("requestcategory");
		if (!reqData.requestname) emptyFields.push("requestname");
		if (!reqData.quantity) emptyFields.push("quantity");
		// if (!reqData.comments) emptyFields.push("comments");
		if (!reqData.vendortype) emptyFields.push("vendortype");
		if (!reqData.datetimerequested) emptyFields.push("datetimerequested");
		if (!reqData.status) emptyFields.push("status");
		if (!reqData.statusdate) emptyFields.push("statusdate");
		if (!reqData.project_id) emptyFields.push("project_id");

		// if (emptyFields.length > 0) {
		//   Alert.alert("Please fill in all required fields!");
		//   console.log("Empty Fields: ", emptyFields);
		//   return false;
		// }
		// //////////////////////////////////////////////
		// console.log("Save New Request Data: ", reqData);

		const response = await fetch(strAPI, {
			method: "POST",
			body: JSON.stringify(reqData),
			headers: {
				"Content-Type": "application/json",
			},
		});

		newRequestData = await response.json();
		////////////////////////////////////////////////
		SendRequestEmail();
		if (newRequestData.data._id !== null) {
			SendRequestMessage(newRequestData.data._id);
		}
		setModifyRequestFlag(true);
		setWorksideModifyFlag(true);

		return true;
	};

	const SubmitNewRequest = () => {
		// TODO - Add Passcode Verification
		/////////////////////////////////////////////////////////////////////
		// Validate Data
		const isValid = ValidateData();
		if (!isValid) return;
		/////////////////////////////////////////////////////////////////////
		// Save Data to Database
		SaveData();
		setModifyFlag(false);
		/////////////////////////////////////////////////////////////////////
		navigation.navigate("ActiveRequests");
	};

	const DismissKeyboard = ({ children }) => (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			{children}
		</TouchableWithoutFeedback>
	);

	return (
		<View className="flex-1 bg-white">
			<View className="items-center ">
				<Text style={{ fontSize: hp(2) }} className="text-black font-bold">
					{projectName}
				</Text>
				<Text style={{ fontSize: hp(1.8) }} className="text-black font-bold">
					{projectRig}
				</Text>
			</View>

			{/********************************************************** */}
			{/* Request Dropdowns */}
			{/********************************************************** */}
			<View className="flex-row justify-around top-1 gap-5 w-full">
				<Text
					className={
						emptyFields.includes("requestcategory") === true
							? "text-red-600 text-sm font-bold"
							: "text-black text-sm font-bold"
					}
				>
					Category
				</Text>
				<Text
					className={
						emptyFields.includes("requestname") === true
							? "text-red-600 text-sm font-bold"
							: "text-black text-sm font-bold"
					}
				>
					Product
				</Text>
			</View>
			<View 
				style={{
					flexDirection: "row",
					justifyContent: "space-evenly",
					top: 10,
					gap: 20,
					width: "100%",
				}}
			>
				<Select
					style={{
						width: 175,	// 175
						height: 45,
						borderRadius: 5,
						borderWidth: 1,
						fontFamily: FontFamily.workSansSemibold,
						fontWeight: "700",
						borderColor: "lightgray",
						backgroundColor: Color.silver_200,
					}}
					placeholder={"Select Category"}
					selectedIndex={selectedCategoryIndex}
					value={selectedCategory}
					onSelect={(index) => {
						setSelectedCategoryIndex(index);
						setSelectedCategory(index);
						FilterProducts(index);
						setModifyFlag(true);
						// console.log("Selected Category Modify Flag: ", modifyFlag);
					}}
				>
					{allCategories.map((item) => {
						return (
							<SelectItem
								key={item}
								title={item}
								onPress={() => {
									setSelectedCategory(item);
									FilterProducts(item);
									setModifyFlag(true);
								}}
							/>
						);
					})}
				</Select>
				<Select
					style={{
						width: 175,	// 175
						height: 45,
						borderRadius: 5,
						borderWidth: 1,
						fontFamily: FontFamily.workSansSemibold,
						fontWeight: "700",
						borderColor: "lightgray",
						backgroundColor: Color.silver_200,
					}}
					placeholder={"Select Product"}
					selectedIndex={selectedProductIndex}
					value={selectedProduct}
					onSelect={(index) => {
						setSelectedProductIndex(index);
						setSelectedProduct(index);
						setModifyFlag(true);
						// GetSuppliers();
					}}
				>
					{filteredProducts.map((item) => {
						return (
							<SelectItem
								key={item} // Replace with a unique identifier from the item object
								title={item}
								onPress={() => {
									setSelectedProduct(item);
									setModifyFlag(true);
									// GetSuppliers();
								}}
							/>
						);
					})}
				</Select>
			</View>
				{/* ***************************************************************************** */}
				{/* Quantity Data Field */}
				{/* ***************************************************************************** */}
				<View className="flex-start justify-center items-center">
					<View className="justify-start pt-4 w-[90%]">
						<Text
							style={{ fontSize: hp(1.6) }}
							className="text-black font-bold"
						>
							Quantity
						</Text>
						<TextInput
							defaultValue="1"
							// value={requestQty}
							className="bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
							keyboardType="numeric"
							onChange={(text) => {
								updateRequestQuantity(text);
								setModifyFlag(true);
							}}
						/>
					</View>
				</View>

				{/* ***************************************************************************** */}
				{/* Comments Data Field */}
				{/* ***************************************************************************** */}
				<View className="flex-start justify-center items-center">
					<View className="justify-start pt-0 w-[90%]">
						<Text
							style={{ fontSize: hp(1.6) }}
							className="text-black font-bold"
						>
							Comments
						</Text>
						<TextInput
							value={comment}
							className={
								"bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-20 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm align-top"
							}
							keyboardType="default"
							multiline={true}
							numberOfLines={3}
							onChangeText={(newComment) => {
								setComment(newComment);
								setModifyFlag(true);
							}}
						/>
					</View>
				</View>

			{/********************************************************** */}
			{/* Preferred Vendor Field */}
			{/********************************************************** */}
			<View className="flex-row justify-start pt-0 left-5 gap-5 items-center w-full">
				<Text className="text-black text-base font-bold">Preferred Vendor</Text>
			</View>
			{/* ////////////////////////////////////////////////////////////////////// */}
			<View className="flex-row justify-evenly pt-0 items-center w-full">
				{/* MSA Radio Button */}
				<View style={styles.main}>
					<TouchableOpacity
						onPress={() => {
						  setSelectedRadio(1);
						  setModifyFlag(true);
						}}
					>
						<View style={styles.wrapper}>
							{selectedRadio !== 1 ? <View style={styles.radio} /> : null}
							{selectedRadio === 1 ? (
								<View style={styles.radioBg} />
							) : null}
							<Text style={styles.radioText}>MSA</Text>
						</View>
					</TouchableOpacity>
				</View>
				{/* Open Radio Button */}
				<View style={styles.main}>
					<TouchableOpacity
						onPress={() => {
						  setSelectedRadio(2);
						  setModifyFlag(true);
						}}
					>
						<View style={styles.wrapper}>
							{selectedRadio !== 2 ? <View style={styles.radio} /> : null}
							{selectedRadio === 2 ? (
								<View style={styles.radioBg} />
							) : null}
							<Text style={styles.radioText}>OPEN</Text>
						</View>
					</TouchableOpacity>
				</View>
				{/* Sole Source Radio Button */}
				<View style={styles.main}>
					<TouchableOpacity
						onPress={() => {
						  setSelectedRadio(3);
						  GetSuppliers();
						  setModifyFlag(true);
						}}
					>
						<View style={styles.wrapper}>
							{selectedRadio !== 3 ? <View style={styles.radio} /> : null}
							{selectedRadio === 3 ? (
								<View style={styles.radioBg} />
							) : null}
							<Text style={styles.radioText}>SSR</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
			{/* ////////////////////////////////////////////////////////////////////// */}
			{/* Show List of MSA Vendors */}
			{selectedRadio === 3 ? (
				<View className="pt-1 pb-0 left-5 gap-5 items-start w-[90%]">
					<Select
						style={{
							height: 45,
							// width: ssrWidth,
							width: "100%",
							borderRadius: 5,
							borderWidth: 1,
							fontFamily: FontFamily.workSansSemibold,
							fontWeight: "700",
							borderColor: "lightgray",
							backgroundColor: Color.silver_200,
						}}
						placeholder={"Select Supplier"}
						selectedIndex={selectedSupplierIndex}
						value={selectedSupplier}
						onSelect={(index) => {
							setSelectedSupplierIndex(index);
							setModifyFlag(true);
						}}
					>
						{supplierList.map((item) => {
							return (
								<SelectItem
									key={item} // Replace 'index' with a unique identifier from the 'item' object
									title={item}
									onPress={() => {
										setSelectedSupplier(item);
										// setSelectedSupplierID(item._id);
									}}
								/>
							);
						})}
					</Select>
				</View>
			) : null}
			{/* ////////////////////////////////////////////////////////////////////// */}

			{/********************************************************** */}
			{/* Date/Time Required Field */}
			{/********************************************************** */}
					<View className="flex-start justify-center items-center">
						<View className="justify-start pt-1 w-[90%]">
							<Text
								style={{ fontSize: hp(1.6) }}
								className="text-black font-bold"
							>
								Date Requested
							</Text>
							<TextInput
								value={reqDateTime.toLocaleString()}
								style={{ fontSize: hp(1.5) }}
								className="bg-gray-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-9 border-[1px] border-solid border-black text-black font-bold p-2 my-1 border-r-4 border-b-4"
								editable={false}
							/>
						</View>

						<View className="flex-row justify-center pt-0 gap-4 items-center w-9/10">
							<TouchableOpacity
								className={
									"bg-green-200 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-[20%] items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
								}
								onPress={() => setShowDatePicker(true)}
							>
								<Text
									style={{ fontSize: hp(1.6) }}
									className="text-black font-bold"
								>
									Date
								</Text>
								{/* <Text className="text-sm font-bold text-black">Date</Text> */}
							</TouchableOpacity>

							<TouchableOpacity
								className={
									"bg-green-200 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-[20%] items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
								}
								onPress={() => setShowTimePicker(true)}
							>
								<Text
									style={{ fontSize: hp(1.6) }}
									className="text-black font-bold"
								>
									Time
								</Text>
								{/* <Text className="text-sm font-bold text-black">Time</Text> */}
							</TouchableOpacity>
						</View>
				{showDatePicker && (
					<DateTimePicker
						value={reqDateTime}
						mode="date"
						is24Hour={true}
						// onChange={(onChange) => { onChange(); setModifyFlag(true); }}
						onChange={onChange}
					/>
				)}
				{showTimePicker && (
					<DateTimePicker
						value={reqDateTime}
						mode="time"
						is24Hour={true}
						// onChange={() => { onChange(); setModifyFlag(true); }}
						onChange={onChange}
					/>
				)}
			</View>
			{/********************************************************** */}
			{/* Link To Field */}
			{/********************************************************** */}
					<View className="flex-start justify-left items-center">
						<View className="flex-start pt-1 w-[90%]">
					<Text
						style={{ fontSize: hp(1.6) }}
						className="text-black font-bold p-1"
					>
						Link To
					</Text>
				</View>
			<View className="items-center w-full pt-0">
				<Select 
					style={{
						width: "90%",
						height: 45,
						borderRadius: 5,
						borderWidth: 2,
						fontFamily: FontFamily.workSansSemibold,
						fontWeight: "700",
						borderColor: "black",
						backgroundColor: Color.silver_200,
					}}
					placeholder={"No Link"}
					searchPlaceholder={"Select Request"}
					selectedIndex={selectedLinkIndex}
					value={selectedLink}
					onSelect={(index) => {
						setSelectedLinkIndex(index);
						setModifyFlag(true);
						console.log("Selected Link: ", index);
					}}
				>
					{reqList.map((item) => {
						return (
							<SelectItem
								key={item.requestname} // Replace with a unique identifier from the item object
								title={item.requestname}
								onPress={() => {
									// setReqList(item.requestname);
									// console.log("Selected Link: ", item);
									// setModifyFlag(true);
								}}
							/>
						);
					})}
				</Select>

				</View>
			</View>
			{/********************************************************** */}
			{/********************************************************** */}
			{/* Save Changes Button */}
			{/********************************************************** */}
			<View style={{ alignItems: "center", paddingTop: 15 }}>
				<TouchableOpacity
					className={
						disabledFlag
							? "bg-gray-400 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
							: "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					disabled={disabledFlag}
					onPress={() => SubmitNewRequest()}
				>
					<Text className="text-base font-bold text-black">Save Changes</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	main: {
		flex: 1,
		justifyContent: "space-around",
		alignItems: "center",
	},
	radioText: {
		fontSize: hp(1.4),	// 14
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

export default NewRequest;
