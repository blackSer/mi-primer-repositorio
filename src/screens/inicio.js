import React,{useContext, useState,useEffect,useRef } from "react";
import { FlashList } from "@shopify/flash-list";
import { View, Text,StyleSheet,TextInput,Button,FlatList,TouchableOpacity,useWindowDimensions ,ActivityIndicator,Alert, KeyboardAvoidingView,
  Platform} from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Card from "../componentes/card";
import styles from '../styles/estilos'
import Flotante from "../componentes/Flotante";
import RadioGroup from '../componentes/radioButton';
import TicketPreview from "../componentes/TicketPreview";
import { agregarProducto, actualizarCantidad, quitarProducto, eliminarProducto} from "../services/productService";
import { calcularSubtotal, calcularDescuento, generarTicketData,realizarVenta } from "../services/salesService";
import { DataContext } from "../contexts/DataContext";

export default function Inicio({ filteredData,selectedCharacter}) {
  const [producto, setProducto] = useState([]) 
  const [modalVisible, setModalVisible] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showPicker, setShowPicker] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [cant, setCant] = useState(0);
  const [cambio, setCambio] = useState(0)
  const [titulo, setTitulo] = useState('')
  const [loading, setLoading] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState(null); // Estado para la talla seleccionada
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState({});
  const discountOptions = [
    { id: "0", label: "0%", value: 0 },
    { id: "1", label: "10%", value: 0.1 },
    { id: "2", label: "20%", value: 0.2 },
    { id: "3", label: "25%", value: 0.25 },
  ];
  const handleSelect = (value) => {
    console.log("Descuento seleccionado:", value);
    setSelectedId(discountOptions.find((item) => item.value === value)?.id || null);
    setSelectedDiscount(value); // Guardar el valor del descuento seleccionado
  };
  const { user, datos } = useContext(DataContext);

  const subtotal = calcularSubtotal(producto);
  const descuento = calcularDescuento(subtotal, selectedDiscount);
  const ticketData = generarTicketData(producto, selectedDiscount,user?user.username: "Usuario");
  const total = subtotal - descuento;
  
  useEffect(() => {
    // 🔒 Orientacion libre
    ScreenOrientation.lockAsync(
      ScreenOrientation.unlockAsync()
    );
  }, []);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const inputRef = useRef(null);

  const quitarFoco = () => {
    if (inputRef.current) {
      inputRef.current.blur(); // <--- Esta es la línea clave
    }
  };
  const createTwoButtonAlert = (mensaje) =>
    Alert.alert('Alerta', mensaje , [
      {
        text: 'Cancelar',
        onPress: () => {console.log('Cancel Pressed')},
        style: 'cancel',
      },
      mensaje==='¿Estás seguro de que deseas eliminar todos los productos?' ? {text: 'OK', onPress: () => {console.log('OK Pressed');eliminarProducto(setProducto, setSelectedDiscount, setCant, setCambio,setSelectedId);setTallasSeleccionadas({});}}:null,
      mensaje==='No hay suficientes existencias de esta talla' ? {text: 'Crear producto', onPress: () => {console.log('Crear producto manualmente');}}:null,
    ]);

  return (
    
    <View style={[styles.container,{margin:2}]} >
      {/* Modal */}
      <Flotante mostrar={modalVisible} onClose={() => {setModalVisible(false);setShowTicket(false);setShowPicker(false);}} title={titulo}>
      <View>
          {showPicker && <RadioGroup options={discountOptions} selectedId={selectedId} onSelect={handleSelect} />}
          {showTicket && <TicketPreview ticketData={ticketData} realizarVenta={() => realizarVenta(producto, () => eliminarProducto(setProducto, setSelectedDiscount, setCant, setCambio,setSelectedId), setModalVisible, setShowTicket, setShowPicker,setTallasSeleccionadas,quitarFoco,user?user.username: "Usuario")} />}
      </View>
      </Flotante>
      {/* Columna de los Cards */}
      <View style={[styles.column, { borderRadius:5,backgroundColor: "#e5e7e9"}]}>
       <Text style={[style.title]}>Prendas</Text>
        {/* Si se selecciona un personaje, mostrar su información */}
        
          {/* Si no hay selección, mostrar la lista filtrada */}
          <FlashList
            data={filteredData}
            // Usamos el ID compuesto que creamos
            keyExtractor={(item) => item.idUnico} 
            numColumns={isLandscape ? 4 : 3
            }
            key={isLandscape ? "h" : "v"} // 🔴 IMPORTANTE
            estimatedItemSize={240} // 🔥 SOLUCIÓN
            extraData={{
              tallasSeleccionadas,
              producto
            }}
            renderItem={({ item }) => {
              // IMPORTANTE: Buscamos en el carrito usando el idUnico (Corte+Clase)
              // Si usaras solo item.CORTE, se mezclarían las 1ras con las 2das
              // 1. BUSCAMOS LA TALLA SELECCIONADA VISUALMENTE (en el nuevo estado)
              const tallaVisual = tallasSeleccionadas[item.idUnico] || null;

              // 2. BUSCAMOS SI YA ESTÁ EN EL CARRITO (Para mostrar cantidad "Agregado (1)")
              // Nota: Buscamos en el carrito coincidiendo ID y la Talla que estamos viendo actualmente
              const productoEnCarrito = producto.find(
                 (p) => p.idUnico === item.idUnico && p.talla === tallaVisual
              );
              const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;
              // 1. Encontrar existencias de la talla seleccionada
              const varianteSeleccionada = item.VARIANTES.find(v => v.talla === tallasSeleccionadas[item.idUnico]);
              const existenciasActuales = varianteSeleccionada ? varianteSeleccionada.existencias : 0;
              return (
                <View style={[style.column]}>
                  <Card
                    // Título visual: Muestra el corte y la clase
                    title={`${item.CORTE} (${item.CLASE})`} 
                    variantes={item.VARIANTES}
                    cantidadEnCarrito={cantidad}
                    selectedTalla={tallaVisual}
                    precio={item.EXISTENCIAS} // Ojo: item.EXISTENCIAS es solo un numero del primer registro, mejor mostrarlo por variante
              
                    // LÓGICA DE SELECCIÓN (SOLO VISUAL)
                    onSelectTalla={(talla) => {
                       setTallasSeleccionadas(prev => ({
                          ...prev,
                          [item.idUnico]: talla // Guardamos que en la card "3547" se seleccionó la "M"
                       }));
                    }}
                  
                    // LÓGICA DE AGREGAR (SOLO AQUÍ TOCAMOS EL CARRITO)
                    agregar={() => {
                       // Validamos que haya talla seleccionada                       
                       const itemParaCarrito = {
                           
                           // Usamos item.idUnico directamente
                           idUnico: item.idUnico, 
                           corte: item.CORTE,
                           talla: tallaVisual, // Usamos la talla del estado visual
                           existencias: existenciasActuales, // Pasamos las existencias de la talla seleccionada
                           tipo: item.TIPO_PRODUCTO,
                           clase: item.CLASE,

                       };
                       console.log("Agregando al carrito:", itemParaCarrito);
                       // Llamamos a tu servicio 
                       if(existenciasActuales > cantidad ) agregarProducto(itemParaCarrito, setProducto, setCant);                                                                                    
                       else createTwoButtonAlert(existenciasActuales===0  ? 'Crear producto manualmente' : 'No hay suficientes existencias de esta talla');                                                                                   
                    }}
                  />
                </View>
              );
            }}
          />
                
      </View>
      {/* Columna de los productos a vender */}
      <KeyboardAvoidingView style={[{width: isLandscape ? '100%' : '100%',}]} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
>
      <View style={[styles.column1, { backgroundColor: "#e5e7e9",}]}>
        <Text style={style.title}>Carrito de Compras</Text>
        <View style={[styles.row,{backgroundColor:'#00796b',borderTopLeftRadius:10,borderTopRightRadius:10,height:23,textAlign:'center',}]}>
            <Text style={[styles.cell,{width:"20%",fontSize:13,color: "#fafafa"}]}>Cantidad</Text>
            <Text style={[styles.cell,{width:"35%",fontSize:13,color: "#fafafa",textAlign:'center',}]}>Descripción</Text>
            <Text style={[styles.cell,{width:"12%",fontSize:13,color: "#fafafa"}]}>Talla</Text>
            <Text style={[styles.cell,{width:"20%",fontSize:13,color: "#fafafa"}]}>Precio</Text>
        </View> 
        <View style={[styles.row, { height: "auto",justifyContent:'flex-end',flex:1,}]}>  
          {/* Vista productos a vender */}
          
          {producto.length === 0 ? (
            <Text style={style.emptyText}>No hay productos agregados</Text>
          ) : (
            <FlatList
              data={producto}
              keyExtractor={(item) => item.idUnico + '-' + item.talla}            
              renderItem={({ item }) => (
                <View style={[styles.row, { height: 30 }]}>
                  {/* Cantidad del producto */}
                  <TextInput ref={inputRef} onChangeText={(text) => {                   
                    actualizarCantidad(item.idUnico, item.talla, text,setProducto)                   
                  }}  keyboardType="numeric"  style={[styles.cantidadInput,{ width: "20%",  }]} >
                    {String(item.cantidad)}
                  </TextInput>
                  <Text style={[{ width: "35%", fontSize: 13,textAlign:'center', }]}>{item.tipo?item.tipo: item.idUnico}</Text>
                  <Text style={[{ width: "14%", fontSize: 13 }]}>{item.talla}</Text>
                  <Text style={[{ width: "20%", fontSize: 13 }]}>${item.existencias}</Text>
                  <TouchableOpacity  onPress={() => {
                    quitarProducto(item.idUnico, item.talla, setProducto, setCant)                  
                     tallasSeleccionadas[item.idUnico] === item.talla && setTallasSeleccionadas(prev => {                     
                      const updated = { ...prev };
                      delete updated[item.idUnico];
                      return updated;
                    });                                      
                  }} style={[styles.icon]}>
                    <Icon name="close" size={22} color="#d32020" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          
        </View>
        {/*calculos y totales*/}
        <View  style={[styles.row,{borderWidth: 0.5, borderRadius: 5,margin:0,height:'auto', },]}>
          <View style={[{ flexDirection: "column" }]}>
            <View style={[styles.row, {}]}>
              <Text style={[styles.column3, { textAlign: "center", fontSize:14 }]}>{producto.length} Items</Text>
              <Text style={[styles.column3,{ textAlign: "center", fontWeight: "bold", paddingRight: 10 },]}>Subtotal: ${subtotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.row, {}]}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setShowPicker(true);
                  setTitulo("Descuento");
                }}
                style={[styles.column3, { textAlign: "center" }]}>
                <Text style={[{ textAlign: "center", textDecorationLine: "underline", color: "red", fontSize: 14, },]}>Descuento</Text>
              </TouchableOpacity>
              <Text style={[styles.column3, { textAlign: "center" }]}>x ({selectedDiscount}%)-${descuento.toFixed(2)}</Text>
            </View>
            <View style={[styles.row,{ justifyContent: "flex-end", paddingRight: 32 },]}>
              <Text style={[styles.column3, {}]}>Recibí</Text>
              <TextInput
                
                ref={inputRef} // <--- Asignar la referencia
                onChangeText={(text) => setCambio(text)}
                value={cambio}
                keyboardType="numeric"
                style={[styles.column2,{  fontSize: 14,  borderRadius: 10,  textAlign: "center",  borderWidth: 0.8,  width: 90,  height: 35,  paddingVertical: 8,  paddingHorizontal: 25,},]}></TextInput>
            </View>
            <View style={[styles.row, {}]}>
              <Text style={[styles.column3,{ textAlign: "center", fontWeight: "bold", fontSize: 18 },  ]}>Total:</Text>
              <Text style={[   styles.column3,   {  textAlign: "right",  paddingRight: 32,  fontWeight: "bold",  fontSize: 18,}, ]}>
                ${total.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.row, {}]}>
              <Text style={[styles.column3, { textAlign: "center" }]}>Cambio</Text>
              <Text style={[styles.column3, { textAlign: "center" }]}>$ {cambio - (subtotal - descuento).toFixed(2)}</Text>
            </View>
            <View style={[styles.row, { justifyContent: "center" }]}>
              <View style={[styles.column3, {}]}>
                {/* Botón para eliminar */}
                <TouchableOpacity onPress={() => {createTwoButtonAlert(producto.length>0?'¿Estás seguro de que deseas eliminar todos los productos?': 'No hay productos para eliminar'); 
                  }
                }>
                  <Icon name="delete" size={30} color="ffff" />
                </TouchableOpacity>
              </View>
              <View style={[styles.column3, {}]}>
                {cambio >total && producto.length > 0 ? (
                  <Button title="Pagar" onPress={() => {
                    setModalVisible(true);setShowTicket(true);setTitulo("Proceder al pago");}}/>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
    
  );
}
const style = StyleSheet.create({
  column: {
    flex: 1,
    padding: 0, // Espaciado entre elementos  
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center"
  },
  result: {
    fontSize: 18,
    color: "blue",
  },
  productosContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#e6e6e6",
    padding: 15,
    borderRadius: 10,
  },
  emptyText: {
    margin:'auto',
    fontSize: 16,
    color: "gray",
  },
});