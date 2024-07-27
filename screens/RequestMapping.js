import * as React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CheckBox } from "@react-native-community/checkbox";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Color, Padding, Border } from "../GlobalStyles";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import useDataStore from "../src/stores/DataStore";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";

// import * as TaskManager from "expo-task-manager";

const LOCATION_TASK_NAME = "background-location-task";

let alertModifyFlag = false;

let locationsOfInterest = [
  {
    title: "Rig Location",
    location: {
      latitude: 35.2,
      longitude: -119.3,
    },
    description: "Rig 45",
    icon: "account-hard-hat",
  },
  {
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
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [animating, setAnimating] = useState(true);
  //////////////////////////////////////////////////////////////////
  const currentSupplier = useDataStore((state) => state.currentSupplier);
  const setCurrentSupplier = useDataStore((state) => state.setCurrentSupplier);
  const currentRequestName = useDataStore((state) => state.currentRequestName);
  const setCurrentRequestName = useDataStore(
    (state) => state.setCurrentRequestName
  );
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

  // const [onDepartureAlertFlag, setOnDepartureAlertFlag] = useState(false);
  // const [on15MinAlertFlag, setOn15MinAlertFlag] = useState(false);
  // const [onArrivalAlertFlag, setOnArrivalAlertFlag] = useState(false);
  // const [onDepartLocationAlertFlag, setOnDepartLocationAlertFlag] =
  //   useState(false);
  // const [alertTeamFlag, setAlertTeamFlag] = useState(false);

  /////////////////////////////////////////////////////////////////////
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      // Prevent Default Behavior if modifyFlag === true
      if (alertModifyFlag === true) {
        e.preventDefault();
        Alert.alert(
          "Alerts Changed!!",
          "Are you sure you want to discard changes?",
          [
            { text: "No", style: "cancel", onPress: () => {} },
            {
              text: "Yes",
              style: "destructive",
              onPress: () => {
                setAlertModifyFlag(false);
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });
  }, [navigation]);

  // TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  //   console.log("Task executed");
  //   try {
  //     if (error) {
  //       // Error occurred - check `error.message` for more details.
  //       return;
  //     }
  //     if (data) {
  //       const { locations } = data;
  //       console.log("paso");
  //       setTimeout(() => {
  //         console.log("paso timeout");
  //       }, 5000);
  //       setInterval(() => {
  //         console.log(locations[0]);
  //       }, 4000);
  //       // do something with the locations captured in the background
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

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
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      maximumAge: 10000,
      timeout: 5000,
    });
    setAnimating(false);
    Alert.alert(
      "Latitude: " +
        location.coords.latitude +
        " Longitude: " +
        location.coords.longitude
    );
    setLocation(location);
  };

  const getPermissionsAsync = async () => {
    const permission = await Location.getForegroundPermissionsAsync();
    // console.log("Permission: " + permission.status);
    if (permission.status !== "granted") {
      let { fgGranted } = await Location.requestForegroundPermissionsAsync();
    }
  };

  // useEffect(() => {
  //   const GetLocationInfo = async () => {
  //     await getPermissionsAsync().then(() => {
  //       getLocation();
  //     });
  //   };
  //   GetLocationInfo();
  // }, []);

  onRegionChange = (region) => {
    // console.log(region);
  };

  // useEffect(() => {
  //   (async () => {
  //     let { fgGranted } = await Location.requestForegroundPermissionsAsync();
  //     console.log("Foreground Permission: " + fgGranted);
  //     if (fgGranted !== "granted") {
  //       // return;
  //       return Alert.alert(
  //         "Location Access Required",
  //         "Workside requires GPS location. Access Denied"
  //       );
  //     }
  //     // const bgGranted = await Location.requestBackgroundPermissionsAsync();
  //     // if (bgGranted !== "granted") {
  //     //   return;
  //     //   // return Alert.alert(
  //     //   //   "Location Access Required",
  //     //   //   "Workside requires location even when the App is backgrounded."
  //     //   // );
  //     // }
  //     await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //       accuracy: Location.Accuracy.BestForNavigation,
  //       timeInterval: 10000,
  //       // foregroundService: {
  //       //   notificationTitle: "Workside Location Service",
  //       //   notificationBody: "Location is used when Workside is in background",
  //       // },
  //       activityType: Location.ActivityType.AutomotiveNavigation,
  //       showsBackgroundLocationIndicator: true,
  //     });
  //     // console.log("Permission granted");
  //     // Alert.alert("Let's Get Current Location");
  //     let location = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.Highest,
  //       maximumAge: 10000,
  //       timeout: 5000,
  //     });

  //     // let location = await Location.getCurrentPositionAsync({});
  //     Alert.alert("Current Location", JSON.stringify(location));
  //     // setLocation(location);
  //   })();
  // }, []);

  const ShowLocations = () => {
    return locationsOfInterest.map((item, index) => {
      return (
        <Marker
          key={index}
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

  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       setErrorMsg("Permission to access location was denied");
  //       return;
  //     }

  //     let location = await Location.getCurrentPositionAsync({});
  //     setLocation(location);
  //   })();
  // }, []);
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

    setAlertModifyFlag(false);
  };

  return (
    <>
      <View className="justify-center items-center">
        {/* <ActivityIndicator
        size="large"
        color={Color.activityIndicatorColor}
        animating={animating}
      /> */}
        <View className="items-center">
          <Text>
            <Text className="text-green-500 text-2xl font-bold">WORK</Text>
            <Text className="text-black text-2xl font-bold">SIDE</Text>
          </Text>
          {currentSupplier !== null && (
            <Text>
              <Text className="text-green-500 text-xl font-bold">
                {currentSupplier}
              </Text>
            </Text>
          )}
          <Text>
            <Text className="text-green-500 text-xl font-bold">
              {currentRequestName}
            </Text>
          </Text>
        </View>

        {/* <MapView
        style={{ width: 300, height: 300 }}
        provider={MapView.PROVIDER_GOOGLE}
        apiKey="AIzaSyBsK1utYDK9o1MR2RsnTobmJW7PVLHp6B4"
      /> */}
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

        <View
          style={{
            flexDirection: "row",
            alignContent: "space-around",
            justifyContent: "space-evenly",
            paddingTop: 450,
            gap: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-48 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            // onPress={() => navigation.navigate("RequestMapping")}
          >
            <Text className="text-base font-bold text-black">
              Contact Supplier
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={
              "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-48 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-base font-bold text-black">Alerts</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            paddingTop: 10,
            left: 0,
            gap: 10,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text className="text-black text-base font-bold">
            Departure Time {departureTime}
          </Text>
          <Text className="text-black text-base font-bold">
            Arrival Time {arrivalTime}
          </Text>
        </View>
      </View>
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
                  size={25}
                  onPress={(isChecked) => {
                    setOnDepartureAlertFlag(isChecked),
                      setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-xl font-bold ml-0">
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
                  size={25}
                  onPress={(isChecked) => {
                    setOn15MinAlertFlag(isChecked), setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-xl font-bold ml-0">
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
                  size={25}
                  onPress={(isChecked) => {
                    setOnArrivalAlertFlag(isChecked), setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-xl font-bold ml-0">
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
                  size={25}
                  onPress={(isChecked) => {
                    setOnDepartLocationAlertFlag(isChecked),
                      setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-xl font-bold ml-0">
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
                  size={25}
                  onPress={(isChecked) => {
                    setAlertTeamFlag(isChecked), setAlertModifyFlag(true);
                  }}
                />
                <Text className="text-black text-xl font-bold ml-0">
                  Alert Entire Team
                </Text>
              </View>
              {/* /////////////////////////////////////////////////////////// */}
            </View>
            <View className="pt-5">
              <TouchableOpacity
                className={
                  alertModifyFlag === true
                    ? "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                    : "bg-gray-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-44 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                }
                /// Need to Save Any Changes Before Navigating
                disabled={!alertModifyFlag}
                onPress={() => (SaveAlertChanges(), setModalVisible(false))}
              >
                <Text className="text-xl font-bold text-black">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

const styles = StyleSheet.create({
  requestMapView: {
    // top: 85,
    left: 0,
    width: "100%",
    height: 350,
    position: "absolute",
  },
  checkboxTextStyle: {
    color: "#010101",
    fontWeight: "600",
  },
});

export default RequestMapping;
