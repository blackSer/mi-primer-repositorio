import React, { useContext } from "react";
import { View, Text, StyleSheet,FlatList,Image } from "react-native";
import { DataContext } from "../contexts/DataContext"; // Importar contexto

export default function Catalogos({ filteredData, selectedCharacter }) {
  const { loading } = useContext(DataContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogos</Text>      
      {/* Si se selecciona un personaje, mostrar su información */}
      { selectedCharacter ? (
        <View style={styles.card}>
          <Image source={{ uri: `data:image/jpeg;base64,${selectedCharacter.Imagen}` }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{selectedCharacter.name}</Text>
                <Text style={styles.details}>{selectedCharacter.species} - {selectedCharacter.status}</Text>
              </View>
        </View>
      ) : (
        // Si no hay selección, mostrar la lista filtrada
        <FlatList
          data={filteredData}
          //keyExtractor={(item) => item.Id}          
          renderItem={({ item }) => (
            <View style={styles.card}>
             {/* <Image source={{ uri: `data:image/jpeg;base64,${item.Imagen}` }} style={styles.image} /> */}
              <View style={styles.info}>
                <Text style={styles.name}>{item.DESCRIPCION ? item.DESCRIPCION : item.CORTE}</Text>
                <Text style={styles.details}> {item.ESTILO ? 'Estilo '+ item.ESTILO : item.CORTE}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  info: {
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "#555",
  },
});

