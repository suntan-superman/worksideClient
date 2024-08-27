import * as React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Color } from "../GlobalStyles";
import { Select, SelectItem, IndexPath } from "@ui-kitten/components";
import { Icon, List, ListItem } from "@ui-kitten/components";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import useUserStore from "../src/stores/UserStore";
import useDataStore from "../src/stores/DataStore";

const SelectProject = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeProjects, setActiveProjects] = useState([]);
  const [projectSelected, setProjectSelected] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [projectID, setProjectID] = useState(null);
  const [customerName, setCustomerName] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [projectDescription, setProjectDescription] = useState(null);
  const [projectRig, setProjectRig] = useState(null);
  const [disabledFlag, setDisabledFLag] = useState(true);
  const loggedInFlag = useUserStore((state) => state.loggedIn);
  ////////////////////////////////////////////////////////////////////////////
  const setCurrentProjectId = useDataStore(
    (state) => state.setCurrentProjectId
  );
  const setCurrentCustomer = useDataStore((state) => state.setCurrentCustomer);
  const setCurrentProject = useDataStore((state) => state.setCurrentProject);
  const setCurrentProjectDesc = useDataStore(
    (state) => state.setCurrentProjectDesc
  );
  const setCurrentRigCompany = useDataStore(
    (state) => state.setCurrentRigCompany
  );

  ////////////////////////////////////////////////////////////////////////////
  const { apiURL, currentUserID, setCurrentUserID } = useStateContext();
  const navigation = useNavigation();

  const listHeight = Platform.OS === "ios" ? 400 : 400;

  const GetProjects = async () => {
    const strAPI = `${apiURL}/api/project`;
    try {
      const response = await axios.get(strAPI);
      setActiveProjects(response.data);
    } catch (error) {
      console.log("error", error);
    }
    setSelectedIndex(new IndexPath(0));
  };

  useEffect(() => {
    GetProjects();
  }, []);

  // const UpdateCurrentUserID = async () => {
  //   const currentUser = await AsyncStorage.getItem("userId");
  //   setCurrentUserID(currentUser);
  // };

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      // Prevent Default Behavior
      e.preventDefault();
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard changes?",
        [
          { text: "No", style: "cancel", onPress: () => {} },
          {
            text: "Yes",
            style: "destructive",
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });
  }, [navigation]);

  const SaveProjectInfoToLocalStorage = () => {
    setCurrentProjectId(projectID);
    setCurrentCustomer(customerName);
    setCurrentProject(projectName);
    setCurrentProjectDesc(projectDescription);
    setCurrentRigCompany(projectRig);
    ///////////////////////////////////////////////////////////////

    setProjectSelected(false);

    navigation.navigate("ActiveRequests", { projectName: projectName });
  };

  const pressHandler = (item) => {
    setProjectID(item._id);
    setCustomerName(item.customer);
    setProjectName(item.projectname);
    setProjectDescription(item.description);
    setProjectRig(item.rigcompany);
    // Navigate to Active Requests for the selected project
    setProjectSelected(true);
  };

  const projectPressHandler = (item) => {
    setModalVisible(true);
    setSelectedProject(item);
  };

  const renderItemAccessory = (props) => (
    <Pressable
      onPress={() => projectPressHandler(props.selectedItem)}
      size="tiny"
      className={
        "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-28 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
        // props.selectedItem.bidStatus === true
        //   ? "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-16 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
        //   : "bg-yellow-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-16 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
      }
    >
      <Text className="text-sm font-semibold">DETAILS</Text>
    </Pressable>
  );

  const renderItemIcon = (props) => <Icon {...props} name="flash-outline" />;

  const renderProjects = ({ item }) => (
    <ListItem
      style={{
        backgroundColor: item._id === selectedIndex ? "yellow" : "white",
      }}
      title={item.projectname}
      description={item.projectname}
      accessoryLeft={renderItemIcon}
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

  const pressStyle = [
    styles.pressable,
    { backgroundColor: disabledFlag === false ? Color.lightgreen_100 : "gray" },
  ];

  return (
    <>
      <View>
        <View className="items-center">
          <Text>
            <Text className="text-green-500 text-2xl font-bold">WORK</Text>
            <Text className="text-black text-2xl font-bold">SIDE</Text>
          </Text>
          <Text className="text-black text-xl font-bold">Projects</Text>
        </View>
        <List
          style={{ maxHeight: listHeight }}
          data={activeProjects}
          renderItem={renderProjects}
        />
        <View style={{ alignItems: "center", paddingTop: 20 }}>
          <TouchableOpacity
            className={
              disabledFlag
                ? "bg-gray-400 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-64 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                : "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-2 rounded-lg w-64 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            disabled={disabledFlag}
            onPress={() => {
              SaveProjectInfoToLocalStorage();
            }}
          >
            <Text className="text-base font-bold text-black">
              SELECT PROJECT
            </Text>
          </TouchableOpacity>
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
        <ModalContent style={{ width: "100%", height: 400 }}>
          <View className="flex-start justify-center items-center pb-2">
            <Text>
              <Text className="text-green-500 text-2xl font-bold">WORK</Text>
              <Text className="text-black text-2xl font-bold">SIDE</Text>
            </Text>
            <Text className="text-green-500 text-xl font-bold">
              Project Info
            </Text>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* Output Area */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <View style={{ width: 125, backgroundColor: "white" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Area
              </Text>
            </View>
            <View style={{ width: 250, backgroundColor: "lightgray" }}>
              <Text
                style={{
                  left: 10,
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {selectedProject?.area}
              </Text>
            </View>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* /////////////////////////////////////////////////////////// */}
          {/* Output Project Name */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <View style={{ width: 125, backgroundColor: "white" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Project Name
              </Text>
            </View>
            <View style={{ width: 250, backgroundColor: "lightgray" }}>
              <Text
                style={{
                  left: 10,
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {selectedProject?.projectname}
              </Text>
            </View>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* /////////////////////////////////////////////////////////// */}
          {/* Output Description */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <View style={{ width: 125, backgroundColor: "white" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Description
              </Text>
            </View>
            <View style={{ width: 250, backgroundColor: "lightgray" }}>
              <Text
                style={{
                  left: 10,
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {selectedProject?.description}
              </Text>
            </View>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* /////////////////////////////////////////////////////////// */}
          {/* Output Description */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <View style={{ width: 125, backgroundColor: "white" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Rig Company
              </Text>
            </View>
            <View style={{ width: 250, backgroundColor: "lightgray" }}>
              <Text
                style={{
                  left: 10,
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {selectedProject?.rigcompany}
              </Text>
            </View>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          {/* /////////////////////////////////////////////////////////// */}
          {/* Contact */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            <View style={{ width: 125, backgroundColor: "white" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Contact
              </Text>
            </View>
            <View style={{ width: 250, backgroundColor: "lightgray" }}>
              <Text
                style={{
                  left: 10,
                  fontSize: 14,
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                {selectedProject?.customercontact}
              </Text>
            </View>
          </View>
          {/* /////////////////////////////////////////////////////////// */}
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 20,
                textAlign: "center",
              }}
            >
              Press Outside To Dialog Close
            </Text>
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

export default SelectProject;

const styles = StyleSheet.create({
  pressable: {
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    width: 200,
    height: 50,
    alignItems: "center",
    fontFamily: FontFamily.workSansSemibold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: FontSize.size_base,
    color: Color.backgroundPrimary,
  },
});
