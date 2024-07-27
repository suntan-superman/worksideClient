import * as React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Icon, List, ListItem, IndexPath } from "@ui-kitten/components";
import axios from "axios";
import { useStateContext } from "../src/contexts/ContextProvider";
import { format, set } from "date-fns";

const PendingProjects = () => {
  const navigation = useNavigation();
  const { apiURL } = useStateContext();
  const [pendingProjects, setPendingProjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));

  ////////////////////////////////////////////////////////
  // Get a List of Pending Projects
  ////////////////////////////////////////////////////////
  const GetPendingProjects = async () => {
    const strAPI = `${apiURL}/api/project`;
    try {
      const response = await axios.get(strAPI);
      // Filter out the pending nd postponed projects
      const projects = response.data.filter((p) => {
        if (p.status === "PENDING" || p.status === "POSTPONED") {
          return true;
        }
        return false;
      });

      setPendingProjects(projects);
    } catch (error) {
      console.log("error", error);
    }
    setSelectedIndex(new IndexPath(0));
  };

  useEffect(() => {
    // Get a list of pending projects
    GetPendingProjects();
  }, []);

  const renderItemAccessory = (props) => (
    <Pressable
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

  const renderProjects = ({ item }) => {
    ////////////////////////////////////////////////////////
    // Title and Description for each ListItem
    ////////////////////////////////////////////////////////

    var strTitle = item.projectname + " " + item.description;
    // description={`${format(item.datetimerequested, "MM/dd/yyyy")} ${

    var strDescription =
      item.rigcompany +
      "   Start Date: " +
      `${format(item.projectedstartdate, "MM/dd/yyyy")}` +
      "\n Status: " +
      item.status;
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
          // setSelectedIndex(item._id);
          // pressHandler(item);
        }}
      />
    );
  };

  return (
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
          data={pendingProjects}
          renderItem={renderProjects}
        />
      )}
    </View>
  );
};

export default PendingProjects;
