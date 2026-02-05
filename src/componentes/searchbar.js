import React, { useState,useContext,useEffect} from "react"; 
import { View, TextInput, StyleSheet,FlatList, Text, TouchableOpacity} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DataContext } from "../contexts/DataContext"; // Importar el contexto
import Select from "../componentes/picker";

export default function SearchBar({ onSelect,onFilter,limpiar,corte }) {  
  const { datos, user, logout, folio, nuevoFolio } = useContext(DataContext); // Obtener los datos del contexto
  const [search, setSearch] = useState('');
  //const [folio, setFolio] = useState()
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Estado del Picker
  const categoryOptions = [
    { label: "Corte", value: "CORTE" },
    { label: "Estilo", value: "ESTILO" },
    //{ label: "Sku", value: "SKU" },
    { label: "Tipo de prenda", value: "TIPO_PRODUCTO" },
  ];
  
  useEffect(() => {
    onFilter(datos); // Si está vacío, mostrar todos los datos    
  }, [datos]);

  //Filtrado de la busqueda
  const handleSearch = (text) => {   
    setSearch(text);
    let filteredResults = datos;
    const terms = text.toLowerCase().split(" ");
    if (text.length > 0) {  
      filteredResults = filteredResults.filter((item) =>
        terms.every(term =>
        //console.log(item)||
        item.CORTE?.toLowerCase().includes(term) ||
        item.ESTILO?.toLowerCase().includes(term) ||
        item.TIPO_PRODUCTO?.toLowerCase().includes(term)
        )
      );
    }
    if (selectedCategory) {
      filteredResults = filteredResults.filter((item) => item.CORTE === selectedCategory || item.ESTILO === selectedCategory || item.TIPO_PRODUCTO === selectedCategory);
    }
    //setResults(filteredResults); //muestra una lista de busqueda relacionada 
    onFilter(filteredResults); // Pasar los datos filtrados
    
  };

  // Cuando se selecciona un personaje, se pasa el objeto completo
  const handleSelect = (item) => {
    setSearch(search); // Mostrar el nombre seleccionado en el input
    setResults([]); // Ocultar la lista de sugerencias
    onSelect(item); // Pasar todo el objeto del personaje
    setFolio(item.id);
  };
  //Agregar nuevo folio
  
  const limpiarCampos = () => {
    setResults([]);
    setSearch([]);
    limpiar('');
    onFilter(datos); // Si está vacío, mostrar todos los datos
  }
  return (
    <View style={styles.container}>     
      <TextInput style={styles.input} placeholder="Buscar..." value={search} onChangeText={handleSearch} />  
      {search.length ?  (
        <TouchableOpacity onPress={limpiarCampos}> 
          <Icon name="clear" size={30} color="#000" style={[{marginRight:0,margin:'auto'}]} /> 
        </TouchableOpacity>
      ):null}   
      {/*<Select style={styles.picker} options={categoryOptions} handleCategoryChange={setSelectedCategory}>
        <Text text={corte}/> 
      </Select>*/}   
      <Text style={[{color:'#E1523D'}]}>Folio: {folio}</Text>
      <TouchableOpacity onPress={nuevoFolio}>           
          <Icon name="add" size={28} color="#000" style={[{marginRight:0,margin:'auto'}]} /> 
        </TouchableOpacity>
      {results.length > 0 && (
        <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        style={styles.resultsList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <Text style={styles.resultText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      )}
      {user && (
        <View style={styles.userContainer}>
          <Text style={styles.userText}>{user.username}</Text>
          <TouchableOpacity onPress={logout}>
            <Icon name="logout" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Alinear en fila
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  input: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 0,
    paddingHorizontal: 25,
    borderRadius: 10,
    textAlign: "center",
    flex: 1, // Ocupar espacio disponible
    marginRight: 10, // Espacio entre input y picker
    borderWidth: 1,
    borderColor: "gray",
    fontSize: 16,
    height: 30,
  },
  resultsList: {
    backgroundColor: "white",
    position: "absolute",
    top: 65,
    width: "100%",
    zIndex: 1,
    borderRadius: 10,
    maxHeight: "500%",
    elevation: 5,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    fontSize: 16,
  },
  picker: {
    width: "100%", // Ajustar el ancho del Picker
    backgroundColor: "#f9f9f9",
  },
  icon: {
    margin: "auto",
  },

  userContainer: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  userText: { marginRight: 5, fontWeight: "bold" },
});
