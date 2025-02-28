import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
	Platform,
	Text,
	TextInput,
	StyleSheet,
	View,
	TouchableOpacity,
	Alert,
	ScrollView,
	ActivityIndicator,
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
import { sendRequestNotifications } from "../src/utils/notification-service";
import {
	GetAllRequestsByProject,
	GetProducts,
	GetSupplierProductsByProduct,
	SaveNewRequest,
	getRequestTemplates,
	createRequestTemplate,
	GetAllSupplierGroupData,
	GetSupplierIDFromName,
} from "../src/api/worksideAPI";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BottomModal } from "react-native-modals";

const NewRequest = () => {
	const queryClient = useQueryClient();
	// TODO set disabled flag if minimum data is not provided
	const [disabledFlag, setDisabledFLag] = useState(false);
	//////////////////////////////////////////////////////////////
	const [projectID] = useState(useDataStore((state) => state.currentProjectId));
	const [customerName] = useState(
		useDataStore((state) => state.currentCustomer),
	);
	const [projectName] = useState(useDataStore((state) => state.currentProject));
	const [projectRig] = useState(
		useDataStore((state) => state.currentRigCompany),
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
		getRoundedDate(15, new Date()),
	);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [allCategories, setAllCategories] = useState([]);
	const [allProducts, setAllProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedProduct, setSelectedProduct] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [defaultQuantity, setDefaultQuantity] = useState(1);
	// const [strQuantity, setStrQuantity] = useState("1");
	const [comment, setComment] = useState("");
	const [selectedSupplier, setSelectedSupplier] = useState("");
	const [selectedSupplierID, setSelectedSupplierID] = useState(null);
	const [selectedLink, setSelectedLink] = useState([]);
	const [selectedLinkID, setSelectedLinkID] = useState(null);
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(
		new IndexPath(0),
	);
	const [selectedProductIndex, setSelectedProductIndex] = useState(
		new IndexPath(0),
	);
	const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(
		new IndexPath(0),
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
		"Workside Request Notification",
	);
	const [emailReqDateTime, setEmailReqDateTime] = useState(new Date());
	const [emailBody, setEmailBody] = useState(
		"Please review the Workside request and respond accordingly!",
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
		refetchInterval: 1000 * 60, // 1 minute
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		staleTime: 1000 * 60, // 1 minute
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
					],
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
				"Please select a Category and Product before selecting a Vendor!",
			);
			setSelectedRadio(1);
			return;
		}

		const category = selectedCategory;
		const product = selectedProduct;
		const response = await GetSupplierProductsByProduct(category, product);
		const suppliers = response.data;
		const filteredSuppliers = suppliers?.filter((s) => {
			if (s.category === selectedCategory && s.product === selectedProduct) {
				return true;
			}
			return false;
		});
		if (filteredSuppliers?.length === 0) {
			Alert.alert("No Sole Source Vendors/Suppliers Found!");
			setSelectedRadio(1);
		} else {
			const suppliers = [...new Set(filteredSuppliers?.map((s) => s.supplier))];
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
		setModifyFlag(true);

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

	function getEmailAddresses(data) {
	  return data.map(item => {
	    // Use a regex to extract the email between parentheses
	    const match = item.label.match(/\(([^)]+)\)/);
	    return match ? match[1] : null;
	  });
	}

	const SendRequestEmail = async (emailList) => {
  // Check if emailList is empty or not provided
  if (!emailList || emailList.length === 0) {
    Toast.show({
      type: "info",
      text1: "Workside Software",
      text2: "No email addresses provided",
      visibilityTime: 3000,
      autoHide: true,
    });
    return;
  }

  const strAPI = `${apiURL}/api/email/`;

  console.log("Email Info:", {
    address: emailList,
    subject: emailSubject,
    dateTime: emailReqDateTime,
    body: emailBody,
  });

  try {
    // Send email for each email address concurrently
    await Promise.all(
      emailList.map((emailAddress) =>
        axios.post(strAPI, {
          emailAddress: emailAddress,
          emailSubject: emailSubject,
          emailReqDateTime: emailReqDateTime,
          emailMessage: emailBody,
        })
      )
    );

    Toast.show({
      type: "success",
      text1: "Workside Software",
      text2: "Suppliers Notified Via Email",
      visibilityTime: 3000,
      autoHide: true,
    });
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Workside Software",
      text2: `Error Sending Email: ${error}`,
      visibilityTime: 3000,
      autoHide: true,
    });
    console.error(error);
  }
};


