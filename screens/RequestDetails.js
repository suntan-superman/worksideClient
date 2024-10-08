import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Text,
  TextInput,
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Color } from "../GlobalStyles";
import { Select, SelectItem, IndexPath } from "@ui-kitten/components";
import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import { format, set } from "date-fns";
import useDataStore from "../src/stores/DataStore";
import useRequestStore from "../src/stores/RequestStore";
import useUserStore from "../src/stores/UserStore";
import { logTransaction } from "../src/helperFunction";
import { BottomSheetView, BottomSheetModal } from "@gorhom/bottom-sheet";
import DateTimePickerModal from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Passcode Modal
import {
	Dimensions,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
const { width, height } = Dimensions.get("window");
const OFFSET = 20;
const TIMING = 80;

const dialPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"];
const dialPadSize = width * 0.125;
const dialPadHeight = height * 0.125;
const pinLength = 6;
let numOfAttempts = 0;


// End of Passcode Modal

let modifyDialogFlag = false;

const RequestDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const id = route.params.id;

  const { reqID } = route.params;
	const { apiURL, currentUserID } = useStateContext();
  // const worksideModifyFlag = useDataStore((state) => state.worksideModifyFlag);
	const setWorksideModifyFlag = useDataStore((state) => state.setWorksideModifyFlag);
	const worksidePasscode = useUserStore((state) => state.passcode);

  const [selectedDate, setSelectedDate] = useState(new Date());
  // const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const dateTimeModalRef = useRef(null);
  const vendorModalRef = useRef(null);
  const passcodeModalRef = useRef(null);
  const [pinCode, setPinCode] = useState([]);

  const [modifyFlag, setModifyFlag] = useState(false);
  const [modalEditFlag, setModalEditFlag] = useState(false);
  const [requestType, setRequestType] = useState("");
  // Changed 2024-07-04
  const [requestQty, setRequestQty] = useState("");
  const [requestComment, setRequestComment] = useState("");
  const [requestVendor, setRequestVendor] = useState("");
  const [requestDateTime, setRequestDateTime] = useState(new Date());
  const [requestLinkTo, setRequestLinkTo] = useState("");
  const stringDateTime = new Date().toLocaleString();
  const [reqList, setReqList] = useState([]);
  const [editFlag, setEditFlag] = useState(false);
  const [allowEditFlag, setAllowEditFlag] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(new IndexPath(0));

  const [disabledFlag, setDisabledFlag] = useState(true);
  const [dateTimeRequested, setDateTimeRequested] = useState(new Date());
  const [bidAwardedFlag, setBidAwardedFlag] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const snapPoints = useMemo(() => ["25%", "50%", "75%", "90%"], []);
  const [selectedRadio, setSelectedRadio] = useState(1);
  const [msaRequest, setMSARequest] = useState(true);
  const [openRequest, setOpenRequest] = useState(false);
  const [reqType, setReqType] = useState("MSA");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
	const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedSupplierID, setSelectedSupplierID] = useState(null); 

  const [supplierList, setSupplierList] = useState([]);

  const getRoundedDate = (minutes, d = new Date()) => {
    const ms = 1000 * 60 * minutes; // convert minutes to ms
    const roundedDate = new Date(Math.round(d.getTime() / ms) * ms);

    return roundedDate;
  };
  const [modRequestDateTime, setModRequestDateTime] = useState(
    getRoundedDate(15, new Date()),
  );
  //////////////////////////////////////////////////////////////////////
  const currentSupplier = useDataStore((state) => state.currentSupplier);
  const setCurrentSupplier = useDataStore((state) => state.setCurrentSupplier);
  const currentRequestName = useDataStore((state) => state.currentRequestName);
  const setCurrentRequestName = useDataStore(
    (state) => state.setCurrentRequestName
  );
  const setModifyRequestBidFlag = useDataStore(
    (state) => state.setModifyRequestBidFlag
  );
  //////////////////////////////////////////////////////////////////////
    // Global Request Data
    const setCurrentRequest = useRequestStore((state) => state.setRequest);
    const setCurrentRequestId = useRequestStore((state) => state.setRequestId);
    const setReqArrivalTime = useRequestStore((state) => state.setReqArrivalTime);
    const setReqStatus = useRequestStore((state) => state.setReqStatus);
    
    const [worksideValidatedFlag, setWorksideValidatedFlag] = useState(false);
    const [postponedRequestFlag, setPostponedRequestFlag] = useState(false);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Prevent Default Behavior
      e.preventDefault();
      if (modifyDialogFlag === false) {
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
                modifyDialogFlag = false;
                navigation.removeListener("beforeRemove", () => { });
                navigation.dispatch(e.data.action);
              },
            },
            { text: "No", style: "cancel", onPress: () => { } },
          ]
        );
      }
    });
    return unsubscribe;
  }, [navigation]);


  const GetRequests = async () => {
    const reqURL = `${apiURL}/api/request`;
    try {
      const response = await axios.get(reqURL);
      const req = [...new Set(response.data.map((r) => r.requestname))];
      setReqList(req);
    } catch (error) {
      console.log("error", error);
    }
  };

  const [reqData, setReqData] = useState([]);

  // const setDatePicker = () => {
  //   setDatePickerVisible(true);
  // };

  // const hideDatePicker = () => {
  //   setDatePickerVisible(false);
  // };

  const handleConfirm = (date) => {
    const currentDate = date;
    setDatePickerVisible(Platform.OS === "ios");
    setSelectedDate(currentDate);

    const tempDate = new Date(currentDate);
    const fDate =
      `${tempDate.getDay()}/${tempDate.getMonth() + 1}/${tempDate.getFullYear()}`;
    const fTime =
      `Hours: ${tempDate.getHours()} | Minutes: ${tempDate.getMinutes()}`;

    setSelectedDate(date);
    // hideDatePicker();
  };

  // const showMode = (currentMode) => {
  //   setDatePickerVisible(currentMode);
  // };

  useEffect(() => {
    GetRequests();
    // GetRequestDetails();
  }, []);

  useEffect(() => {
    const GetRequestDetails = async () => {
      const reqURL = `${apiURL}/api/request/${reqID}`;
      try {
        const response = await axios.get(reqURL);
        setReqData(response.data);
        setRequestQty(response.data.quantity.toLocaleString());
        setDateTimeRequested(response.data.datetimerequested);
        if (response.data.status === "AWARDED" || response.data.status === "AWARDED-A" || response.data.status === "AWARDED-WOA") {
          setBidAwardedFlag(true);
          setAllowEditFlag(false);
        }
        setSelectedCategory(response.data.requestcategory);
        setSelectedProduct(response.data.requestname);
        setSelectedSupplierID(response.data.ssrVendorId);
        if(response.data.vendortype=== "MSA") setSelectedRadio(1);
        else if(response.data.vendortype=== "OPEN") setSelectedRadio(2);
        else setSelectedRadio(3);
  
      } catch (error) {
        console.log("error", error);
      }
    };

    GetRequestDetails();
  }, []);

  const SaveModifiedData = async () => {
		// TODO - Add Passcode Verification
    Alert.alert(
      "Save Changes?",
      "Are you sure you want to save changes?",
      [
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            SaveData();
          },
        },
        { text: "No", style: "cancel", onPress: () => { return false; } },
      ]
    );
  };

  const SaveData = async () => {
    const strAPI = `${apiURL}/api/request/${reqID}`;

    if (requestQty === "" || requestQty === null || requestQty === undefined) {
      if (requestQty.toNumber() < 1) {
        alert("Quantity must be greater than 0");
        return false;
      }
    }
  
    const statusDate= new Date();

		const selectedVendorType =
			selectedRadio === 1 ? "MSA" : selectedRadio === 2 ? "OPEN" : "SSR";
		if (selectedRadio === 3) {
			const selectedVendor = supplierList.find((s) => s === selectedSupplier);
			const selectedVendorIndex = supplierList.indexOf(selectedVendor);
			setSelectedSupplierID(selectedVendorIndex);
		}

    const newReqData = { ...reqData, 
      quantity: requestQty,
      comments: requestComment,
      vendortype: selectedVendorType,
      vendorName: selectedSupplier,
      ssrVendorId: selectedRadio === 3 ? selectedSupplierID : null,
      datetimerequested: modRequestDateTime,  // Updated Date and Time
      status: "OPEN",
      statusdate: statusDate,
    };
// console.log("New Request Data: ", newReqData);
    // const reqData = {
    //   projectname: projectName,
    //   customername: customerName,
    //   customercontact: "Customer Contact",
    //   rigcompany: projectRig,
    //   rigcompanycontact: "Rig Contact",
    //   requestcategory: selectedCategory,
    //   creationdate: new Date(),
    //   requestname: selectedProduct,
    //   quantity: quantity,
    //   comments: requestComment,
    //   vendortype: selectedVendorType,
    //   vendorName: selectedSupplier,
    //   ssrVendorId: selectedRadio === 3 ? selectedSupplierID : null,
    //   datetimerequested: modRequestDateTime,  // Updated Date and Time
    //   //////////////////////////////////////////////
    //   // Update This
    //   // reqlinkname: selectedLink,
    //   // reqLinkId: reqList(selectedLinkIndex)._id,
    //   //////////////////////////////////////////////
    //   status: "OPEN",
    //   statusdate: statusDate,
    //   project_id: projectID,
    // };

    // const newReqData = { ...reqData, quantity: requestQty };

    // console.log("Linked Request: " + selectedLink);
    // console.log("Linked Request ID: " + reqList(selectedLinkIndex)._id);

    // //////////////////////////////////////////////
		await axios
			.patch(strAPI, {
        newReqData
			})
			.then((response) => {
        // console.log( "Save Response: ", response.data );
        modifyDialogFlag = false;
        setWorksideModifyFlag(true);
        setEditFlag(false);
        // setModifyRequestBidFlag(true);
				// logTransaction(userId, table, action, result, id);
				logTransaction(
					currentUserID,
					"REQUEST",
					"UPDATE",
					reqID,
					response.status
				);
				// Notify User of Request Status Change
				// console.log("Request Updated: ", response.data);
			})
			.catch((error) => {
				console.log("Error: ", error);
			});
    ////////////////////////////////////////////////
    // SendRequestEmail();
    // if (newRequestData.data._id !== null) {
    //   SendRequestMessage(newRequestData.data._id);
    // }

    return true;
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

    const vendorAPI = `${apiURL}/api/supplierproductsview/byproduct`;

    // console.log("Selected Category: ", selectedCategory);
    // console.log("Selected Product: ", selectedProduct);
    const suppliers = await axios.post(vendorAPI, {
      category: selectedCategory,
      product: selectedProduct,
    });
    // console.log("Suppliers: ", suppliers.data);

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

  const UpdateRequestStatus = async (reqID, status) => {
    const strAPI = `${apiURL}/api/request`;
    await axios
      .patch(strAPI, {
        id: reqID,
        status: status,
      })
      .then((response) => {
        setModifyRequestBidFlag(true);
        // logTransaction(userId, table, action, result, id);
        logTransaction(
          currentUserID,
          "REQUEST",
          "UPDATE",
          reqID,
          response.status
        );
        // Notify User of Request Status Change
        // console.log("Request Updated: ", response.data);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  useEffect(() => {
    if (modifyDialogFlag === true) {
      // console.log("Modify Dialog Flag: ", modifyDialogFlag);
      setDisabledFlag(false);
    } else {
      // console.log("Modify Dialog Flag: ", modifyDialogFlag);
      setDisabledFlag(true);
    }
  } , [modifyDialogFlag]);

  const UpdateRequestBidsStatus = async (reqID, status) => {
    const strAPI = `${apiURL}/api/requestbid/updateall`;

    // if( selectedBid === null ) return;

    // console.log(
    // 	"Update Selected Request: " + reqID + " Status: " + status
    // );
    await axios
      .post(strAPI, {
        id: reqID,
        status: status,
      })
      .then((response) => {
        setModifyRequestBidFlag(true);
        // logTransaction(userID, table, action, result, id);
        logTransaction(
          currentUserID,
          "REQUESTBID",
          "UPDATE",
          reqID,
          response.status
        );
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  const ProcessPostponedRequest = (requestId) => {
    setPostponedRequestFlag(false);
    Alert.alert(
      "Postpone Request",
      "Are you sure you want to POSTPONE the Request? This cannot be reversed!",
      [
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            handlePasscodePress();
            setPostponedRequestFlag(true);
            // Set Request Status to POSTPONED
            // TODO Change Back
            // UpdateRequestStatus(requestId, "POSTPONED");
            // Set Bid Status to POSTPONED
            // TODO Change Back
            UpdateRequestBidsStatus(requestId, "POSTPONED");
            // Set Awarded Bid to FALSE
            // Email All Parties
          },
        },
        { text: "No", style: "cancel", onPress: () => { } },
      ]
    );
  };

  useEffect(() => {
    // console.log("Postponed Request Flag: ", postponedRequestFlag);
    // console.log("Validation Flag: ", worksideValidatedFlag);

    if (postponedRequestFlag === true && worksideValidatedFlag === true) {
      console.log("Validated Postponed Request Flag: ", postponedRequestFlag);
      console.log("Validation Flag: ", worksideValidatedFlag);
      setPostponedRequestFlag(false);
    }
  }, [postponedRequestFlag, worksideValidatedFlag]);

  const ProcessCanceledRequest = (requestId) => {
 		// TODO - Add Passcode Verification

    Alert.alert(
      "Cancel Request",
      "Are you sure you want to CANCEL the Request? This cannot be reversed!",
      [
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            // Set Request Status to CANCELED
            UpdateRequestStatus(requestId, "CANCELED");
            // Set Bid Status to CANCELED
            UpdateRequestBidsStatus(requestId, "CANCELED");
            // Set Awarded Bid to FALSE
            // Email All Parties
          },
        },
        { text: "No", style: "cancel", onPress: () => { } },
      ]
    );
  };

  const handleDateTimePress = () => {
    dateTimeModalRef.current?.present();
  };

  const handleDateTimeClose = () => {
    dateTimeModalRef.current?.dismiss();
  };

  const handleSaveDateTimeModalChanges = () => {
    // Save Data
    updatedDateTime = modRequestDateTime;
    setDateTimeRequested(modRequestDateTime);
    dateTimeModalRef.current?.dismiss();
    // console.log("Modified DateTime Requested: ", modRequestDateTime);
    // console.log("Updated Const DateTime Requested: ", updatedDateTime);
    // console.log("Updated DateTime Requested: ", dateTimeRequested);
  };

  const updateRequestQuantity = (text) => {
    setRequestQty(text);
    modifyDialogFlag = true;
  };

  const updateRequestComment = (text) => {
    setRequestComment(text);
    modifyDialogFlag = true;
  };

  // Render Date/Time Modal
  const renderDateTimeModal = () => {
    return (
      <>
        {/* Output Header */}
        <View className="flex-start justify-center items-center">
          <Text>
            <Text className="text-green-500 text-xl font-bold">WORK</Text>
            <Text className="text-black text-xl font-bold">SIDE</Text>
          </Text>
          <Text className="text-black text-lg font-bold">
            Update Date and Time Requested
          </Text>
        </View>
        <View className="flex-row items-center justify-between w-[100%] pt-1 pb-2">
          <View className="h-2 bg-green-300 flex-grow w-1/2" />
        </View>
        <View className="flex-row items-center justify-between w-[100%] pt-1 pb-2">
          <TextInput
            value={format(modRequestDateTime, "MM/dd/yyyy HH:mm")}
            className="bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-[50%] h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
            editable={false}
          />

          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-20 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-sm font-bold text-black">Date</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-20 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => setShowTimePicker(true)}
          >
            <Text className="text-sm font-bold text-black">Time</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between gap-3 pt-1 pb-2">
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={handleSaveDateTimeModalChanges}
          >
            <Text className="text-sm font-bold text-black">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={handleDateTimeClose}
          >
            <Text className="text-sm font-bold text-black">Cancel</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePickerModal
              styles={{ width: 200, height: 200 }}
              value={modRequestDateTime}
              mode={"date"}
              is24Hour={true}
              display={"default"}
              onChange={onDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePickerModal
              styles={{ width: 200, height: 200 }}
              value={modRequestDateTime}
              mode={"time"}
              is24Hour={true}
              display={"default"}
              onChange={onDateChange}
            />
          )}
        </View>
      </>
    );
  };

  const onChangeDateTime = (e, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setShowTimePicker(false);

    const roundedDate = getRoundedDate(15, currentDate);
    setModRequestDateTime(roundedDate);
  };

  const handleVendorPress = () => {
    vendorModalRef.current?.present();
  };

  const handleVendorClose = () => {
    vendorModalRef.current?.dismiss();
  };

  const handleSaveVendorModalChanges = () => {
    // Save Data
    vendorModalRef.current?.dismiss();
  };

  const onDateChange = (e, selectedDate) => {
    setShowDatePicker(false);
    setShowTimePicker(false);
    const roundedDate = getRoundedDate(15, selectedDate);
    setModRequestDateTime(roundedDate);
    setModalEditFlag(true);
  };

  // Render Date/Time Modal
  const renderVendorModal = () => {
    return (
      <>
        {/* Output Header */}
        <View className="flex-start justify-center items-center">
          <Text>
            <Text className="text-green-500 text-xl font-bold">WORK</Text>
            <Text className="text-black text-xl font-bold">SIDE</Text>
          </Text>
          <Text className="text-black text-lg font-bold">Change Vendor</Text>
        </View>
        <View className="flex-row items-center justify-between w-[100%] pt-1 pb-2">
          <View className="h-2 bg-green-300 flex-grow w-1/2" />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            paddingTop: 0,
            // left: 20,
            // gap: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* MSA Radio Button */}
          <View style={styles.main}>
            <TouchableOpacity
              onPress={() => {
                setSelectedRadio(1);
                modifyDialogFlag = true;
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
                modifyDialogFlag = true;
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
                modifyDialogFlag = true;
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

        {/* Show List of MSA Vendors */}
        {selectedRadio === 3 ? (
          <View
            style={{
              paddingTop: 5,
              paddingBottom: 10,
              alignItems: "center",
              width: "300px",
            }}
          >
            <Select
              style={{
                height: 45,
                width: 300,
                borderRadius: 5,
                borderWidth: 2,
                borderColor: "black",
                backgroundColor: "white",
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
                    }}
                  />
                );
              })}
            </Select>
          </View>
        ) : null}
        <View className="flex-row items-center justify-between gap-3 pt-1 pb-2">
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={handleSaveVendorModalChanges}
          >
            <Text className="text-sm font-bold text-black">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-24 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={handleVendorClose}
          >
            <Text className="text-sm font-bold text-black">Cancel</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

