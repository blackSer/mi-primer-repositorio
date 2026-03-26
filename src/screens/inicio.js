import React,{useContext, useState,useEffect,useRef } from "react";
import { StatusBar } from 'expo-status-bar';
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

export default function Inicio({ filteredData,limpiarBusqueda, productoEscaneado}) {
  const [producto, setProducto] = useState([]) 
  const [modalVisible, setModalVisible] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showPicker, setShowPicker] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [selectedTipoVentaId, setSelectedTipoVentaId] = useState(null);
  const [tipoVentaSeleccionado, setTipoVentaSeleccionado] = useState(null);
  const [cant, setCant] = useState(0);
  const [cambio, setCambio] = useState(0)
  const [titulo, setTitulo] = useState('')
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState({});
  const ultimoScan = useRef(0);
  //const [ticketData, setTicketData] = useState(null);
  const [folio, setFolio] = useState([]);
  const { user, loading, cargarProductos, imageUri} = useContext(DataContext);

  const discountOptions = [
    { id: "0", label: "0%", value: 0 },
    { id: "1", label: "10%", value: 0.09 },
    { id: "2", label: "25%", value: 0.225 },
  ];
  const tipodeVenta = [
    { id: "0", label: "Venta al publico", value: "Venta al publico" },
    { id: "1", label: "Venta a cliente", value: "Venta a cliente" },
    { id: "2", label: "Venta empleado", value: "Venta empleado" },
  ];
  // 2. Ajusta las funciones de selección
  const handleSelectDiscount = (value) => {
    console.log("Descuento seleccionado:", value);
    const option = discountOptions.find((item) => item.value === value);
    setSelectedDiscountId(option ? option.id : null);
    setSelectedDiscount(value);
  };

  const handleTipoVentaSelect = (value) => {
    console.log("Tipo de venta seleccionado:", value);
    const option = tipodeVenta.find((item) => item.value === value);
    setSelectedTipoVentaId(option ? option.id : null);
    setTipoVentaSeleccionado(value);
  };
  
  const subtotal = calcularSubtotal(producto);
  const descuento = calcularDescuento(subtotal, selectedDiscount);
  const ticketData = generarTicketData(producto, selectedDiscount, tipoVentaSeleccionado, user ? user.username : "Usuario",folio);
  const total = subtotal - descuento;
  const cambioCalculado =Math.round((cambio - total) * 100) / 100;
  
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
    Alert.alert('Alerta', mensaje === '1' ? '¿Estás seguro de que deseas eliminar todos los productos?' : mensaje ==='2' ? 'No hay productos para eliminar' : 'No hay suficientes existencias de esta talla', [
      {
        text: 'Cancelar',
        onPress: () => {console.log('Cancel Pressed')},
        style: 'cancel',
      },
      mensaje==='1' ? {text: 'OK', onPress: () => {console.log('OK Pressed');
        eliminarProducto(setProducto, setSelectedDiscount, setCant, setCambio,setSelectedDiscountId,setSelectedTipoVentaId,setTipoVentaSeleccionado);setTallasSeleccionadas({});}}:null,
      //mensaje==='2' ? {text: 'Crear producto', onPress: () => {console.log('Crear producto manualmente');}}:null,
  ]);
  //Efecto mágico que se dispara al escanear
  //useEffect(() => {
  //  // Si hay un producto escaneado y es diferente al último (usando el timestamp)
  //  if (productoEscaneado && productoEscaneado.timestamp !== ultimoScan.current) {
  //    ultimoScan.current = productoEscaneado.timestamp; // Actualizamos el ref
//
  //    const { producto: item, talla } = productoEscaneado;
  //    // Buscamos cuántos hay en el carrito actualmente para validar existencias
  //    const productoEnCarrito = producto.find(p => p.idUnico === item.idUnico && p.talla === talla );
  //    const cantidadEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;
  //    setTallasSeleccionadas(prev => ({
  //      ...prev,
  //      [item.idUnico]: talla // Actualizamos la talla visual al escanear
  //    }));
  //    // Buscamos la variante exacta para ver cuántos hay en inventario
  //    const varianteSeleccionada = item.VARIANTES?.find(v => v.talla === talla );
  //    const existenciasActuales = varianteSeleccionada ? varianteSeleccionada.existencias : 0;
