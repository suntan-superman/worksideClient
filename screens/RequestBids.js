import * as React from "react";
import { useState, useEffect } from "react";
import useDataStore from "../src/stores/DataStore";
import {
  Text,
  TextInput,
  View,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { CheckBox, List, ListItem } from "@ui-kitten/components";
import { format } from "date-fns";
import { useStateContext } from "../src/contexts/ContextProvider";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Modal, SlideAnimation, ModalContent } from "react-native-modals";
// import { authenticateAsync } from "expo-local-authentication";
// import Toast from "react-native-toast-message";

let currentStatus = false;
let bidArray = [];
let bidSupplierArray = [];

const RequestBids = (props) => {
  const navigation = useNavigation();
  const route = useRoute();

  const { reqID } = route.params;
  const { apiURL } = useStateContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedBid, setSelectedBid] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmationMsg, setConfirmationMsg] = useState("");
  const [confirmationFlag, setConfirmationFlag] = useState(false);

  let bidResponse = null;

  const [viewHeight, setViewHeight] = useState(
    // Dimensions.get("screen").height * 0.5
    400
  );
  const [buttonPosition, setButtonPosition] = useState(
    // Dimensions.get("screen").height * 0.8
    400
  );

  const [bidData, setBidData] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState(false);
  const [disabledFlag, setDisabledFLag] = useState(false);
  ///////////////////////////////////////////////////////
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
  ///////////////////////////////////////////////////////
  const [emailAddress, setEmailAddress] = useState("sroy@prologixsa.com");
  const [emailSubject, setEmailSubject] = useState("Workside Bid Notification");
  const [emailReqDateTime, setEmailReqDateTime] = useState(new Date());
  const [emailBody, setEmailBody] = useState(
    "Please review the Workside request and respond accordingly!"
  );
  ///////////////////////////////////////////////////////

  // Get Original Bid Array
  useEffect(() => {
    const GetBids = async () => {
      const strAPI = `${apiURL}/api/requestbidsview`;
      try {
        const response = await axios.get(strAPI).then((response) => {
          bidResponse = response.data;
          // Filter Bids by Request ID
          const bids = bidResponse.filter(
            (b) => b.requestbids.requestid === reqID
          );

          bidArray = bids;
          GetSupplierInfo();
        });
      } catch (error) {
        console.log("error", error);
      }
    };
    GetBids();
  }, []);

  const GetSupplierInfo = async () => {
    bidSupplierArray = [];
    try {
      //////////////////////////////////////////////////////
      // Get Supplier Name and Push to bids array
      //////////////////////////////////////////////////////
      if (bidArray.length === 0) return;
      let supplierName = "";
      bidArray.forEach((bid) => {
        const strAPI = `${apiURL}/api/firm/${bid.requestbids.supplierid}`;
        axios.get(strAPI).then((response) => {
          supplierName = response.data.name;
          bidSupplierArray.push({
            _id: bid._id,
            projectname: bid.requests.projectname,
            rigcompany: bid.requests.rigcompany,
            requestname: bid.requests.requestname,
            deliverydate: format(
              bid.requestbids.deliverydate,
              "MM/dd/yyyy HH:mm"
            ),
            status: bid.requestbids.status,
            supplierid: bid.requestbids.supplierid,
            supplier: supplierName,
          });
          setBidData(bidSupplierArray);
        });
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const SetAllBidsFalse = (flag) => {
    if (flag === false)
      bidData.forEach((bid) => {
        bid.status = "SUBMITTED";
      });
  };

  const renderItemAccessory = (props) => {
    if (props.selectedItem.status === "SELECTED") currentStatus = true;
    else currentStatus = false;

    return (
      <Pressable
        onPress={() => (
          // If checkedStatus === false, and currentStatus === false then set the status to SELECTED
          // And set checkedStatus to true
          checkedStatus === false && currentStatus === false
            ? // ? ((props.selectedItem.requestbids.status = "SELECTED"),
              ((props.selectedItem.status = "SELECTED"),
              setCheckedStatus(true),
              setUpdateFlag(true),
              setSelectedBid(props.selectedItem))
            : // : ((props.selectedItem.requestbids.status = "SUBMITTED"),
              ((props.selectedItem.status = "SUBMITTED"),
              setCheckedStatus(false),
              setUpdateFlag(true)),
          checkedStatus === true && currentStatus === true
            ? // ? ((props.selectedItem.requestbids.status = "SUBMITTED"),
              ((props.selectedItem.status = "SUBMITTED"),
              setCheckedStatus(false),
              setUpdateFlag(true))
            : null
        )}
        size="small"
        className={
          "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-28 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
        }
      >
        <Text className="text-sm font-semibold">
          {currentStatus ? "ACCEPTED" : "DECLINED"}
        </Text>
      </Pressable>
    );
  };

  const ProcessSelectedBid = (selectedBid) => {
    // const msg = "Notify Supplier: " + selectedBid.supplier + " of selection?";
    // Toast.show({
    //   type: "success",
    //   text1: "Workside Software",
    //   text2: msg,
    //   visibilityTime: 10000,
    //   autoHide: true,
    // });
    setModalVisible(true);
  };

  const UpdateRequestStatus = async () => {
    const strAPI = `${apiURL}/api/request`;
    await axios
      .patch(strAPI, {
        id: reqID,
        status: "AWARDED",
      })
      .then((response) => {
        // console.log("Request Updated: ", response.data);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  const UpdateRequestBidStatus = async () => {
    const strAPI = `${apiURL}/api/requestbid`;
    console.log(
      "Selected Bid: " + selectedBid._id + " Status: " + selectedBid.status
    );
    await axios
      .patch(strAPI, {
        id: selectedBid._id,
        status: selectedBid.status,
      })
      .then((response) => {
        // console.log("Request Bid Updated: ", response.data);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  const BiometricConfirmation = async () => {
    // const res = await authenticateAsync({
    //   promptMessage: "Confirm Selection",
    //   cancelLabel: "Cancel",
    //   fallbackLabel: "Use Password",
    // });
    // console.log("Biometric Confirmation: ", res.success);
    // return res.success;
    return true;
  };

  const ConfirmChanges = () => {
    var cText = confirmationText.toUpperCase();
    var sText = selectedBid.requestname.toUpperCase();
    if (cText === sText) {
      const result = BiometricConfirmation();
      setConfirmationMsg("Supplier Confirmed And Has Been Notified");
      // SendRequestEmail();
      //////////////////////////////////////////////////////////////
      // Update Request Status
      //////////////////////////////////////////////////////////////
      // UpdateRequestStatus();
      //////////////////////////////////////////////////////////////
      // Update Request Bid Status
      //////////////////////////////////////////////////////////////
      // UpdateRequestBidStatus();
      // Toast.show({
      //   type: "success",
      //   text1: "Workside Software",
      //   text2: "Supplier Confirmed And Will Be Notified",
      //   visibilityTime: 5000,
      //   autoHide: true,
      // });
      // ProcessSelectedBid(selectedBid);

      setConfirmationFlag(true);
      return true;
    } else {
      setConfirmationMsg("Confirmation Failed");
      // Toast.show({
      //   type: "error",
      //   text1: "Workside Software",
      //   text2: "Confirmation Failed",
      //   visibilityTime: 5000,
      //   autoHide: true,
      // });
      setConfirmationFlag(false);
      return false;
    }
  };

  const SendRequestEmail = async () => {
    const strAPI = `${apiURL}/api/email/`;

    const emailMessage = `Supplier ${selectedBid.supplier} has been selected to provide ${selectedBid.requestname} to ${selectedBid.rigcompany} by ${selectedBid.deliverydate}`;

    await axios
      .post(strAPI, {
        emailAddress: emailAddress,
        emailSubject: emailSubject,
        emailReqDateTime: Date.now(),
        emailMessage: emailMessage,
      })
      .then((response) => {
        // console.log("Email Sent: ", response.data);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  const renderItemCheckBox = (props) => {
    if (props.selectedItem.status === "SELECTED") currentStatus = true;
    else currentStatus = false;

    return (
      <CheckBox
        {...props}
        checked={currentStatus}
        status="success"
        onChange={(nextChecked) => {
          SetAllBidsFalse(nextChecked);
          setCheckedStatus(!checkedStatus);
          props.selectedItem.status =
            nextChecked === true ? "SELECTED" : "SUBMITTED";
          if (nextChecked === false) setSelectedIndex(0);
        }}
        style={{
          // color: getIconColor(props.selectedItem.status),
          width: 24,
          height: 24,
          backgroundColor: checkedStatus ? "white" : "white",
        }}
      />
    );
  };

  const renderBids = ({ item }) => {
    return (
      <ListItem
        textStyle={{ fontSize: 28, fontWeight: "bold" }}
        style={{
          backgroundColor: item._id === selectedIndex ? "yellow" : "white",
          fontSize: 16,
          fontWeight: "bold",
        }}
        title={`${item.projectname} ${item.rigcompany} ${item.requestname}`}
        description={`${item.deliverydate} ${"\n"} ${item.supplier}`}
        accessoryLeft={(props) =>
          renderItemCheckBox({ ...{ selectedItem: item, ...props } })
        }
        accessoryRight={(props) =>
          renderItemAccessory({ ...{ selectedItem: item, ...props } })
        }
        backgroundColor="#f9c2ff"
        onPress={(index) => {
          // setDisabledFlag(false);
          setSelectedIndex(item._id);
          // pressHandler(item);
        }}
      />
    );
  };

  return (
    <>
      <View w-full h-full>
        <View className="items-center">
          <Text>
            <Text className="text-green-500 text-xl font-bold">WORK</Text>
            <Text className="text-black text-xl font-bold">SIDE</Text>
          </Text>
          <Text className="text-black text-lg font-bold">{projectName}</Text>
          <Text className="text-black text-lg font-bold">{projectRig}</Text>
        </View>
        {bidData.length < 1 ? (
          <View className="items-center p-2">
            <Text className="text-red-500 text-xl font-bold">NO BIDS</Text>
          </View>
        ) : (
          <List
            style={{ maxHeight: viewHeight }}
            data={bidData}
            renderItem={renderBids}
          />
        )}

        <View
          style={{ alignItems: "center", paddingTop: 6, top: buttonPosition }}
        >
          <TouchableOpacity
            disabled={checkedStatus === false ? true : false}
            className={
              // checkedStatus === false
              updateFlag === false
                ? "bg-gray-300 p-0 rounded-lg w-48 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                : "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-48 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => {
              setConfirmationText("");
              ProcessSelectedBid(selectedBid);
              // console.log("Selected Item: ", selectedBid);
              // navigation.navigate("ActiveRequests");
            }}
          >
            <Text className="text-lg font-bold text-black">SAVE CHANGES</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        onBackdropPress={() => setModalVisible(!modalVisible)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        onHardwareBackPress={() => setModalVisible(!modalVisible)}
        visible={modalVisible}
        onTouchOutside={() => setModalVisible(!modalVisible)}
      >
        {/* _id: bid._id,
            projectname: bid.requests.projectname,
            rigcompany: bid.requests.rigcompany,
            requestname: bid.requests.requestname,
            deliverydate: 
            status: bid.requestbids.status,
            supplierid: bid.requestbids.supplierid,
            supplier: supplierName, */}

        <ModalContent style={{ width: "100%", height: 400 }}>
          {/* /////////////////////////////////////////////////////////// */}
          {/* Output Header */}
          {/* /////////////////////////////////////////////////////////// */}
          <View className="flex-start justify-center items-center">
            <Text>
              <Text className="text-green-500 text-3xl font-bold">WORK</Text>
              <Text className="text-black text-3xl font-bold">SIDE</Text>
            </Text>
            <Text className="text-green-500 text-xl font-bold">
              {selectedBid !== null ? selectedBid.requestname : ""}
            </Text>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* Output Details */}
          {/* /////////////////////////////////////////////////////////// */}
          <View className="flex-start justify-center items-center">
            <Text className="text-black text-lg font-bold">
              {/* _id: bid._id,
            projectname: bid.requests.projectname,
            rigcompany: bid.requests.rigcompany,
            requestname: bid.requests.requestname,
            deliverydate: 
            status: bid.requestbids.status,
            supplierid: bid.requestbids.supplierid,
            supplier: supplierName, */}

              {selectedBid !== null
                ? selectedBid.supplier +
                  " will provide " +
                  selectedBid.requestname +
                  " to " +
                  selectedBid.rigcompany +
                  " by " +
                  selectedBid.deliverydate
                : ""}
            </Text>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* Confirmation Section */}
          {/* /////////////////////////////////////////////////////////// */}
          {selectedBid !== null ? (
            <View className="flex-start justify-center items-center pt-3">
              <Text>
                <Text className="text-black text-lg font-bold">Enter </Text>
                <Text className="text-red-600 text-lg font-bold">
                  {selectedBid.requestname + " "}
                </Text>
                <Text className="text-black text-lg font-bold">
                  then Click CONFIRM
                </Text>
              </Text>
            </View>
          ) : (
            ""
          )}

          <View className="flex-start justify-center items-center pt-3">
            <TextInput
              className={
                "bg-green-200 relative rounded-8xs shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] box-border w-[300px] h-12 border-[1px] border-solid border-black text-black text-bold p-3 my-1 border-r-4 border-b-4 text-lg align-middle"
              }
              type="text"
              placeholder="Service/Product"
              value={confirmationText}
              onChangeText={(text) => setConfirmationText(text)}
              autoFocus
            />
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* Confirm Button */}
          {/* /////////////////////////////////////////////////////////// */}

          <View style={{ alignItems: "center", paddingTop: 20 }}>
            <TouchableOpacity
              className={
                confirmationText.length > 3
                  ? "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-40 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                  : "bg-gray-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-40 h-10 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
              }
              disabled={confirmationText.length > 3 ? false : true}
              onPress={() => {
                ConfirmChanges();
                // ProcessSelectedBid(selectedBid);
                // console.log("Selected Item: ", selectedBid);
                navigation.navigate("ActiveRequests");
              }}
            >
              <Text className="text-lg font-bold text-black">CONFIRM</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-start justify-center items-center pt-3">
            <Text
              className={
                confirmationFlag === true
                  ? "text-green-600 text-lg font-bold"
                  : "text-red-600 text-lg font-bold"
              }
            >
              {confirmationMsg}
            </Text>
          </View>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RequestBids;
