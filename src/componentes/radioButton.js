import React from "react";
import RadioGroup from "react-native-radio-buttons-group";

const CustomRadioButton = ({ options, selectedId, onSelect }) => {
  
  const handleSelect = (id) => {
    // 👉 Si se vuelve a tocar el mismo descuento, se deselecciona
    if (id === selectedId) {
      onSelect(null); // o 0 si manejas descuentos numéricos
      return;
    }

    const selectedOption = options.find(item => item.id === id);
    if (selectedOption) {
      onSelect(selectedOption.value);
    }
  };

  return (
    <RadioGroup
      radioButtons={options}
      onPress={handleSelect}
      selectedId={selectedId}
    />
  );
};

export default CustomRadioButton;