//
  //    if (existenciasActuales > cantidadEnCarrito) {
  //      // Armamos el objeto igual que en tu Card
  //      const itemParaCarrito = {
  //        idUnico: item.idUnico,
  //        corte: item.CORTE,
  //        talla: talla,
  //        precio: item.PRECIO,
  //        tipo: item.TIPO_PRODUCTO,
  //        clase: item.CLASE,
  //      };        
  //      console.log("Agregando producto por escáner:", itemParaCarrito);
  //      // Tu función existente hará la magia: si ya existe le suma +1, si no, lo agrega.
  //      agregarProducto(itemParaCarrito, setProducto, setCant);
  //      
  //    } else {
  //      createTwoButtonAlert('3'); // Sin suficientes existencias
  //    }
  //  }
  //}, [productoEscaneado, producto]); // Escucha cambios en el escaneo o en el carrito

  return (    
    <View style={[styles.container,{margin:2}]} >
      {/* Modal */}
      <Flotante mostrar={modalVisible} onClose={() => {setModalVisible(false);setShowTicket(false);setShowPicker(false);}} title={titulo}>
      <View>
          {showPicker && <RadioGroup options={titulo ==='Tipo de venta' ? tipodeVenta : discountOptions} selectedId={titulo === 'Tipo de venta' ? selectedTipoVentaId : selectedDiscountId} onSelect={titulo === 'Tipo de venta' ? handleTipoVentaSelect : handleSelectDiscount} />}

          {showTicket && (
          <TicketPreview 
            ticketData={ticketData} 
            // Pasamos la función y nos aseguramos de que RETORNE el folio
            realizarVenta={async () => {
              const foli = await realizarVenta(producto, user ? user.username : "Usuario", selectedDiscount, tipoVentaSeleccionado); 
              console.log("Folio recibido desde salesService: ", foli);
              setFolio(foli)
              return foli; // Es vital retornar esto para que el ticket lo atrape
            }}
            // Opcional pero recomendado: Pasar otra función para limpiar todo DESPUÉS de imprimir
            limpiarVenta={() => {
              cargarProductos(); limpiarBusqueda(); setModalVisible(false); setShowTicket(false); setShowPicker(false);
              setTallasSeleccionadas({}); quitarFoco(); setProducto([]); setSelectedDiscount(null); setCant(0); 
              setCambio(0); setSelectedDiscountId(null); setSelectedTipoVentaId(null); setTipoVentaSeleccionado([]);
            }}
          />
        )}
      </View>
      </Flotante>
      {/* Columna de los Cards */}
      <View style={[styles.column, { borderRadius:5,backgroundColor: "#e5e7e9"}]}>
       <Text style={[style.title]}>Prendas</Text>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {/* Si se selecciona un personaje, mostrar su información */}
        
          {/* Si no hay selección, mostrar la lista filtrada */}
          <FlashList
            //onRefresh={cargarProductos}
            data={filteredData}
            // Usamos el ID compuesto que creamos
            keyExtractor={(item) => item.idUnico} 
            numColumns={isLandscape ? 4 : 3
            }
            key={`${isLandscape ? "h" : "v"}`} // 🔴 IMPORTANTE
            estimatedItemSize={240} // 🔥 SOLUCIÓN
            extraData={{
              tallasSeleccionadas,
              producto,
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
                    estilo={item.DESCRIPCION ? item.DESCRIPCION : item.ESTILO}
                    variantes={item.VARIANTES}
                    cantidadEnCarrito={cantidad}
                    selectedTalla={tallaVisual}
                    precio={item.PRECIO} // Ojo: item.EXISTENCIAS es solo un numero del primer registro, mejor mostrarlo por variante              
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
                           precio: item.PRECIO, // Pasamos las existencias de la talla seleccionada
                           tipo: item.TIPO_PRODUCTO,
                           clase: item.CLASE,
                           descripcion: item.DESCRIPCION ? item.DESCRIPCION : item.ESTILO, // Usamos descripción si está disponible, sino estilo
                       };
                       // Llamamos a tu servicio 
                       console.log('Has agregado al carrito: ',itemParaCarrito)
                       if(existenciasActuales > cantidad) agregarProducto(itemParaCarrito, setProducto, setCant);                                                                                    
                       else  createTwoButtonAlert('3');                                                            
                    }}
                  />
                </View>
              );
            }}
          />
                
      </View>
      {/* Columna de los productos a vender */}
      <KeyboardAvoidingView style={[{width: isLandscape ? '100%' : '100%',}]} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
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
                  <Text style={[{ width: "20%", fontSize: 13 }]}>${(item.cantidad * item.precio).toFixed(2)}</Text>
                  <TouchableOpacity  onPress={() => {
                    quitarProducto(item.idUnico, item.talla, setProducto, setCant)                  
                                                  
                  }} style={[styles.icon]}>
                    <Icon name="close" size={22} color="#d32020" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          
        </View>
        {/*calculos y totales*/}
        <View  style={[styles.row,{borderWidth: 0.5, borderRadius: 15,margin:5,height:'auto', },]}>
          <View style={[{ flexDirection: "column",margin:5 }]}>
            {/* TIPO DE VENTA */}
            <View style={[styles.row, {}]}>
              <View style={[styles.column5,{justifyContent: "center",alignItems:'center'}]}>
                <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setShowPicker(true);
                  setTitulo("Tipo de venta");
                }}
                style={[ { alignItems: "center" }]}>
                <Icon name="diversity-3" size={34} color="ffff" />
                <Text style={[{  textDecorationLine: "underline", color: "red", fontSize: 12, },]}>Tipo de venta</Text>                
                </TouchableOpacity>                                              
              </View>
              <View style={[ styles.column5,{}]}>
                <TouchableOpacity
                  onPress={() => {
                  setModalVisible(true);
                  setShowPicker(true);
                  setTitulo("Descuento");
                }}
                style={[{ alignItems: "center" }]}>
                <Icon name="local-offer" size={34} color="ffff" />
                <Text style={[{  textDecorationLine: "underline", color: "red", fontSize: 12, },]}>Descuento</Text>                
                </TouchableOpacity>                
              </View>
              <View style={[ styles.column5,{}]}>
                <TextInput                
                  ref={inputRef} // <--- Asignar la referencia
                  onChangeText={(text) => setCambio(text)}
                  value={cambio}
                  keyboardType="numeric"
                  style={[{  fontSize: 18,  borderRadius: 15,  textAlign: "center",  borderWidth: 0.8,  width: 90,  height: 35,  margin:0,padding:0},]}>
                </TextInput> 
                 <Text style={[ {textAlign: "center", textDecorationLine: "underline",color: "red", fontSize: 12,marginTop:3}]}>Recibí</Text>                                         
              </View>              
            </View>
            <View style={[styles.row, {}]}>
                <View style={[ styles.column3,{alignItems:'center'}]}>
                  <Text style={[ { fontSize:14 }]}>Item(s) total</Text>   
                  <Text style={[ { fontSize:14 }]}>Tipo venta</Text>   
                  <Text style={[ { fontSize:14 }]}>Descuento</Text>              
                  <Text style={[ {}]}>Subtotal</Text>
                  <Text style={[ {fontWeight: "bold",fontSize:18}]}>Total</Text>              
                  <Text style={[ {}]}>Cambio</Text>
                </View>
                <View style={[ styles.column3,{alignItems:'center'}]}>
                  <Text style={[ {  fontSize:14 }]}>{producto.length}</Text>
                  <Text style={[{ textAlign: "center" }]}>{tipoVentaSeleccionado ? tipoVentaSeleccionado : "No seleccionado"}</Text> 
                  <Text style={[{ }]}>${descuento.toFixed(1)}</Text>
                  
                  <Text style={[{  },]}>${subtotal.toFixed(1)}</Text>
                  <Text style={[{ fontWeight: "bold", fontSize: 18,}, ]}> ${total.toFixed(1)} </Text>                              
                  <Text style={[{fontSize: 16 },  ]}>${cambioCalculado.toFixed(1)}</Text> 
                </View>
            </View>
            <View style={[styles.row, { justifyContent: "center" }]}>
              <View style={[styles.column3, {alignItems:'center'}]}>
                {/* Botón para eliminar */}
                <TouchableOpacity onPress={() => {createTwoButtonAlert(producto.length>0 ? '1': '2');}}>
                  <Icon name="delete" size={38} color="ffff" />
                </TouchableOpacity>
              </View>
              <View style={[styles.column3, {}]}>
                {cambio >=total && producto.length > 0 ? (
                  <Button title="Pagar" onPress={() => {
                    setModalVisible(true);setShowTicket(true);setTitulo("Proceder al pago");}}/>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>
      <StatusBar style="auto"  />
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