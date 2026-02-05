import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const CustomPicker = ({ options = [], handleCategoryChange }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (itemValue) => {
    setSelectedValue(itemValue);
    handleCategoryChange(itemValue); // Notificar al componente padre
  };

  return (
    <View style={styles.container}>
      <Picker selectedValue={selectedValue} onValueChange={handleChange} style={styles.picker}>
        <Picker.Item label="Selecciona una opción" value="" enabled={false} />
        {options.length > 0 ? (
          options.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))
        ) : (
          <Picker.Item label="No hay opciones disponibles" value="" enabled={false} />
        )}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "40%",
    alignItems: "center",
  },
  picker: {
    width: "80%",
    height: 55,
  },
});

export default CustomPicker;