/**
 * Returns a list of user objects whose parent group contains a category matching the given label.
 *
 * @param {string} category - The category label to match (e.g., "Downhole").
 * @param {Array} dataset - The array of supplier objects.
 * @returns {Array} - An array of user objects or an empty array if no match is found.
 */
function getUsersByCategory(category, dataset) {
  // Initialize an array to hold matching user objects
  let users = [];
  // Iterate over each supplier in the dataset
  for (const supplier of dataset) {
    // Ensure the supplier has children (groups)
    if (supplier.children && Array.isArray(supplier.children)) {
      // Iterate over each group within the supplier
      for (const group of supplier.children) {
        if (group.children && Array.isArray(group.children)) {
          // Look for a "group-category" node that contains a category with a matching label
          const hasMatchingCategory = group.children.some(child => {
            if (child.type === "group-category" && child.children && Array.isArray(child.children)) {
              return child.children.some(cat => cat.type === "category" && cat.label === category);
            }
            return false;
          });

          // If a matching category is found in this group, find the "group-user" node
          if (hasMatchingCategory) {
            const userNode = group.children.find(child => child.type === "group-user" && child.children && Array.isArray(child.children));
            if (userNode) {
              // Filter the children of the user node to ensure type === "user"
              const matchedUsers = userNode.children.filter(user => user.type === "user");
              // Append the matched users to the overall users array
              users = users.concat(matchedUsers);
            }
          }
        }
      }
    }
  }

  return users;
}

/**
 * Returns a list of user objects for a given supplier if the supplier has a group
 * that contains a category with the given label.
 *
 * @param {string} supplierId - The supplier id to search for (e.g., "Baker Hughes").
 * @param {string} categoryLabel - The label of the category to filter by (e.g., "Frac Truck").
 * @param {Array} dataset - The array of supplier objects.
 * @returns {Array} - A list of user objects, or an empty array if none are found.
 */
