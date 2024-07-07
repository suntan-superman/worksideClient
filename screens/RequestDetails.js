import * as React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  View,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Color } from "../GlobalStyles";
import { Select, SelectItem, IndexPath } from "@ui-kitten/components";
import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import { format } from "date-fns";
import useDataStore from "../src/stores/DataStore";

const RequestDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const id = route.params.id;

  const { reqID } = route.params;
  const { apiURL } = useStateContext();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

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
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [disabledFlag, setDisabledFlag] = useState(true);
  const [dateTimeRequested, setDateTimeRequested] = useState(new Date());

  //////////////////////////////////////////////////////////////////////
  const currentSupplier = useDataStore((state) => state.currentSupplier);
  const setCurrentSupplier = useDataStore((state) => state.setCurrentSupplier);
  const currentRequestName = useDataStore((state) => state.currentRequestName);
  const setCurrentRequestName = useDataStore(
    (state) => state.setCurrentRequestName
  );
  //////////////////////////////////////////////////////////////////////

  const GetRequests = async () => {
    const reqURL = apiURL + "/api/request";
    try {
      const response = await axios.get(reqURL);
      const req = [...new Set(response.data.map((r) => r.requestname))];
      setReqList(req);
    } catch (error) {
      console.log("error", error);
    }
  };

  const [reqData, setReqData] = useState([]);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date) => {
    const currentDate = date;
    setDatePickerVisible(Platform.OS === "ios");
    setSelectedDate(currentDate);

    let tempDate = new Date(currentDate);
    let fDate =
      tempDate.getDay() +
      "/" +
      (tempDate.getMonth() + 1) +
      "/" +
      tempDate.getFullYear();
    let fTime =
      "Hours: " + tempDate.getHours() + " | Minutes: " + tempDate.getMinutes();

    setSelectedDate(date);
    hideDatePicker();
  };

  const showMode = (currentMode) => {
    setDatePickerVisible(currentMode);
  };

  useEffect(() => {
    GetRequests();
    // GetRequestDetails();
  }, []);

  useEffect(() => {
    const GetRequestDetails = async () => {
      const reqURL = apiURL + "/api/request/" + reqID;
      try {
        const response = await axios.get(reqURL);
        setReqData(response.data);
        setRequestQty(response.data.quantity.toLocaleString());
        setDateTimeRequested(response.data.datetimerequested);
      } catch (error) {
        console.log("error", error);
      }
    };

    GetRequestDetails();
  }, []);

  const SaveData = async () => {
    const strAPI = `${apiURL}/api/request`;

    if (requestQty === "" || requestQty === null || requestQty === undefined) {
      if (requestQty.toNumber() < 1) {
        alert("Quantity must be greater than 0");
        return false;
      }
    }
    const newReqData = { ...reqData, quantity: requestQty };

    const reqData = {
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
      //////////////////////////////////////////////
      // Update This
      reqlinkname: selectedLink,
      reqLinkId: reqList(selectedLinkIndex)._id,
      //////////////////////////////////////////////
      status: "PENDING",
      statusdate: datetimerequested,
      project_id: projectID,
    };

    console.log("Linked Request: " + selectedLink);
    console.log("Linked Request ID: " + reqList(selectedLinkIndex)._id);

    // //////////////////////////////////////////////
    const response = await fetch(strAPI, {
      method: "POST",
      body: JSON.stringify(reqData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    newRequestData = await response.json();
    ////////////////////////////////////////////////
    // SendRequestEmail();
    // if (newRequestData.data._id !== null) {
    //   SendRequestMessage(newRequestData.data._id);
    // }

    return true;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View>
        <View className="items-center">
          <Text>
            <Text className="text-green-500 text-xl font-bold">WORK</Text>
            <Text className="text-black text-xl font-bold">SIDE</Text>
          </Text>
          <Text className="text-black text-sm font-bold">
            {reqData.projectname}
          </Text>
          <Text className="text-black text-sm font-bold">
            {reqData.rigcompany}
          </Text>
        </View>
        <View className="items-end">
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 right-5 rounded-lg w-32 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => setEditFlag(!editFlag)}
          >
            {!editFlag && (
              <Text className="text-black text-base font-bold">Edit Mode</Text>
            )}
            {editFlag && (
              <Text className="text-black text-base font-bold">
                Cancel Edit
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {/* ***************************************************************************** */}
        {/* Request Data Field */}
        {/* ***************************************************************************** */}
        <View
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            left: 15,
            width: "90%",
          }}
        >
          <Text className="text-black text-base font-bold">Request</Text>
          <TextInput
            defaultValue="Request"
            value={reqData.requestname}
            className={
              "bg-gray-600 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-white font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
            }
            editable={editFlag}
          ></TextInput>
        </View>
        {/* ***************************************************************************** */}
        {/* Quantity Data Field */}
        {/* ***************************************************************************** */}
        <View
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            left: 15,
            width: "90%",
          }}
        >
          <Text className="text-black text-base font-bold">Quantity</Text>
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
            onChangeText={(text) => setRequestQty(text)}
          ></TextInput>
        </View>

        {/* ***************************************************************************** */}
        {/* ***************************************************************************** */}
        {/* Comments Data Field */}
        {/* ***************************************************************************** */}
        <View
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            left: 15,
            width: "90%",
            height: 150,
          }}
        >
          <TextInput
            value={requestComment}
            className={
              editFlag === true
                ? "bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-24 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm align-top"
                : "bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-24 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm align-top"
            }
            editable={editFlag}
            keyboardType="default"
            multiline={true}
            numberOfLines={5}
            onChangeText={(text) => setRequestComment(text)}
          />
        </View>

        {/* ***************************************************************************** */}
        {/* Preferred Vendor Data Field */}
        {/* ***************************************************************************** */}
        <View
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            left: 15,
            width: "90%",
          }}
        >
          <Text className="text-black text-base font-bold">Vendor</Text>
          <TextInput
            defaultValue="Request"
            value={reqData.vendortype}
            className={
              editFlag === true
                ? "bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
                : "bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
            }
            editable={editFlag}
            onChangeText={(text) => setRequestVendor(text)}
          ></TextInput>
        </View>

        {/* ***************************************************************************** */}
        {/********************************************************** */}
        {/* Date/Time Required Field */}
        {/********************************************************** */}
        <View
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            left: 15,
            width: "90%",
          }}
        >
          <Text className="text-black text-base font-bold">
            Date/Time Required
          </Text>
          <TextInput
            value={format(dateTimeRequested, "MM/dd/yyyy HH:mm")}
            className={
              editFlag === true
                ? "bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
                : "bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
            }
            editable={editFlag}
          ></TextInput>
        </View>

        {/********************************************************** */}
        <View
          style={{
            justifyContent: "flex-start",
            paddingTop: 0,
            left: 15,
            width: "90%",
          }}
        >
          <Text className="text-black text-base font-bold">Link To</Text>
          {editFlag === false ? (
            <TextInput
              defaultValue="Link To Other Request"
              className={
                editFlag === true
                  ? "bg-green-200 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
                  : "bg-gray-300 rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-full h-10 border-[1px] border-solid border-black text-black font-bold p-3 my-1 border-r-4 border-b-4 text-sm"
              }
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
              }}
            >
              {reqList.map((item, index) => {
                return (
                  <SelectItem
                    key={index}
                    title={item}
                    onPress={() => {
                      setRequestLinkTo(item);
                    }}
                  />
                );
              })}
            </Select>
          )}
        </View>

        {/********************************************************** */}
        {/* Form Buttons */}
        {/********************************************************** */}
        <View
          style={{
            flexDirection: "row",
            alignContent: "space-around",
            justifyContent: "space-evenly",
            paddingTop: 30,
            gap: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => (
              setCurrentRequestName(reqData.requestname),
              setCurrentSupplier("Supplier"),
              navigation.navigate("RequestMapping")
            )}
          >
            <Text className="text-lg font-bold text-black">Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={
              disabledFlag === false
                ? "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                : "bg-gray-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            /// Need to Save Any Changes Before Navigating
            disabled={disabledFlag}
            onPress={() => console.log("Save Changes")}
            // onPress={() => (console.log("Save Changes"), navigation.goBack())}
            // onPress={() => navigation.navigate("ActiveRequests")}
          >
            <Text className="text-lg font-bold text-black">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RequestDetails;
