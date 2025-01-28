import * as React from "react";
import { useState, useEffect, useRef } from "react";
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
import Toast from "react-native-toast-message";
import useUserStore from "../src/stores/UserStore";

import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import useDataStore from "../src/stores/DataStore";
import {
	GetAllRequestsByProject,
	GetProducts,
	GetSupplierProductsByProduct,
	SaveNewRequest,
} from "../src/api/worksideAPI";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const NewRequest = () => {
	const queryClient = useQueryClient();
	// TODO set disabled flag if minimum data is not provided
	const [disabledFlag, setDisabledFLag] = useState(false);
	//////////////////////////////////////////////////////////////
	const [projectID] = useState(
		useDataStore((state) => state.currentProjectId)
	);
	const [customerName] = useState(
		useDataStore((state) => state.currentCustomer)
	);
	const [projectName] = useState(
		useDataStore((state) => state.currentProject)
	);
	const [projectRig] = useState(
		useDataStore((state) => state.currentRigCompany)
	);
	const userId = useUserStore((state) => state.userID);

	const linkedReqRef = useRef(null);

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
	const [selectedLinkID, setSelectedLinkID] = useState(null);
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

	const [selectedRadio, setSelectedRadio] = useState(1);
	const [msaRequest, setMSARequest] = useState(true);
	const [openRequest, setOpenRequest] = useState(false);
	const [reqType, setReqType] = useState("MSA");
	const { apiURL } = useStateContext();
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

		// Get the project data
	const { data: allRequestData } = useQuery({
		queryKey: ["allRequests"],
		queryFn: () => GetAllRequestsByProject(projectID),
		refetchInterval: 1000 * 60,	// 1 minute
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		staleTime: 1000 * 60,	// 1 minute
		retry: 3,
	});

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

	const GetProductsAndFilter = async () => {
		const products = await GetProducts();

		if (products?.data === null) {
			Alert.alert("No Products Found!");
			return;
		}
		setAllProducts(products?.data);
		const cats = [...new Set(products?.data.map((p) => p.categoryname))];
		setAllCategories(cats);
	};

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

		const category = selectedCategory;
		const product = selectedProduct;
		const suppliers = await GetSupplierProductsByProduct( category, product );
		const filteredSuppliers = suppliers?.data.filter((s) => {
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
		GetProductsAndFilter();
		// GetSuppliers();
	}, []);

	const FilterProducts = (selectedItem) => {
		const products = allProducts.filter((p) => p.categoryname === selectedItem);
		const productList = [...new Set(products.map((p) => p.productname))];
		setFilteredProducts(productList);
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

	const SendRequestEmail = async () => {
		const strAPI = `${apiURL}/api/email/`;

		await axios
			.post(strAPI, {
				emailAddress: emailAddress,
				emailSubject: emailSubject,
				emailReqDateTime: emailReqDateTime,
				emailMessage: emailBody,
			})
			.then((response) => {
				Toast.show({
					type: "success",
					text1: "Workside Software",
					text2: "Suppliers Notified Via Email",
					visibilityTime: 3000,
					autoHide: true,
				});
			})
			.catch((error) => {
				Toast.show({
					type: "error",
					text1: "Workside Software",
					text2: `Error Sending Email:  + ${error}`,
					visibilityTime: 3000,
					autoHide: true,
				});
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
			comment: comment,
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
		const selectedVendorType =
			selectedRadio === 1 ? "MSA" : selectedRadio === 2 ? "OPEN" : "SSR";
		const datetimerequested = new Date();

		if (projectID === null) {
				Toast.show({
					type: "error",
					text1: "Workside Software",
					text2: `Invalid Project ID: ${projectID}`,
					visibilityTime: 3000,
					autoHide: true,
				});
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
			comment: comment,
			vendortype: selectedVendorType,
			vendorName: selectedSupplier,
			ssrVendorId: selectedRadio === 3 ? selectedSupplierID : null,
			datetimerequested: reqDateTime,
			reqlinkname: selectedLink,
			reqlinkid: selectedLinkID,
			//////////////////////////////}}////////////////
			status: "OPEN",
			statusdate: datetimerequested,
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

		// if (emptyFields.length > 0) {
		//   Alert.alert("Please fill in all required fields!");
		//   console.log("Empty Fields: ", emptyFields);
		//   return false;
		// }
		// //////////////////////////////////////////////
		const newRequest= await SaveNewRequest(reqData);
	
		if( newRequest !== null) {
			SendRequestEmail();
			queryClient.invalidateQueries("allRequests");
		};

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

	// const DismissKeyboard = ({ children }) => (
	// 	<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
	// 		{children}
	// 	</TouchableWithoutFeedback>
	// );

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
								onChangeQuantity(text);
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
							className={"bg-green-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-20 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"}
							style={{ textAlignVertical: "top" }}
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
							</TouchableOpacity>
						</View>
				{showDatePicker && (
					<DateTimePicker
						value={reqDateTime}
						mode="date"
						is24Hour={true}
						minimumDate={new Date()}
						onChange={onChange}
					/>
				)}
				{showTimePicker && (
					<DateTimePicker
						value={reqDateTime}
						mode="time"
						is24Hour={true}
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
						<View className="flex-row justify-center pt-0 gap-4 items-center w-full">

				<Select 
					style={{
						width: "65%",
						height: 45,
						borderRadius: 5,
						borderWidth: 1,
						fontFamily: FontFamily.workSansSemibold,
						fontWeight: "700",
						borderColor: "lightgray",
						backgroundColor: Color.silver_200,
					}}
					placeholder={"No Link"}
					searchPlaceholder={"Select Request"}
					selectedIndex={selectedLinkIndex}
					value={selectedLink}
					onSelect={(index) => {
						setSelectedLinkIndex(index);
						setModifyFlag(true);
					}}
					ref= {linkedReqRef}
				>
					{ allRequestData?.data.map((item) => {
						return (
							<SelectItem
								key={item.requestname} // Replace with a unique identifier from the item object
								title={item.requestname}
                    onPress={() => {
											linkedReqRef.current.clear();
											setSelectedLink(item.requestname);
											setSelectedLinkID(item._id);
                    }}
							/>
						);
					})}
				</Select>
						<TouchableOpacity
							className={
								"bg-green-200 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-[20%] items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
							}
							onPress={() => {
                setSelectedLink("");
								setSelectedLinkID(null);
							}}
						>
							<Text
								style={{ fontSize: hp(1.6) }}
								className="text-black font-bold"
							>
								Clear
							</Text>
						</TouchableOpacity>
					</View>
				{/* </View> */}
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
					<Text className="text-base font-bold text-black">Save Request</Text>
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
