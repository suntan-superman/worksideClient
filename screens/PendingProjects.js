import * as React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon, List, ListItem, IndexPath } from "@ui-kitten/components";
import { format, set } from "date-fns";
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals";

import {
  GetAllProjects,
} from "../src/api/worksideAPI";
import { useQuery} from "@tanstack/react-query";

const PendingProjects = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
  
  const [pendingProjects, setPendingProjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));

   // Get PENDING projects
  // TODO Get only projects by customer and status = "ACTIVE"
	const { data: projList } = useQuery({
		queryKey: ["pendingProjects"],
    queryFn: () => GetAllProjects(),
    // queryFn: GetProjectsByStatus({ customer: "", status: "PENDING" }),
		refetchInterval: 1000 * 60,	// 1 minute
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		staleTime: 1000 * 60 * 60,	// 1 hour
		retry: 3,
	});

  const filterProjects = () => {
    const projects = projList.data.filter((p) => {
      if (p.status === "PENDING" || p.status === "POSTPONED")
        return true;
      return false;
    }
    );
    setPendingProjects(projects);
  };

  useEffect(() => {
    if (projList) { 
      filterProjects();
    }
  }, [projList]);

  const renderItemAccessory = (props) => (
    <Pressable
      onPress={() => projectPressHandler(props.selectedItem)}
      className={
        "bg-green-300 hover:drop-shadow-xl hover:bg-light-gray p-1 rounded-lg w-28 items-center justify-center border-2 border-solid border-black border-r-4 border-b-4"
      }
    >
      <Text className="text-sm font-semibold">DETAILS</Text>
    </Pressable>
  );

  // Active lightbulb-on
  // Cancelled close-circle
  // Completed checkmark-circle
  // En route truck-alert
  // Pending clock-alert

  const getIconName = (status) => {
    switch (status) {
      case "ACTIVE":
        return "lightbulb-on";
      case "CANCELLED":
        return "close-circle";
      case "COMPLETED":
        return "checkmark-circle";
      case "ENROUTE":
        return "truck-alert";
      default:
        break;
    }
    return "clock-alert";
  };

  const renderItemIcon = (props) => (
    <Icon
      {...props}
      name="clock-alert"
      // name={getIconName(props.selectedItem.status)}
      style={{ color: "black", width: 24, height: 24 }}
    />
  );

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

  const renderProjects = ({ item }) => {
    ////////////////////////////////////////////////////////
    // Title and Description for each ListItem
    ////////////////////////////////////////////////////////

    const strTitle = `${item.projectname} ${item.description}`;
    // description={`${format(item.datetimerequested, "MM/dd/yyyy")} ${

    const strDescription =
      `${item.rigcompany}   Start Date: ${format(item.projectedstartdate, "MM/dd/yyyy")}\n Status: ${item.status}`;
    return (
      <ListItem
        style={{
          backgroundColor: item._id === selectedIndex ? "yellow" : "white",
        }}
        title={strTitle}
        description={strDescription}
        accessoryLeft={(props) =>
          renderItemIcon({ ...{ selectedItem: item, ...props } })
        }
        accessoryRight={(props) =>
          renderItemAccessory({ ...{ selectedItem: item, ...props } })
        }
        backgroundColor="#f9c2ff"
        onPress={(index) => {
          // setDisabledFLag(false);
          setSelectedIndex(item._id);
          pressHandler(item);
        }}
      />
    );
  };

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
    <View w-full h-full>
      <View className="items-center pb-2">
        <Text>
          <Text className="text-green-500 text-2xl font-bold">WORK</Text>
          <Text className="text-black text-2xl font-bold">SIDE</Text>
        </Text>
        <Text className="text-black text-xl font-bold">PENDING PROJECTS</Text>
      </View>
      {pendingProjects.length === 0 ? (
        <View className="items-center p-2">
          <Text className="text-red-500 text-xl font-bold">
            NO PENDING PROJECTS
          </Text>
        </View>
      ) : (
        <List
          style={{ maxHeight: 500 }}
          // data={projList.data}
          data={pendingProjects}
          renderItem={renderProjects}
        />
      )}
    </View>
    <ProjectInfo />
    </>
  );
};

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
});

export default PendingProjects;