// Passcode Modal
const handlePasscodePress = () => {
  setWorksideValidatedFlag(false);
  passcodeModalRef.current?.present();
};

const handlePasscodeClose = () => {
  numOfAttempts = 0;
  setPinCode([]);
  // setWorksideValidatedFlag(false);
  passcodeModalRef.current?.dismiss();
};

const handleSavePasscodeModalChanges = () => {
  // Save Data
  // console.log("Request Details Passcode: ", pinCode.join(""));
  // console.log("Request Details Workside Passcode: ", worksidePasscode);
  // worksidePasscode === pinCode.join("") ? setWorksideValidatedFlag(true) : setWorksideValidatedFlag(false);
  passcodeModalRef.current?.dismiss();
};

  const renderPasscodeModal = () => {
  
    // const [pinCode, setPinCode] = useState([]);
    const codeLength = Array(6).fill(0);
    const offset = useSharedValue(0);
    const style = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: offset.value }],
      };
    });
  
    useEffect(() => {
      numOfAttempts = 0;
      setPinCode([]);
    }, []);
  
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (numOfAttempts === 3) {
        Alert.alert("Error", "Too many attempts");
        setPinCode([]);
        // Navigate to home screen
      }
    }, [numOfAttempts]);
  
    useEffect(() => {
      if (pinCode.length === pinLength) {
        numOfAttempts += 1;
        console.log("Number of Attempts: ", numOfAttempts);
        // Validate passcode and re-route to home screen
        // console.log("Request Details Passcode: ", pinCode.join(""));
        // console.log("Request Details Workside Passcode: ", worksidePasscode);
        // worksidePasscode === pinCode.join("") ? setWorksideValidatedFlag(true) : setWorksideValidatedFlag(false);
      
        if (pinCode.join("") !== worksidePasscode) {
            offset.value = withSequence(
            withTiming(-OFFSET, { duration: TIMING }),
            withRepeat(withTiming(OFFSET, { duration: TIMING }), 4, true),
            withTiming(0, { duration: TIMING }),
          );
  
          setPinCode([]);
          if(numOfAttempts === 3) {
            Alert.alert("Error", "Too many attempts");
            handlePasscodeClose();
            // setValidatedFlag(false);
            // setPasscodeRequested(true);
            // navigation.goBack();
            return;
          }
          return;
        }
  
        numOfAttempts = 0;
        setPinCode([]);
        // setValidatedFlag(true);
        // setPasscodeRequested(true);
        setWorksideValidatedFlag(true);
        handlePasscodeClose();
        // navigation.goBack();
      }
    }, [pinCode]);
  
    const DialPad = ({ onPress }) => {
      return (
        <>
        {/* <View className="flex-1 pt-2"> */}
        <View className="flex-1 pt-2">
          <FlatList
            data={dialPad}
            numColumns={3}
            style={{ flexGrow: 1 }}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 20 }}
            contentContainerStyle={{ gap: 20 }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => onPress(item)}
                  disabled={item === ""}
                >
                  <View
                    style={{
                      width: dialPadSize,
                      height: dialPadSize,
                      borderRadius: dialPadSize / 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item === "del" ? (
                      <Ionicons
                        name="backspace-outline"
                        size={dialPadSize / 2}
                        color="black"
                      />
                    ) : item === "" ? (
                      <Ionicons
                        name="finger-print"
                        size={dialPadSize / 2}
                        color="black"
                      />
                    ) : (
                      <Text className="text-green-500 text-3xl font-bold">
                        {item}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        </>
      );
    };
  
    return (
      <>
      <View className="flex-1 bg-white items-center">
        <View className="items-center pb-2 pt-2">
          <Text>
            <Text className="text-green-500 text-2xl font-bold">WORK</Text>
            <Text className="text-black text-2xl font-bold">SIDE</Text>
          </Text>
        </View>
  
        <Text className="text-xl font-bold text-center mb-2 text-black">
          Confirm with Passcode
        </Text>
        <Text className="text-xs font-bold text-center mb-2 text-black">
            After 3 Failed Attempts, You Will Be Locked Out
          </Text>
          {numOfAttempts > 0 ? (
          <View>
            <Text className="text-xs font-bold text-center text-red-500">
              {`Invalid passcode. Attempts Left: ${3 - numOfAttempts}`}
            </Text>
          </View>
        ) : null}
        <Animated.View style={[styles.codeView, style]}>
          {codeLength.map((_, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={[
                styles.codeEmpty,
                {
                  backgroundColor: pinCode[index] ? "black" : "transparent",
                },
              ]}
            />
          ))}
        </Animated.View>
        <DialPad
          onPress={(item) => {
            if (item === "del") {
              setPinCode((prevCode) => prevCode.slice(0, prevCode.length - 1));
            } else if (typeof item === "number") {
              setPinCode((prevCode) => [...prevCode, item]);
            }
          }}
        />
        {/* {numOfAttempts > 0 ? (
          <View>
            <Text className="text-sm font-bold text-center text-red-500">
              {`Invalid passcode. Attempts Left: ${3 - numOfAttempts}`}
            </Text>
          </View>
        ) : null} */}
        <View>
          <Text className="text-sm font-bold text-center mb-2 text-red">
            After Three Failed Attempts, You Will Be Locked Out
          </Text>
          <Text className="text-sm font-bold text-center mb-2 text-black">
            Workside Software Copyright 2024
          </Text>
        </View>
      </View>
      </>
    );
  };
  
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="bg-white w-[100%]">
        <View className="items-center mb-0">
          {/* <Text>
            <Text className="text-green-500 text-xl font-bold">WORK</Text>
            <Text className="text-black text-xl font-bold">SIDE</Text>
          </Text> */}
          <Text className="text-black text-lg font-bold">
            {reqData.projectname}
          </Text>
          <Text className="text-black text-lg font-bold">
            {reqData.rigcompany}
          </Text>
        </View>
        {/* <View className="flex-row items-center justify-between w-[100%] pt-1 pb-2"> */}
        <View className="flex-row justify-around items-center w-full pt-2 pb-2">
{/*         
          style={{
            flexDirection: "row",
            alignContent: "space-around",
            justifyContent: "space-evenly",
            paddingTop: 2,
            gap: 100,
            alignItems: "center",
            width: "100%",
          }}
        > */}
          <View className="items-start">
            <Text>
              <Text style={{fontSize: hp(1.5)}} className="text-black font-bold">Status: </Text>
              <Text style={{fontSize: hp(1.5)}} className="text-green-500 font-bold">{reqData.status}</Text>
            </Text>
          </View>
          <View className="items-end">
            <TouchableOpacity
							className={`${bidAwardedFlag === false ? "bg-green-300" : "bg-gray-300"} hover:drop-shadow-xl hover:bg-light-gray p-1 right-5 rounded-lg w-32 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4`}
              disabled={!allowEditFlag}
              onPress={() => setEditFlag(!editFlag)}
            >
              {!editFlag && (
                <Text style={{fontSize: hp(1.25)}} className="text-black font-bold">Edit Mode</Text>
              )}
              {editFlag && (
                <Text style={{fontSize: hp(1.25)}} className="text-black font-bold">Cancel Edit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* ***************************************************************************** */}
        {/* Request Data Field */}
        {/* ***************************************************************************** */}
        <View className="flex-start justify-center items-center">
        <View 
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            // left: 15,
            width: "90%",
          }}
        >
          <Text style={{fontSize: hp(1.6)}} className="text-black font-bold">Request</Text>
          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
          <TextInput
            defaultValue="Request"
            value={reqData.requestname}
            className={
              "bg-gray-600 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-white font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
            }
            editable={editFlag}
          ></TextInput>
        </View>
        </View>
        {/* ***************************************************************************** */}
        {/* Quantity Data Field */}
        {/* ***************************************************************************** */}
        <View className="flex-start justify-center items-center">
          <View
            style={{
              justifyContent: "flex-start",
              paddingTop: 0,
              width: "90%",
            }}
          >
          <Text style={{fontSize: hp(1.6)}} className="text-black font-bold">Quantity</Text>
            <TextInput
              // Changed 2024-07-04
              // value={String(reqData.quantity)}
              value={requestQty}
              className={
                editFlag === true
                  ? "bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
                  : "bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
              }
              editable={editFlag}
              keyboardType="numeric"
              onChangeText={(text) => updateRequestQuantity(text)}
            />
          </View>
        </View>
        {/* ***************************************************************************** */}
        {/* ***************************************************************************** */}
        {/* Comments Data Field */}
        {/* ***************************************************************************** */}
        <View className="flex-start justify-center items-center">
          <View
            style={{
              justifyContent: "flex-start",
              paddingTop: 0,
              width: "90%",
              // height: 110,
            }}
          >
            <TextInput
              value={requestComment}
							className={`${editFlag === true ? "bg-green-300" : "bg-gray-300"} rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-20 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm align-top`}
              editable={editFlag}
              keyboardType="default"
              multiline={true}
              numberOfLines={3}
              onChangeText={(text) => updateRequestComment(text)}
            />
          </View>
        </View>
        {/* ***************************************************************************** */}
        {/* Preferred Vendor Data Field */}
        {/* ***************************************************************************** */}
        <View className="flex-start justify-center items-center">
          <View
            style={{
              justifyContent: "flex-start",
              paddingTop: 0,
              width: "90%",
            }}
          >
            {editFlag === false ? (
          <>
          <Text style={{fontSize: hp(1.6)}} className="text-black font-bold">Vendor</Text>
                <TextInput
                  defaultValue="Request"
                  value={reqData.vendortype}
                  className=
                  "bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
                  editable={editFlag}
                  onChangeText={(text) => setRequestVendor(text)} /></>
            ) : (
              <><Text className="text-black text-base font-bold">Vendor</Text>
                <TouchableOpacity
                  className="bg-green-300 hover:drop-shadow-xl hover:bg-light-gray mb-2 pl-3 pr-3 w-full flex-row justify-between items-center border-2 border-solid border-black border-r-4 border-b-4"
                  onPress={handleVendorPress}
                >
                  <Text className="text-base font-bold text-black align-middle">
                    {reqData.vendortype}
                  </Text>
                  <Icon name="chevron-down" size={25} />
                </TouchableOpacity>
              </>)}
          </View>
        </View>
        {/* ***************************************************************************** */}
        {/********************************************************** */}
        {/* Date/Time Required Field */}
        {/********************************************************** */}
        <View className="flex-start justify-center items-center">
          <View
            style={{
              justifyContent: "flex-start",
              paddingTop: 0,
              width: "90%",
            }}
          >
          <Text style={{fontSize: hp(1.6)}} className="text-black font-bold">Date/Time Required</Text>
            {editFlag === false ? (
              <TextInput
                value={format(dateTimeRequested, "MM/dd/yyyy HH:mm")}
                className="bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
                editable={false}
              />
            ) : (
              <TouchableOpacity
                className="bg-green-300 hover:drop-shadow-xl hover:bg-light-gray mb-2 pl-3 pr-3 w-full flex-row justify-between items-center border-2 border-solid border-black border-r-4 border-b-4"
                onPress={handleDateTimePress}
              >
                <Text className="text-base font-bold text-black align-middle">
                  {format(dateTimeRequested, "MM/dd/yyyy HH:mm")}
                </Text>
                <Icon name="chevron-down" size={25} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/********************************************************** */}
        <View className="flex-start justify-center items-center">
          <View
            style={{
              justifyContent: "flex-start",
              paddingTop: 0,
              width: "90%",
            }}
          >
          <Text style={{fontSize: hp(1.6)}} className="text-black font-bold">Link To</Text>
            {editFlag === false ? (
              // biome-ignore lint/style/useSelfClosingElements: <explanation>
              <TextInput
                defaultValue="Link To Other Request"
                className={`${editFlag === true ? "bg-green-300" : "bg-gray-300"} rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm`}
                editable={editFlag}
              ></TextInput>
            ) : (
              <Select
                style={{
                  width: "100%",
                  height: 45,
                  borderRadius: 5,
                  borderWidth: 1,
                  fontWeight: "700",
                  borderColor: "lightgray",
                  backgroundColor: Color.silver_200,
                }}
                placeholder={"Link To Other Request"}
                selectedIndex={selectedIndex}
                value={requestLinkTo}
                onSelect={(index) => {
                  setSelectedIndex(index);
                  setRequestLinkTo(index);
                  modifyDialogFlag = true;
                }}
              >
                {reqList.map((item) => {
                  return (
                    <SelectItem
                      key={item}
                      title={item}
                      onPress={() => {
                        setRequestLinkTo(item);
                        modifyDialogFlag = true;
                      }}
                    />
                  );
                })}
              </Select>
            )}
          </View>
        </View>
        {/********************************************************** */}
        {/* Form Buttons */}
        {/********************************************************** */}
        <View
          style={{
            flexDirection: "row",
            alignContent: "space-around",
            justifyContent: "space-evenly",
            paddingTop: 20,
            gap: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => {
              setCurrentRequestName(reqData.requestname);
              // TODO Set Current Supplier
              setCurrentSupplier("Supplier");
              setCurrentRequest(reqData.requestname);
              setCurrentRequestId(reqID);
              setReqArrivalTime(dateTimeRequested);
              setReqStatus(reqData.status);
          
              navigation.navigate("RequestMapping");
            }}
          >
            <Text className="text-base font-bold text-black">Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${disabledFlag === false ? "bg-green-300" : "bg-gray-300"} hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4`}
            /// Need to Save Any Changes Before Navigating
            disabled={disabledFlag}
            onPress={() => SaveModifiedData()}
          >
            <Text className="text-base font-bold text-black">Save Changes</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignContent: "space-around",
            justifyContent: "space-evenly",
            paddingTop: 15,
            gap: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            className={`${bidAwardedFlag === false ? "bg-green-300" : "bg-gray-300"} hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4`}
            disabled={bidAwardedFlag}
            onPress={() => (
              ProcessPostponedRequest((reqID))
            )}
          >
            <Text className="text-base font-bold text-black">Postpone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${bidAwardedFlag === false ? "bg-green-300" : "bg-gray-300"} hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4`}
            disabled={bidAwardedFlag}
            onPress={() => (
              ProcessCanceledRequest((reqID))
            )}
          >
            <Text className="text-base font-bold text-black">Cancel</Text>
          </TouchableOpacity>
        </View>
        {/* /////////////////////////////////////////////////////////////// */}
        {/* {showDatePicker && (
        <DateTimePickerModal
          styles={{ width: 200, height: 200 }}
          value={modRequestDateTime}
          mode={"date"}
          is24Hour={true}
          display={"default"}
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePickerModal
          styles={{ width: 200, height: 200 }}
          value={modRequestDateTime}
          mode={"time"}
          is24Hour={true}
          display={"default"}
          onChange={onDateChange}
        />
      )} */}
        {/* Date/Time Modal */}
        <BottomSheetModal
          ref={dateTimeModalRef}
          index={1}
          snapPoints={snapPoints}
        // onDismiss={handleCloseDateTimeModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <BottomSheetView style={styles.contentContainer}>
              {renderDateTimeModal()}
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </BottomSheetModal>
        {/* Vendor Modal */}
        <BottomSheetModal
          ref={vendorModalRef}
          index={1}
          snapPoints={snapPoints}
        // onDismiss={handleCloseDateTimeModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <BottomSheetView style={styles.contentContainer}>
              {renderVendorModal()}
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </BottomSheetModal>
        {/* Passcode Modal */}
        <BottomSheetModal
          ref={passcodeModalRef}
          index={2}
          snapPoints={snapPoints}
          onDismiss={handlePasscodeClose}
        // onDismiss={handleCloseDateTimeModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <BottomSheetView style={styles.contentContainer}>
              {renderPasscodeModal()}
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </BottomSheetModal>

      </View>
    </TouchableWithoutFeedback>
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
  // Passcode Modal styles
  codeView: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 20,
		marginVertical: 20,
    backgroundColor: "white",
	},
	codeEmpty: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
	},
});

export default RequestDetails;
