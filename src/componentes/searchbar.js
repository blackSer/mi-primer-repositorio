import React, { useState,useContext,useEffect} from "react"; 
import { View, TextInput, StyleSheet,Image, Text, TouchableOpacity,Modal} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DataContext } from "../contexts/DataContext"; // Importar el contexto
import { CameraView, useCameraPermissions } from "expo-camera";
const img = require('../assets/logoadc.png');

export default function SearchBar({onFilter,limpiarTrigger , onAutoAdd }) {  
  const { datos, user, logout, cargarTallas } = useContext(DataContext); // Obtener los datos del contexto
  const [search, setSearch] = useState('');
  //const [folio, setFolio] = useState()
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Estado del Picker
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [ultimoScan, setUltimoScan] = useState(null);
  useEffect(() => {
  if (!permission) {
    requestPermission();
  }
  }, []);
  
  const handleBarcodeScanned = ({ data }) => {
    if (data === ultimoScan && scanned) return; // evita lecturas múltiples
    
    setUltimoScan(data);
    setScanned(true);
    setScanning(false);
    
    const limpio = data.trim();
    const corteLimpio = limpio.split(" ")[0];
    
    // 💡 IMPORTANTE: Si tu código de barras contiene la talla (ej. "3547 M"), la extraemos. 
    // Si no la incluye, deberás definir una lógica para asignarla o preguntar.
    const tallaEscaneada = limpio.split(" ")[1].replace(/\D/g, "");

    // ✅ Buscamos el producto EXACTO en todos los datos
    const productoEncontrado = datos.find(item => 
      item.CORTE?.toLowerCase() === corteLimpio.toLowerCase() || 
      item.idUnico?.toLowerCase() === corteLimpio.toLowerCase()
    );

    if (productoEncontrado && onAutoAdd) {
      // Si existe en la base de datos, disparamos el evento para agregarlo al carrito.
      // Le ponemos un timestamp para que si escaneas el mismo 2 veces, React lo detecte como un cambio nuevo.
      //onAutoAdd({ producto: productoEncontrado, talla: tallaEscaneada, timestamp: Date.now() });
      setSearch(corteLimpio); // Opcional: poner el texto en el input
    } 

    handleSearch(corteLimpio, tallaEscaneada); // Filtrar la lista con el corte escaneado y la talla (si la tienes)
    //console.log("Talla limpio:", tallaEscaneada);
    //console.log("Corte limpio:", corteLimpio);
    // 👉 usa tu buscador actual
    
  };

  const categoryOptions = [
    { label: "Corte", value: "CORTE" },
    { label: "Estilo", value: "ESTILO" },
    //{ label: "Sku", value: "SKU" },
    { label: "Tipo de prenda", value: "TIPO_PRODUCTO" },
  ];
  
  useEffect(() => {
    if (!search) {
      onFilter(datos);
    }
  }, [datos]);
  
  //Filtrado de la busqueda
  const handleSearch = (text,talla) => {   
      setSearch(text);
      cargarTallas(text); // Cargar tallas relacionadas al corte buscado
      let filteredResults = datos;
      const searchLower = text.toLowerCase().trim();

      if (searchLower.length > 0) {
      
        // ✅ 1. buscar coincidencias EXACTAS primero
        const exactMatches = datos.filter(item =>
          item.CORTE?.toLowerCase() === searchLower ||
          item.idUnico?.toLowerCase() === searchLower
        );
      
        // ✅ 2. si hay exactas → usar SOLO esas
        if (exactMatches.length > 0) {
          filteredResults = exactMatches;
        } else {
          // 🔎 3. si no hay exactas → búsqueda parcial normal
          filteredResults = datos.filter(item =>
            item.CORTE?.toLowerCase().includes(searchLower) ||
            item.ESTILO?.toLowerCase().includes(searchLower) ||
            item.TIPO_PRODUCTO?.toLowerCase().includes(searchLower) ||
            item.idUnico?.toLowerCase().includes(searchLower)
          );
        }
      }

      if (selectedCategory) {
        filteredResults = filteredResults.filter(item =>
          item.CORTE === selectedCategory ||
          item.ESTILO === selectedCategory ||
          item.TIPO_PRODUCTO === selectedCategory
        );
      }
      onFilter(filteredResults);
      if(scanning){
        onAutoAdd && onAutoAdd({ producto: filteredResults[0], talla: talla, timestamp: Date.now(),  }); // Agrega el primer resultado automáticamente
      }      
  };

  // Cuando se selecciona un personaje, se pasa el objeto completo
  const handleSelect = (item) => {
    setSearch(search); // Mostrar el nombre seleccionado en el input
    setResults([]); // Ocultar la lista de sugerencias
    setFolio(item.id);
  };
  //Agregar nuevo folio
  
  const limpiarCampos = () => {
    setResults([]);
    setSearch('');
    onFilter(datos); // Si está vacío, mostrar todos los datos
    cargarTallas(''); // Limpiar tallas
  }
    useEffect(() => {
    limpiarCampos();
  }, [limpiarTrigger]);
  return (
    <View style={styles.container}>    
      <Modal visible={scanning} animationType="slide">
          <View style={{ flex: 1 }}>
            {!permission?.granted ? (
              <Text style={{ textAlign: "center", marginTop: 50 }}>
                Sin permiso de cámara
              </Text>
            ) : (
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr","ean13","ean8","code128","code39","upc_a","upc_e",],
                }}
                onBarcodeScanned={handleBarcodeScanned}
              />
            )}
            {/* botón cancelar */}
            <TouchableOpacity
              onPress={() => setScanning(false)}
              style={{position: "absolute",bottom: 40,alignSelf: "center",backgroundColor: "red",padding: 15,borderRadius: 10,
              }}>
              <Text style={{ color: "#fff" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
      </Modal>
      <View style={{width: '20%',flexDirection: "row",alignItems: "center", justifyContent: "center",marginLeft: 0,padding: 0}}>
        <Image 
          source={img} 
          style={{ width: '25%', height: 40, marginRight:0, padding: 0 }}
        />
      </View>  
      <View style={{width: '60%',flexDirection: "row",position: "relative",alignItems: "center", justifyContent: "center",marginLeft: 0}}>
        <TextInput style={styles.input} placeholder="Buscar..." value={search} onChangeText={(text) => {handleSearch(text)}} />  
        <TouchableOpacity style={[{marginLeft: 30}]}
          onPress={() => {
            setScanned(false);
            setScanning(true);
          }}>
          <Icon name="qr-code-scanner" size={38} color="#000" />
        </TouchableOpacity>
        {search.length ?  (
          <TouchableOpacity onPress={limpiarCampos} style={[{width: 60,justifyContent: "center",alignItems: "center",marginRight: 110, position: "absolute", right: 0, top: 6}]}> 
            <Icon name="clear" size={36} color="#00796b" style={[{marginRight:0,margin:'auto'}]} /> 
          </TouchableOpacity>
        ):null}       
      </View>
         

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
    //paddingHorizontal: 10,
    //justifyContent: "space-between",
    width: "100%",
    height: 50,
  },
  input: {
    backgroundColor: "#e8eaed",
    paddingVertical: 0,
    paddingHorizontal: 25,
    borderRadius: 18,
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e8eaed",
    fontSize: 16,
    height: 40,
    width: "70%",
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

  userContainer: { flexDirection: "row",width: "20%", alignItems: 'center', marginLeft: 50 },
  userText: { marginRight: 5, fontWeight: "bold",fontSize: 16 },
});
