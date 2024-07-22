import React from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useTheme, Avatar, Title, Caption, Drawer } from "react-native-paper";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

export function DrawerContent(props) {
  const navigation = useNavigation();

  const paperTheme = useTheme();

  const SystemLogOut = () => {
    // Need confirm logout
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {
          Toast.show({
            type: "success",
            text1: "Workside Software",
            text2: "Log Out Canceled!",
            visibilityTime: 3000,
            autoHide: true,
          });
        },
      },
      { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <Avatar.Image
                source={{
                  uri: "https://api.adorable.io/avatars/50/abott@adorable.png",
                }}
                size={50}
              />
              <View style={{ marginLeft: 15, flexDirection: "column" }}>
                <Title style={styles.title}>Mike Hunt</Title>
                <Caption style={styles.caption}>mike_hunt@xyzoil.com</Caption>
              </View>
            </View>
          </View>

          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Home"
              onPress={() => {
                props.navigation.navigate("ActiveRequests");
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="atom" color={color} size={size} />
              )}
              label="Select Project"
              onPress={() => {
                props.navigation.navigate("Select Project");
              }}
            />
            {/* <DrawerItem
              icon={({ color, size }) => (
                <Icon name="atom" color={color} size={size} />
              )}
              label="Active Projects"
              onPress={() => {
                props.navigation.navigate("Active Projects");
              }}
            /> */}
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="pause-circle" color={color} size={size} />
              )}
              label="Pending Projects"
              onPress={() => {
                props.navigation.navigate("Pending Projects");
              }}
            />
            {/* <DrawerItem
              icon={({ color, size }) => (
                <Icon name="archive" color={color} size={size} />
              )}
              label="Archived Projects"
              onPress={() => {
                props.navigation.navigate("Archived Projects");
              }}
            /> */}
          </Drawer.Section>
          {/* <Drawer.Section title="Preferences"> */}
          {/* <TouchableRipple onPress={() => {toggleTheme()}}> */}
          {/* <TouchableRipple>
                        <View style={styles.preference}>
                                <Text>Dark Theme</Text>
                                <View pointerEvents="none">
                                    <Switch value={paperTheme.dark}/>
                                </View>
                            </View>
                        </TouchableRipple> */}
          {/* </Drawer.Section> */}
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={() => SystemLogOut()}
        />
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});