function getUsersBySupplierAndCategory(supplierId, categoryLabel, dataset) {
  // Find the supplier with the matching id
	// console.log("Dataset: ", JSON.stringify(dataset, null, 2));
  const supplier = dataset.find(item => item.id === supplierId);
  if (!supplier || !supplier.children) return [];

  // Loop through each group in the supplier's children
  for (const group of supplier.children) {
    if (!group.children) continue;

    // Check if this group has a "group-category" child with a category that matches the label.
    const hasMatchingCategory = group.children.some(child => {
      if (child.type === "group-category" && Array.isArray(child.children)) {
        return child.children.some(cat => cat.type === "category" && cat.label === categoryLabel);
      }
      return false;
    });

    // If the group contains the matching category, find the sibling group-user node
    if (hasMatchingCategory) {
      const groupUser = group.children.find(child => child.type === "group-user" && Array.isArray(child.children));
      if (groupUser) {
        // Return the list of users (ensure we only return items with type "user")
        return groupUser.children.filter(user => user.type === "user");
      }
    }
  }
  
  // If no matching group or users are found, return an empty array
  return [];
}

	const ValidateData = async () => {
		const selectedVendorType =
			selectedRadio === 1 ? "MSA" : selectedRadio === 2 ? "OPEN" : "SSR";
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
		let userDistList = [];
		let localSupplierName = null;
		let localSupplierID = null;

		if (selectedRadio === 3) {
			const data = await GetSupplierIDFromName(selectedSupplier);
			if(data?.length > 0) {
				localSupplierName= selectedSupplier;
				localSupplierID= data[0]?.data?._id;
				setSelectedSupplierID(data[0]?.data?._id);
			}
		}

		//////////////////////////////////////////////////////
		// Need to test getting the SSR vendor email addresses
		if(selectedRadio !== 3) {
			const supplierGroupData = await GetAllSupplierGroupData();
			userDistList = getUsersByCategory(selectedCategory, supplierGroupData?.data);
			// console.log("Users: ", JSON.stringify(userDistList, null, 2));
		}
		// Need to test getting the SSR vendor email addresses
		if(selectedRadio === 3) {
			const supplierGroupData = await GetAllSupplierGroupData();
			userDistList = getUsersBySupplierAndCategory(selectedSupplier, selectedCategory, supplierGroupData?.data);
			// console.log("Users: ", JSON.stringify(userDistList, null, 2));
		}
		//////////////////////////////////////////////////////


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
			vendorName: localSupplierName,
			ssrVendorId: localSupplierID,
			// vendorName: selectedSupplier,
			// ssrVendorId: selectedRadio === 3 ? selectedSupplierID : null,
			datetimerequested: reqDateTime,
			reqlinkname: selectedLink.length > 0 ? selectedLink : null,
			reqlinkid: selectedLinkID,
			//////////////////////////////}}////////////////
			status: selectedRadio === 3 ? "SSR-REQ" : "OPEN",
			// status: selectedRadio === 3 ? "AWARDED-WOA" : "OPEN",
			statusdate: datetimerequested,
			project_id: projectID,
		};		
		// //////////////////////////////////////////////
		const newRequest = await SaveNewRequest(reqData);

		if (newRequest !== null) {
			const emailList = getEmailAddresses(userDistList);
			if( Platform.OS !== "android") {
				sendRequestNotifications(emailList, "New Request", "A new request has been created", apiURL);
			}
			SendRequestEmail(selectedRadio === 3 ? emailList : null);
			queryClient.invalidateQueries("allRequests");
		}

		return true;
	};

	const SubmitNewRequest = async () => {
		// TODO - Add Passcode Verification
		/////////////////////////////////////////////////////////////////////
		// Validate Data
		const isValid = await ValidateData();
		if (!isValid) return;
		/////////////////////////////////////////////////////////////////////
		// Save Data to Database
		await SaveData();
		setModifyFlag(false);
		/////////////////////////////////////////////////////////////////////
		navigation.navigate("ActiveRequests");
	};

	// const DismissKeyboard = ({ children }) => (
	// 	<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
	// 		{children}
	// 	</TouchableWithoutFeedback>
	// );

	const [isTemplateModalVisible, setTemplateModalVisible] = useState(false);

	// Add state for templates
	const [templates, setTemplates] = useState([]);
	const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
	const [templateError, setTemplateError] = useState("");

	// Add function to fetch templates
	const fetchTemplates = useCallback(async () => {
		setIsLoadingTemplates(true);
		try {
			// const userId = useUserStore((state) => state.userID);
			const userId = "679d76fde33b65f7d45013e4";
			const response = await getRequestTemplates(userId);
			if (response.error) {
				throw new Error(response.error);
			}
			const templatesData = response.data || [];
			setTemplates(templatesData);

			// Only show modal if templates exist
			setTemplateModalVisible(templatesData?.length > 0);
		} catch (error) {
			console.error("Error fetching templates:", error);
			setTemplateError("Failed to load templates");
			// Don't show modal if there's an error
			setTemplateModalVisible(false);
		} finally {
			setIsLoadingTemplates(false);
		}
	}, [userId]);

	// Add useEffect to handle initial load
	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	const handleTemplateSelection = useCallback(
		async (template) => {
			// Set category and product first
			setSelectedCategory(template.category);
			const categoryIndex = allCategories.findIndex(
				(c) => c === template.category,
			);
			if (categoryIndex >= 0) {
				setSelectedCategoryIndex(new IndexPath(categoryIndex));
			}

			// Filter and set products
			FilterProducts(template.category);
			setSelectedProduct(template.product);
			const productIndex = filteredProducts?.findIndex(
				(p) => p === template.product,
			);
			if (productIndex >= 0) {
				setSelectedProductIndex(new IndexPath(productIndex));
			}

			// Set other fields first
			setComment(template.comment);
			// Properly set quantity from template
			if (template.quantity && Number.isInteger(template.quantity)) {
				setQuantity(template.quantity);
				setDefaultQuantity(template.quantity);
			} else {
				setQuantity(1);
				setDefaultQuantity(1);
			}
			setModifyFlag(true);

			// Handle vendor type after category and product are set
			const handleVendorType = async () => {
				switch (template.preferredVendorType) {
					case "MSA":
						setSelectedRadio(1);
						setMSARequest(true);
						setOpenRequest(false);
						setReqType("MSA");
						break;
					case "OPEN":
						setSelectedRadio(2);
						setMSARequest(false);
						setOpenRequest(true);
						setReqType("OPEN");
						break;
					case "SSR":
						// Get suppliers first, then set radio and vendor
						try {
							const response = await GetSupplierProductsByProduct(
								template.category,
								template.product,
							);
							const suppliers = response.data;
							const filteredSuppliers = suppliers?.filter(
								(s) =>
									s.category === template.category &&
									s.product === template.product,
							);

							if (filteredSuppliers?.length > 0) {
								const suppliersList = [
									...new Set(filteredSuppliers?.map((s) => s.supplier)),
								];
								setSupplierList(suppliersList);
								setSelectedRadio(3);

								if (template.preferredVendor) {
									setSelectedSupplier(template.preferredVendor);
									const supplierIndex = suppliersList.findIndex(
										(s) => s === template.preferredVendor,
									);
									if (supplierIndex >= 0) {
										setSelectedSupplierIndex(new IndexPath(supplierIndex));
									}
								}
								setMSARequest(false);
								setOpenRequest(false);
								setReqType("SSR");
							} else {
								// Fallback to MSA if no suppliers found
								setSelectedRadio(1);
								setMSARequest(true);
								setOpenRequest(false);
								setReqType("MSA");
							}
						} catch (error) {
							console.error("Error fetching suppliers:", error);
							setSelectedRadio(1);
							setMSARequest(true);
							setOpenRequest(false);
							setReqType("MSA");
						}
						break;
				}
			};

			await handleVendorType();
			setTemplateModalVisible(false);
		},
		[allCategories, filteredProducts],
	);

	// Add new state for save template modal
	const [isSaveTemplateModalVisible, setSaveTemplateModalVisible] =
		useState(false);
	const [newTemplateName, setNewTemplateName] = useState("");

	// Update handleSaveTemplate function
	const handleSaveTemplate = useCallback(async () => {
		try {
			if (!newTemplateName.trim()) {
				setTemplateError("Template name is required");
				return;
			}

			// Check for unique name in current templates
			const existingTemplate = templates.find(
				(t) => t.name.toLowerCase() === newTemplateName.toLowerCase(),
			);
			if (existingTemplate) {
				setTemplateError("Template name already exists");
				return;
			}

			const templateData = {
				name: newTemplateName,
				description: `${selectedCategory} - ${selectedProduct} template`,
				category: selectedCategory,
				product: selectedProduct,
				comment: comment,
				quantity: quantity,
				preferredVendorType:
					selectedRadio === 1 ? "MSA" : selectedRadio === 2 ? "OPEN" : "SSR",
				preferredVendor: selectedRadio === 3 ? selectedSupplier : null,
				createdBy: userId,
			};

			const response = await createRequestTemplate(templateData);

			if (response.error) {
				throw new Error(response.error);
			}

			setSaveTemplateModalVisible(false);
			setNewTemplateName("");
			setTemplateError("");

			// Refresh templates list
			await fetchTemplates();

			Toast.show({
				type: "success",
				text1: "Template Saved",
				text2: "Your template has been saved successfully",
				visibilityTime: 3000,
				autoHide: true,
			});
		} catch (error) {
			setTemplateError(error.message || "Failed to save template");
			console.error("Save template error:", error);
		}
	}, [
		newTemplateName,
		selectedCategory,
		selectedProduct,
		comment,
		quantity,
		selectedRadio,
		selectedSupplier,
		userId,
		templates,
		fetchTemplates,
	]);

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
			<View className="flex-row justify-around top-0 gap-5 w-full">
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
					top: 5,
					gap: 20,
					width: "100%",
					paddingHorizontal: 20,
				}}
			>
				<Select
					style={{
						width: wp("42%"),
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
						width: wp("42%"),
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
					{filteredProducts?.map((item) => {
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
				<View className="justify-start pt-2 w-[90%]">
					<Text style={{ fontSize: hp(1.6) }} className="text-black font-bold">
						Quantity
					</Text>
					<TextInput
						defaultValue={defaultQuantity.toString()}
						// value={requestQty}
						className="bg-green-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
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
					<Text style={{ fontSize: hp(1.6) }} className="text-black font-bold">
						Comments
					</Text>
					<TextInput
						value={comment}
						className={
							"bg-green-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-16 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
						}
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
			<View className="flex-start justify-center items-center w-full px-5 mt-0">
				<View className="w-full border-2 border-gray-300 rounded-lg p-1 bg-gray-100">
					<Text className="text-black text-base font-bold mb-0">
						Preferred Vendor
					</Text>

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
									{selectedRadio === 1 ? <View style={styles.radioBg} /> : null}
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
									{selectedRadio === 2 ? <View style={styles.radioBg} /> : null}
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
									{selectedRadio === 3 ? <View style={styles.radioBg} /> : null}
									<Text style={styles.radioText}>SSR</Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>

					{/* SSR Vendor Selection - moved inside the group box */}
					{selectedRadio === 3 && (
						<View className="pt-0 w-full">
							<Select
								style={{
									height: 45,
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
								{supplierList?.map((item) => (
									<SelectItem
										key={item}
										title={item}
										onPress={() => {
											setSelectedSupplier(item);
										}}
									/>
								))}
							</Select>
						</View>
					)}
				</View>
			</View>
			{/* ////////////////////////////////////////////////////////////////////// */}

			{/********************************************************** */}
			{/* Date/Time Required Field */}
			{/********************************************************** */}
			<View className="flex-start justify-center items-center">
				<View className="justify-start pt-1 w-[90%]">
					<Text style={{ fontSize: hp(1.6) }} className="text-black font-bold">
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
							"bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-[20%] items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
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
							"bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-[20%] items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
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
				<View className="flex-start pt-0 w-[90%]">
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
						ref={linkedReqRef}
					>
						{allRequestData?.data.map((item) => {
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
							"bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-[20%] items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
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
			<View style={{ alignItems: "center", paddingTop: 10 }}>
				<TouchableOpacity
					className={
						disabledFlag
							? "bg-gray-400 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
							: "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					}
					disabled={disabledFlag}
					onPress={() => SubmitNewRequest()}
				>
					<Text className="text-base font-bold text-black">Save Request</Text>
				</TouchableOpacity>
			</View>

			<View style={{ alignItems: "center", paddingTop: 10 }}>
				<TouchableOpacity
					className="bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
					onPress={() => setSaveTemplateModalVisible(true)}
				>
					<Text className="text-base font-bold text-black">Save Template</Text>
				</TouchableOpacity>
			</View>

			<BottomModal
				visible={isTemplateModalVisible}
				onTouchOutside={() => setTemplateModalVisible(false)}
				height={0.5}
				width={1}
				onSwipeOut={() => setTemplateModalVisible(false)}
			>
				<View className="flex-1 p-4">
					<Text className="text-xl font-bold mb-4">Select a Template</Text>

					{isLoadingTemplates ? (
						<View className="flex-1 justify-center items-center">
							<ActivityIndicator size="large" color="#0000ff" />
							<Text className="mt-2">Loading templates...</Text>
						</View>
					) : templateError ? (
						<View className="flex-1 justify-center items-center">
							<Text className="text-red-500">{templateError}</Text>
						</View>
					) : (
						<ScrollView
							className="flex-1 mb-4"
							showsVerticalScrollIndicator={true}
							indicatorStyle="black"
						>
							<View className="gap-3">
								{templates?.map((template) => (
									<TouchableOpacity
										key={template._id}
										className="bg-green-300 p-3 rounded-lg border-2 border-black border-r-4 border-b-4"
										onPress={() => handleTemplateSelection(template)}
									>
										<Text className="text-black font-bold">
											{template.name}
										</Text>
										<Text className="text-gray-600">{template.comment}</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
					)}

					<TouchableOpacity
						className="bg-gray-200 p-3 rounded-lg border-2 border-black border-r-4 border-b-4"
						onPress={() => setTemplateModalVisible(false)}
					>
						<Text className="text-black font-bold text-center">
							Start Without Template
						</Text>
					</TouchableOpacity>
				</View>
			</BottomModal>

			<BottomModal
				visible={isSaveTemplateModalVisible}
				onTouchOutside={() => setSaveTemplateModalVisible(false)}
				height={0.6}
				width={1}
				onSwipeOut={() => setSaveTemplateModalVisible(false)}
			>
				<View className="flex-1 p-4">
					<Text className="text-xl font-bold mb-4">Save as Template</Text>

					<View className="mb-4">
						<Text className="text-black font-bold mb-2">Template Name</Text>
						<TextInput
							value={newTemplateName}
							onChangeText={setNewTemplateName}
							className="bg-gray-100 p-3 rounded-lg border-2 border-black border-r-4 border-b-4"
							placeholder="Enter template name"
						/>
						{templateError ? (
							<Text className="text-red-500 text-sm mt-1">{templateError}</Text>
						) : null}
					</View>

					<View className="mb-4">
						<Text className="text-black font-bold mb-2">Template Details</Text>
						<View className="bg-gray-100 p-3 rounded-lg">
							<Text>Category: {selectedCategory}</Text>
							<Text>Product: {selectedProduct}</Text>
							<Text>Quantity: {quantity}</Text>
							<Text>Comments: {comment}</Text>
							<Text>
								Vendor Type:{" "}
								{selectedRadio === 1
									? "MSA"
									: selectedRadio === 2
										? "OPEN"
										: "SSR"}
							</Text>
							{selectedRadio === 3 && (
								<Text>Preferred Vendor: {selectedSupplier}</Text>
							)}
						</View>
					</View>

					<View className="flex-row justify-end gap-3">
						<TouchableOpacity
							className="bg-gray-300 p-3 rounded-lg border-2 border-black border-r-4 border-b-4"
							onPress={() => {
								setSaveTemplateModalVisible(false);
								setNewTemplateName("");
								setTemplateError("");
							}}
						>
							<Text className="text-black font-bold">Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="bg-green-300 p-3 rounded-lg border-2 border-black border-r-4 border-b-4"
							onPress={handleSaveTemplate}
						>
							<Text className="text-black font-bold">Save Template</Text>
						</TouchableOpacity>
					</View>
				</View>
			</BottomModal>
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
		fontSize: hp(1.4), // 14
		color: "black",
		fontWeight: "700",
	},
	radio: {
		width: 25,
		height: 25,
		borderColor: "black",
		borderWidth: 1,
		borderRadius: 15,
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
