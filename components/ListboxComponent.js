import * as React from "react";
import { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";

const ListboxComponent = () => {
  const [listboxComponentOpen, setListboxComponentOpen] = useState(false);
  const [listboxComponentValue, setListboxComponentValue] = useState("");

  return (
    <View style={styles.listboxComponent}>
      <DropDownPicker
        open={listboxComponentOpen}
        setOpen={setListboxComponentOpen}
        value={listboxComponentValue}
        setValue={setListboxComponentValue}
        placeholder="Request"
        labelStyle={styles.listboxComponentValue}
        textStyle={styles.listboxComponentText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listboxComponentValue: {
    color: "#333",
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Montserrat_bold",
  },
  listboxComponentText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "Montserrat_regular",
  },
  listboxComponent: {
    position: "absolute",
    top: 185,
    left: 26,
    width: 372,
    height: 211,
  },
});

export default ListboxComponent;
