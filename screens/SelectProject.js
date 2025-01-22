import * as React from "react";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  View,
  Pressable,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { GlobalStyles } from "../GlobalStyles";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, FontSize, Color } from "../GlobalStyles";
import { Select, SelectItem, IndexPath } from "@ui-kitten/components";
import { Icon, List, ListItem } from "@ui-kitten/components";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";
import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import useUserStore from "../src/stores/UserStore";
import useDataStore from "../src/stores/DataStore";
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
	GetAllProjects,
} from "../src/api/worksideAPI";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const projectList = null;

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

  // Get all projects
  // TODO Get only projects by customer and/or user and status = "ACTIVE"
	const { data: projList, isLoading, isSuccess, error, refetch } = useQuery({
		queryKey: ["allProjects"],
		queryFn: () => GetAllProjects(),
		refetchInterval: 10000,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		staleTime: 1000 * 60,	// 1 minute
		retry: 3,
	});

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Prevent Default Behavior
      e.preventDefault();
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard changes?",
        [
          {
            text: "Yes",
            style: "destructive",
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
          { text: "No", style: "cancel", onPress: () => {} },
        ]
      );
    });
    return unsubscribe;
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
        "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-0 rounded-lg w-28 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
      }
    >
      <Text 
        style={GlobalStyles.projectDetailsButtonLabelStyle}
        className="font-semibold">Details</Text>
    </Pressable>
  );

  const renderItemIcon = (props) => <Icon {...props} name="flash-outline" />;

  const renderProjects = ({ item }) => {
    return <ListItem
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
		/>;
  };  

  const pressStyle = [
    styles.pressable,
    { backgroundColor: disabledFlag === false ? Color.lightgreen_100 : "gray" },
  ];

  const ProjectInfo = () => {
      return (
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
              <Text className="text-black text-xl font-bold">
                Project Details
              </Text>
            </View>
            {/* /////////////////////////////////////////////////////////// */}
            {/* Output Area */}
            <View className="flex-start justify-center mb-1">
              <Text style={{fontSize: hp(1.5)}} className="text-black font-bold">Area</Text>
              <View style={styles.infoTextContainer}>
                 <Text style={{fontSize: hp(1.7)}}className="text-black font-bold left-2">{selectedProject?.area}</Text>
              </View>
            </View>
            {/* /////////////////////////////////////////////////////////// */}
            {/* /////////////////////////////////////////////////////////// */}
            {/* Output Project Name */}
            <View className="flex-start justify-center mb-1">
              <Text style={{fontSize: hp(1.5)}} className="text-black font-bold">Project Name</Text>
              <View style={styles.infoTextContainer}>
                 <Text style={{fontSize: hp(1.7)}}className="text-black font-bold left-2">{selectedProject?.projectname}</Text>
              </View>
            </View>
            {/* /////////////////////////////////////////////////////////// */}
            {/* /////////////////////////////////////////////////////////// */}
            {/* Output Description */}
            <View className="flex-start justify-center mb-1">
              <Text style={{fontSize: hp(1.5)}} className="text-black font-bold">Description</Text>
              <View style={styles.infoTextContainer}>
                 <Text style={{fontSize: hp(1.7)}}className="text-black font-bold left-2">{selectedProject?.description}</Text>
              </View>
            </View>
            {/* /////////////////////////////////////////////////////////// */}
            {/* /////////////////////////////////////////////////////////// */}
            {/* Output Rig Company */}
            <View className="flex-start justify-center mb-1">
              <Text style={{fontSize: hp(1.5)}} className="text-black font-bold">Rig Company</Text>
              <View style={styles.infoTextContainer}>
                 <Text style={{fontSize: hp(1.7)}}className="text-black font-bold left-2">{selectedProject?.rigcompany}</Text>
              </View>
            </View>
            {/* /////////////////////////////////////////////////////////// */}
            {/* /////////////////////////////////////////////////////////// */}
            {/* Output Contact */}
            <View className="flex-start justify-center mb-1">
              <Text style={{fontSize: hp(1.5)}} className="text-black font-bold">Contact</Text>
              <View style={styles.infoTextContainer}>
                 <Text style={{fontSize: hp(1.7)}}className="text-black font-bold left-2">{selectedProject?.customercontact}</Text>
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
      );
    }
  
  return (
    <>
    <View className="flex-1 bg-white">
      <View className="items-center">
        <Text>
          <Text className="text-green-500 text-2xl font-bold">WORK</Text>
          <Text className="text-black text-2xl font-bold">SIDE</Text>
          </Text>
      </View>
     {isLoading ? (
        <ActivityIndicator size="large" color="#6EE7B7" />
        ) : (
        <>
        <List
          contentContainerStyle className="flex-grow"
          data={projList.data}
          // TODO - Change back to activeProjects
          // data={activeProjects}
          renderItem={renderProjects}
        />
    		<View className="items-center pt-2 pb-4">
          <TouchableOpacity
            className={
              disabledFlag
                ? "bg-gray-400 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-56 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
                : "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-56 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
            }
            disabled={disabledFlag}
            onPress={() => {
              SaveProjectInfoToLocalStorage();
            }}
          >
            <Text className="text-base font-bold text-black">
              Project Requests
            </Text>
          </TouchableOpacity>
        </View> 
      </>
      )} 
    </View>
    <ProjectInfo />
    </>
  );
};

export default SelectProject;

const styles = StyleSheet.create({
  infoTextContainer: {
    width: wp(90), 
    height: hp(3.0),
    border: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    backgroundColor: "#86EFAC"
  },
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
