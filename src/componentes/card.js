import React,{memo} from 'react';
import { View, Text, StyleSheet,Image,TouchableOpacity,PixelRatio,Alert } from 'react-native';


const fontScale = PixelRatio.getFontScale();
const getFontSize = size => size / fontScale;

const Card = ({ title, variantes, selectedImage, agregar, cantidadEnCarrito, selectedTalla, onSelectTalla, estilo }) => {
  
  const imageSource = selectedImage ? { uri: `data:image/jpeg;base64,${selectedImage}` } : null;
  // 1. Encontrar datos de la talla seleccionada
  const varianteSeleccionada = variantes.find(v => v.talla === selectedTalla);
  const existenciasActuales = varianteSeleccionada ? varianteSeleccionada.existencias : 0;
  
  // 2. Determinar si el botón de agregar debe estar habilitado
  // Se habilita solo si hay talla seleccionada Y hay existencias
  const botonHabilitado = selectedTalla && existenciasActuales > 0;

  return (
    <View style={[styles.card, { backgroundColor: cantidadEnCarrito > 0 ? "#e0f7fa" : "#ffffff" }]}>
      
      {/* IMAGEN */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[{ fontSize: 11,textAlign: "center",}]}>{estilo}</Text>
        {/* INFO DE EXISTENCIAS */}
        <Text style={styles.subtitle}>
          Existencias: <Text style={{fontWeight: 'bold', color: existenciasActuales === 0 && selectedTalla ? 'red' : 'black'}}>
            {selectedTalla ? existenciasActuales - cantidadEnCarrito : "Selecciona talla"}
          </Text>
        </Text>

        {/* SELECTOR DE TALLAS */}
        <View style={styles.tallaSelector}>
          {variantes.map((v, index) => (
            <TouchableOpacity
              key={`${index}-${v.talla}`} 
              style={[
                styles.tallaButton, 
                { 
                  // Si está seleccionada: Verde oscuro. Si no: Gris.
                  backgroundColor: selectedTalla === v.talla  ? "#00796b" : "#eeeeee",
                  // Si no hay stock de esa talla específica, le bajamos la opacidad visualmente
                  opacity: v.existencias === 0 ? 0.5 : 1
                }
              ]}
              onPress={() => {
                if(selectedTalla !== v.talla)
                onSelectTalla(v.talla)
                else onSelectTalla()
              }}
              >
              <Text style={[
                 styles.tallaButtonText, 
                 { color: selectedTalla === v.talla ? "white" : "black" }
              ]}>
                {v.talla}
              </Text>
            </TouchableOpacity>
          ))
          
          }
        </View>

        {/* BOTÓN AGREGAR */}
        <TouchableOpacity
          style={[
            styles.addButton, 
            { 
              // Cambia de color si ya hay items en carrito, o se pone gris si está deshabilitado
              backgroundColor: !botonHabilitado  ? "#ccc" : (cantidadEnCarrito > 0 ? "#00796b" : "#009688") 
            }
          ]}
          onPress={() => {
            if (!selectedTalla) {
              Alert.alert("Atención", "Por favor selecciona una talla primero.");
              return;
            }
            if (existenciasActuales === 0) {
              Alert.alert("Agotado", "No hay existencias de esta talla.");
              return;
            }
            // Si pasa las validaciones, ejecutamos agregar pasando la talla
            agregar(selectedTalla);
          }}
          // Deshabilitamos el touch nativo si no hay stock para evitar clicks dobles
          disabled={selectedTalla && existenciasActuales === 0}
        >
          <Text style={[
            styles.addButtonText, 
            { color: !botonHabilitado ? "#666" : "#ffffff" }
          ]}>
            {cantidadEnCarrito > 0 ? `🛒 Agregado (${cantidadEnCarrito})` : "🛒 Agregar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
  borderRadius: 15,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  width: 155,
  height: 350,
  margin: 5,
  backgroundColor: "#fff",
  borderWidth: 0.2,
  borderColor: "gray",
},

image: {
  width: "100%",
  height: 100,
},

content: {
  padding: 10,
  flex: 1,
  justifyContent: "space-between",
},

title: {
  fontSize: 13,
  fontWeight: "bold",
  color: "#37474f",
  textAlign: "center",
  marginBottom: 5,
  height:50
},

subtitle: {
  fontSize: 11,
  color: "#607d8b",
  textAlign: "center",
},

talla: {
  fontWeight: "bold",
  color: "#00796b",
},

tallaSelector: {
  flexDirection: "row",
  justifyContent: "center",
  marginVertical: 6,
  flexWrap: "wrap",
  gap: 4,
},

tallaButton: {
  borderWidth: 1,
  borderColor: "#b0bec5",
  borderRadius: 6,
  paddingVertical: 2,
  paddingHorizontal: 6,
  marginHorizontal: 2,
},

tallaButtonSelected: {
  backgroundColor: "red",
  borderColor: "#00796b",
},

tallaButtonText: {
  fontSize: 14,
  color: "#000",
},

tallaButtonTextSelected: {
  color: "#e71818ff",
},

addButton: {
  borderRadius: 8,
  paddingVertical: 6,
  marginTop: 5,
  alignItems: "center",
},

addButtonText: {
  fontWeight: "bold",
  fontSize: 12,
},

});

export default memo (Card);
