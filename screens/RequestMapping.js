import * as React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import useDataStore from "../src/stores/DataStore";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import useRequestStore from "../src/stores/RequestStore";
import { format } from "date-fns";
import { useStateContext } from "../src/contexts/ContextProvider";
import axios from "axios";
import Toast from "react-native-toast-message";
import { FIREBASE_DB } from '../FirebaseConfig';
import { collection, query, where, getDocs, doc } from "firebase/firestore";

const LOCATION_TASK_NAME = "background-location-task";

let alertModifyFlag = false;

const locationsOfInterest = [
  {
    id: 1,
    title: "Rig Location",
    location: {
      latitude: 35.2,
      longitude: -119.3,
    },
    description: "Rig 45",
    icon: "account-hard-hat",
  },
  {
    id:2,
    title: "Supplier Location",
    location: {
      latitude: 35.4,
      longitude: -118.9,
    },
    description: "San Joaquin Bit",
    icon: "truck-fast",
  },
];
/******************************************************************** */
/***** Display Current Delivery Status */
/******************************************************************** */

const RequestMapping = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [editFlag, setEditFlag] = useState(false);
  const [departureTime, setDepartureTime] = useState("07:00");
  const [arrivalTime, setArrivalTime] = useState(Date.now());
  const [animating, setAnimating] = useState(true);
  const { apiURL } = useStateContext();
  const [daAssigned, setDaAssigned] = useState(false);

  //////////////////////////////////////////////////////////////////
  const currentSupplier = useDataStore((state) => state.currentSupplier);
  const setCurrentSupplier = useDataStore((state) => state.setCurrentSupplier);
  const currentRequestName = useDataStore((state) => state.currentRequestName);
  const setCurrentRequestName = useDataStore(
    (state) => state.setCurrentRequestName
  );
  const [supplierUserName, setSupplierUserName] = useState("");
  const [supplierUserId, setSupplierUserId] = useState("");
  /////////////////////////////////////////////////////////////////////
  // Global Alert Flags
  const departureAlertFlag = useDataStore((state) => state.departureAlertFlag);
  const setDepartureAlertFlag = useDataStore(
    (state) => state.setDepartureAlertFlag
  );
  const fifteenMinAlertFlag = useDataStore(
    (state) => state.fifteenMinAlertFlag
  );
  const setFifteenMinAlertFlag = useDataStore(
    (state) => state.setFifteenMinAlertFlag
  );
  const arrivalAlertFlag = useDataStore((state) => state.arrivalAlertFlag);
  const setArrivalAlertFlag = useDataStore(
    (state) => state.setArrivalAlertFlag
  );
  const departLocationAlertFlag = useDataStore(
    (state) => state.departLocationAlertFlag
  );
  const setDepartLocationAlertFlag = useDataStore(
    (state) => state.setDepartLocationAlertFlag
  );
  const alertReqTeamFlag = useDataStore((state) => state.alertReqTeamFlag);
  const setAlertReqTeamFlag = useDataStore(
    (state) => state.setAlertReqTeamFlag
  );
  /////////////////////////////////////////////////////////////////////
  // Global Request Data
  const currentRequest = useRequestStore((state) => state.request);
  const setCurrentRequest = useRequestStore((state) => state.setRequest);
  const currentRequestId = useRequestStore((state) => state.requestId);
  const setCurrentRequestId = useRequestStore((state) => state.setRequestId);
  const reqArrivalTime = useRequestStore((state) => state.reqArrivalTime);
  const setReqArrivalTime = useRequestStore((state) => state.setReqArrivalTime);
  const reqStatus = useRequestStore((state) => state.reqStatus);
  const setReqStatus = useRequestStore((state) => state.setReqStatus);

  /////////////////////////////////////////////////////////////////////
  // Local Alert Flags
  const [onDepartureAlertFlag, setOnDepartureAlertFlag] =
    useState(departureAlertFlag);
  const [on15MinAlertFlag, setOn15MinAlertFlag] = useState(fifteenMinAlertFlag);
  const [onArrivalAlertFlag, setOnArrivalAlertFlag] =
    useState(arrivalAlertFlag);
  const [onDepartLocationAlertFlag, setOnDepartLocationAlertFlag] = useState(
    departLocationAlertFlag
  );
  const [alertTeamFlag, setAlertTeamFlag] = useState(alertReqTeamFlag);

  /////////////////////////////////////////////////////////////////////
  useEffect(() => {
    // Temporary Code to Get Chat ID
    // GetChatId("123456");
    getProgressData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Prevent Default Behavior if modifyFlag === true
      if (alertModifyFlag === true) {
        e.preventDefault();
        Alert.alert(
          "Alerts Changed!!",
          "Are you sure you want to discard changes?",
          [
            {
              text: "Yes",
              style: "destructive",
              onPress: () => {
                setAlertModifyFlag(false);
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

  const getLocationAsync = async () => {
    Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 1,
      timeInterval: 500,
    });
    const newLocation = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1,
        timeInterval: 10000,
      },
      ({ coords }) => {
        setRegion((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading,
        }));
      }
    );
    return newLocation;
  };

  const getLocation = async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      maximumAge: 10000,
      timeout: 5000,
    });
    setAnimating(false);
    Alert.alert(
      `Latitude: ${location.coords.latitude} Longitude: ${location.coords.longitude}`
    );
    setLocation(location);
  };

  const getPermissionsAsync = async () => {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      const { fgGranted } = await Location.requestForegroundPermissionsAsync();
    }
  };

  onRegionChange = (region) => {
    // console.log(region);
  };

  const ShowLocations = () => {
    return locationsOfInterest.map((item, index) => {
      return (
        <Marker
          key={item.id} // Use a unique identifier as the key
          coordinate={item.location}
          title={item.title}
          description={item.description}
        >
          <Icon
            style={{
              textAlign: "center",
              top: 5,
            }}
            name={item.icon}
            size={30}
            color="#E74c3c"
          />
        </Marker>
      );
    });
  };

  const Hide_Animation = () => {
    setShowAnimationFlag(false);
    setAnimating(false);
  };

  const setAlertModifyFlag = (flag) => {
    alertModifyFlag = flag;
  };

  const SaveAlertChanges = () => {
    setDepartureAlertFlag(onDepartureAlertFlag);
    setFifteenMinAlertFlag(on15MinAlertFlag);
    setArrivalAlertFlag(onArrivalAlertFlag);
    setDepartLocationAlertFlag(onDepartLocationAlertFlag);
    setAlertReqTeamFlag(alertTeamFlag);

    // TODO Save Alert Flags to Database
    // TODO Process Alert Flags

    setAlertModifyFlag(false);
  };

  const GetChatId = async (supplierId) => {
    // TODO Get Chat ID from Supplier
    let chatId = "";
    const email = "sroy@workside.com";

    const q = query(collection(FIREBASE_DB, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      // doc.data() is never undefined for query doc snapshots
      chatId = doc.data()["mongoDbId"];
    }
    return chatId;
  };

	const getProgressData = async () => {
		const reqURL = `${apiURL}/api/progresstracker/${currentRequestId}`;
		try {
			const response = await axios.get(reqURL);
      if(response.data !== null) {
        setDaAssigned(true);
        // setSupplierUserId(GetChatId(response?.data?.supplierid));
        setSupplierUserId(response?.data?.daid);
        setSupplierUserName(response?.data?.daname);
        setCurrentSupplier(response?.data?.supplier);
      }
      else {
        setDaAssigned(false);
        // Toast
        Toast.show({
          type: "info",
          text1: "Workside Software",
          text2: "No Delivery Associate Assigned!",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
			// let i = 0;
			// while (i < 5) {
			// 	if (response.data.step[i].date === null) stepData[i].date = "";
			// 	else {
			// 		stepData[i].date = response.data.step[i].date;
			// 		setActiveStep(i + 1);
			// 	}
			// 	i++;
			// }
		} catch (error) {
			console.error("Error fetching progress data: ", error);
      return false;
		}
		return true;
	};

  const ContactSupplier = () => {
		navigation.navigate("ChatRoomScreen", { supplierUserName: supplierUserName, supplierUserId: supplierUserId, supplier: currentSupplier, requestId: currentRequestId });
    // Alert.alert("Contact Supplier");
  }
  
  return (
    <View className="flex-1 bg-white items-center">
      <View className="items-center pb-3">
        {/* <Text>
          <Text className="text-green-500 text-2xl font-bold">WORK</Text>
          <Text className="text-black text-2xl font-bold">SIDE</Text>
        </Text> */}
        {currentSupplier !== null && (
          <Text>
            <Text className="text-black text-2xl font-bold">
              {currentSupplier}
            </Text>
          </Text>
        )}
        <Text>
          <Text className="text-green-500 text-xl font-bold">
            {currentRequestName}
          </Text>
        </Text>
        <Text>
          <Text className="text-black text-lg font-bold">
            {`Status: ${reqStatus}`}
          </Text>
        </Text>
      </View>
      {/* Output Map Component */}
      <View className="w-[100%] items-center pb-3">
        <View className="w-[100%] items-center pb-6">
          <MapView
            provider={MapView.PROVIDER_GOOGLE}
            style={styles.requestMapView}
            onRegionChange={onRegionChange}
            initialRegion={{
              latitude: 35.411544488071556,
              latitudeDelta: 0.7141989335803416,
              longitude: -119.09790278932303,
              longitudeDelta: 0.9062909038644165,
            }}
            apiKey="AIzaSyDyhqHd1Zk266sB-HNeBXlO2dUs0XQuUxQ"
          >
            {ShowLocations()}
          </MapView>
        </View>
        {/* Output Buttons */}
        <View className="flex flex-row items-center justify-evenly content-around gap-5 w-full">
          <TouchableOpacity
            className={
              daAssigned === false
                ? "bg-gray-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-48 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                : "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-48 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            // TODO Change Back
            // disabled={daAssigned === false}
            onPress={() => {
              ContactSupplier();
            }}
          >
              <Text className="text-base font-bold text-black">
                Contact Supplier
              </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-48 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-base font-bold text-black">Alerts</Text>
          </TouchableOpacity>
        </View>
        <View className="flex items-center justify-evenly gap-2.5 pt-2.5 left-0 w-full">
          <Text className="text-black text-base font-bold">
          {`Scheduled Arrival: ${format(reqArrivalTime, "MM/dd/yyyy HH:mm")}`}
          </Text>
          <Text className="text-black text-base font-bold">
          {`Estimated Arrival: ${format(arrivalTime, "MM/dd/yyyy HH:mm")}`}
          </Text>
        </View>
      </View>
      {/* Output Modal */}
      <BottomModal
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
        <ModalContent style={{ width: "100%", height: 450 }}>
          <View className="flex-start justify-center items-center pb-2">
            <Text>
              <Text className="text-green-500 text-2xl font-bold">WORK</Text>
              <Text className="text-black text-2xl font-bold">SIDE</Text>
            </Text>
            <Text className="text-black text-xl font-bold pt-1 pb-2">
              Alerts
            </Text>
            <View>
              {/* /////////////////////////////////////////////////////////// */}
              {/* Departure Alert */}
              <View className="pt-2 flex-row">
                <BouncyCheckbox
                  isChecked={onDepartureAlertFlag}
                  fillColor="green"
                  iconStyle={{ borderColor: "green" }}
                  innerIconStyle={{ borderWidth: 2 }}
                  size={20}
                  onPress={(isChecked) => {
                    setOnDepartureAlertFlag(isChecked);
                      setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-base font-bold ml-0">
                  On Departure
                </Text>
              </View>
              {/* /////////////////////////////////////////////////////////// */}
              {/* 15 Minute Prior To Arrival Alert */}
              <View className="pt-2 flex-row">
                <BouncyCheckbox
                  isChecked={on15MinAlertFlag}
                  fillColor="green"
                  iconStyle={{ borderColor: "green" }}
                  innerIconStyle={{ borderWidth: 2 }}
                  size={20}
                  onPress={(isChecked) => {
                    setOn15MinAlertFlag(isChecked);
                    setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-base font-bold ml-0">
                  15 Minutes Prior To Arrival
                </Text>
              </View>
              {/* /////////////////////////////////////////////////////////// */}
              {/* Upon Arrival Alert */}
              <View className="pt-2 flex-row">
                <BouncyCheckbox
                  isChecked={onArrivalAlertFlag}
                  fillColor="green"
                  iconStyle={{ borderColor: "green" }}
                  innerIconStyle={{ borderWidth: 2 }}
                  size={20}
                  onPress={(isChecked) => {
                    setOnArrivalAlertFlag(isChecked);
                    setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-base font-bold ml-0">
                  Upon Arrival On Location
                </Text>
              </View>
              {/* /////////////////////////////////////////////////////////// */}
              {/* Upon Departure From Location Alert */}
              <View className="pt-2 flex-row">
                <BouncyCheckbox
                  isChecked={onDepartLocationAlertFlag}
                  fillColor="green"
                  iconStyle={{ borderColor: "green" }}
                  innerIconStyle={{ borderWidth: 2 }}
                  size={20}
                  onPress={(isChecked) => {
                    setOnDepartLocationAlertFlag(isChecked);
                      setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-base font-bold ml-0">
                  Depart Location
                </Text>
              </View>
              {/* /////////////////////////////////////////////////////////// */}
              <View className="h-5 border-b-4 border-green-500 text-2xl text-center" />
              {/* Alert Entire Team Flag */}
              <View className="pt-6 flex-row">
                <BouncyCheckbox
                  isChecked={alertTeamFlag}
                  fillColor="green"
                  iconStyle={{ borderColor: "green" }}
                  innerIconStyle={{ borderWidth: 2 }}
                  size={20}
                  onPress={(isChecked) => {
                    setAlertTeamFlag(isChecked);
                    setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-base font-bold ml-0">
                  Alert Entire Team
                </Text>
              </View>
              {/* /////////////////////////////////////////////////////////// */}
            </View>
            <View className="pt-5">
              <TouchableOpacity
                className={
                  alertModifyFlag === true
                    ? "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                    : "bg-gray-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                }
                /// Need to Save Any Changes Before Navigating
                disabled={!alertModifyFlag}
                onPress={() => {
                  SaveAlertChanges();
                  setModalVisible(false);
                }}
              >
                <Text className="text-lg font-bold text-black">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ModalContent>
      </BottomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  requestMapView: {
    left: 0,
    width: "100%",
    height: 400,
  },
  checkboxTextStyle: {
    color: "#010101",
    fontWeight: "600",
  },
});

export default RequestMapping;
