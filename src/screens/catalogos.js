import React, { useState, useContext } from 'react';
import {StyleSheet,Text,View,TextInput,ScrollView,TouchableOpacity,Alert,SafeAreaView,ActivityIndicator} from 'react-native';
import { DataContext } from "../contexts/DataContext";
import axios from 'axios';
export default function InventoryCapture({limpiarBusqueda}) {
  const { user, loading, tallas,corte,cargarTallas } = useContext(DataContext);
  
  // ✅ Correcto: Usamos reduce directamente para crear un objeto donde la llave es la Talla
  const [inventory, setInventory] = useState({
    ALMSSL: tallas?.reduce((acc, col) => {acc[col.talla] = ''; return acc;}, {}) || {}, // El || {} evita errores si tallas es undefined al inicio
    ALMPVENTA: tallas?.reduce((acc, col) => {acc[col.talla] = ''; return acc;}, {}) || {},
  });
  const granTotal = tallas.reduce((acc, col) => acc + (parseInt(col.piezas, 10) || 0), 0);
  // --- ESTADO DE LA NUEVA TABLA (DESGLOSE) ---
  const desgloseCols = [
    { key: 'SEGUNDAS_TELA', label: 'TELA' }, { key: 'SEGUNDAS_CONFECCION', label: '2DAS\nCONF' },
    { key: 'SEGUNDAS_LAVANDERIA', label: '2DAS\nLAV' }, { key: 'SEGUNDAS_SERIGRAFIA', label: '2DAS\nSERG' },
    { key: 'SEGUNDAS_LASER', label: '2DAS\nLASER' }, { key: 'SEGUNDAS_PACK', label: '2DAS\nEMPAQ' },
    { key: 'SEGUNDAS_BORDADO', label: '2DAS\nBORDA' }, { key: 'SEGUNDAS_MESA', label: '2DAS\nMESA' }
  ];

  const [desglose, setDesglose] = useState({
    cobros: { SEGUNDAS_TELA: '', SEGUNDAS_CONFECCION: '', SEGUNDAS_LAVANDERIA: '', SEGUNDAS_SERIGRAFIA: '', SEGUNDAS_LASER: '', SEGUNDAS_PACK: '', SEGUNDAS_BORDADO: '', SEGUNDAS_MESA: '' },
    cantidades: { SEGUNDAS_TELA: '', SEGUNDAS_CONFECCION: '', SEGUNDAS_LAVANDERIA: '', SEGUNDAS_SERIGRAFIA: '', SEGUNDAS_LASER: '', SEGUNDAS_PACK: '', SEGUNDAS_BORDADO: '', SEGUNDAS_MESA: '' }
  });
  
  // Fecha actual por defecto en formato DD/MM/YY
  const [fechaCaptura, setFechaCaptura] = useState({value: new Date().toLocaleDateString('es-ES') });

  // --- MANEJADORES DE LA TABLA SUPERIOR ---
  const handleInputChange = (warehouseKey, column, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setInventory(prevState => ({
      ...prevState,
      [warehouseKey]: { ...prevState[warehouseKey], [column]: numericValue }
    }));
  };

  const calculateTotal = (warehouseData) => {
    return Object.values(warehouseData).reduce((acc, val) => acc + (parseInt(val, 10) || 0), 0);
  };

  // --- MANEJADORES DE LA NUEVA TABLA ---
  const handleDesgloseCantidades = (key, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setDesglose(prev => ({ ...prev, cantidades: { ...prev.cantidades, [key]: numericValue } }));
  };

  const handleCobrosTexto = (key, value) => {
    setDesglose(prev => ({ ...prev, cobros: { ...prev.cobros, [key]: value } }));
  };

  const calculateTotalDesglose = () => {
    return Object.values(desglose.cantidades).reduce((acc, val) => acc + (parseInt(val, 10) || 0), 0);
  };

  // Simulación del porcentaje (1 equivale a 0.4% en tu imagen, asumiendo un lote de 250)
  const getPercentage = (val) => {
    //console.log("Calculando porcentaje para valor:", val, "con granTotal:", granTotal);
    const num = parseInt(val, 10) || 0;
    // Si tu lógica de porcentaje es diferente, puedes cambiar el 250 por tu variable real
    return ((num / granTotal || 0) * 100).toFixed(1) + '%'; 
  };

  // --- ENVÍO DE DATOS ---
  const handleSubmit = () => {
    // 1. Extraemos las tallas directamente de tu variable 'tallas' original
    // 2. Preparamos los tres diccionarios (objetos) vacíos
    const tallasArray = tallas?.map(item => item.talla) || [];

    const dictTallas = {};
    const dictSegundas = {};
    const dictPrimeras = {};
    // 1. Extraemos los datos en arreglos ordenados
      
    // 3. Iteramos sobre nuestra lista universal de tallas
    tallasArray.forEach((talla, index) => {
      const num = index + 1; // Para que empiece en 1 (t1, t2...)

      // Asignamos la talla al diccionario de tallas
      dictTallas[`t${num}`] = talla;

      // Buscamos el valor correspondiente en el estado usando la 'talla' como llave.
      // Si el usuario no escribió nada (o es undefined), mandamos un string vacío "".
      dictSegundas[`s${num}`] = inventory.ALMSSL[talla] || ""; 
      dictPrimeras[`p${num}`] = inventory.ALMPVENTA[talla] || ""; 
    });

    // 3. Armamos la lista exacta que C# va a deserializar
    const payload = [
      dictTallas,   // C# lo leerá en: elementos[0]
      dictSegundas, // C# lo leerá en: elementos[1]
      dictPrimeras,  // C# lo leerá en: elementos[2]
      desglose.cantidades
    ];

    const jsonList = JSON.stringify(payload); // El null y 2 son para formatear el JSON con indentación
    console.log("Datos a enviar:", jsonList,user.username, corte);
    if(jsonList.length > 2000){
      const postData = `li=${encodeURIComponent(jsonList)}&co=${corte}&us=${user.username}`;
        axios.post('http://www.almacenesdc.com/Tienda.asmx/Movimiento_ingreso_det', postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(response => {
        const respuesta = JSON.stringify(response.data);

        console.log(respuesta);
        //showToast()
      })
      .catch(error => {
        console.log('Error: ', error);
      })
      //Alert.alert("Éxito", "Revisa la consola para ver el JSON completo.");
      limpiarBusqueda(); // Limpia la búsqueda después de enviar
      cargarTallas(''); // Limpia las tallas después de enviar
      inventory.ALMPVENTA = '';
      inventory.ALMSSL = '';
      desglose.cantidades = '';
    }else{
      Alert.alert("Error", "No hay datos para enviar. Por favor, completa al menos una talla.");
    }   
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.screenTitle}>Captura de Inventario</Text>
         {loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
        {/* ================= TABLA SUPERIOR ================= */}
        <View style={styles.tableContainer}>
          <View style={styles.fixedColumn}>
            <View style={[styles.cell, styles.headerCell, styles.fixedHeaderCell]}>
              <Text style={styles.headerText}>ALMACENES EXISTENTES</Text>             
            </View>
            <View style={[styles.cell, styles.headerCell, styles.fixedHeaderCell]}>
              <Text style={styles.headerText}>CORTADAS EN MESA</Text>
            </View>
            <View style={[styles.cell, styles.rowHeaderCell]}>
              <Text style={styles.redText}>ALMSSL</Text>
              <Text style={styles.whiteText}>ALMACEN DE SEGUNDAS SAN LORENZO</Text>
            </View>
            <View style={[styles.cell, styles.rowHeaderCell]}>
              <Text style={styles.redText}>ALMPVENTA</Text>
              <Text style={styles.whiteText}>ALMACEN DE PRIMERAS VENTA</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
            <View>
              <View style={styles.row}>
                {tallas?.map((col, index) => (
                  <View key={`header-${index}`} style={[styles.cell, styles.headerCell]}>
                    <Text style={styles.headerText}>{col.talla}</Text>
                  </View>
                ))}
                <View style={[styles.cell, styles.headerCell]} />
              </View>
              <View style={styles.row}>
                {tallas?.map((col, index) => (
                  <View key={`header-${index}`} style={[styles.cell, styles.headerCell]}>
                    <Text style={styles.headerText}>{col.piezas}</Text>
                  </View>
                ))}
                <View style={[styles.cell, styles.headerCell]} />
              </View>
              <View style={styles.row}>
                {tallas?.map((col, index) => (
                  <View key={`almssl-${index}`} style={[styles.cell, styles.inputCell]}>
                    <TextInput style={styles.input} keyboardType="numeric" value={inventory.ALMSSL[col.talla]} onChangeText={(val) => handleInputChange('ALMSSL', col.talla, val)} />
                  </View>
                ))}
                <View style={[styles.cell, styles.inputCell, styles.totalCell]}>
                  <Text style={styles.totalText}>{calculateTotal(inventory.ALMSSL)}</Text>
                </View>
              </View>

              <View style={styles.row}>
                {tallas?.map((col, index) => (
                  <View key={`almpventa-${index}`} style={[styles.cell, styles.inputCell]}>
                    <TextInput style={styles.input} keyboardType="numeric" value={inventory.ALMPVENTA[col.talla]} onChangeText={(val) => handleInputChange('ALMPVENTA', col.talla, val)} />
                  </View>
                ))}
                <View style={[styles.cell, styles.inputCell, styles.totalCell]}>
                  <Text style={styles.totalText}>{calculateTotal(inventory.ALMPVENTA)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ================= NUEVA SECCIÓN: DESGLOSE ================= */}
        <View style={styles.desgloseSection}>
          <Text style={styles.desgloseTitle}>DESGLOS DE RECEPCION SEGUNDAS</Text>
          <Text style={styles.desgloseSubtitle}>COBROS DE SEGUNDAS</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
            <View style={styles.desgloseTableContainer}>                            
              {/* Fila 2: Cabeceras (TELA, 2DAS CONF, etc) */}
              <View style={styles.row}>
                {desgloseCols.map((col, index) => (
                  <View key={`head-${index}`} style={styles.desgloseHeaderCell}>
                    <Text style={styles.desgloseHeaderText}>{col.label}</Text>
                  </View>
                ))}
              </View>

              {/* Fila 3: Cantidades */}
              <View style={styles.row}>
                {desgloseCols.map((col, index) => (
                  <View key={`cant-${index}`} style={styles.desgloseColGroup}>
                    <View style={styles.dashedInputContainer}>
                      <TextInput 
                        style={styles.desgloseInput} 
                        keyboardType="numeric" 
                        value={desglose.cantidades[col.key]} 
                        onChangeText={(val) => handleDesgloseCantidades(col.key, val)} 
                        editable={granTotal > 0 ? true : false}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Fila 4: Porcentajes */}
              <View style={styles.row}>
                {desgloseCols.map((col, index) => (
                  <View key={`perc-${index}`} style={styles.percentageCell}>
                    <Text style={styles.percentageText}>{getPercentage(desglose.cantidades[col.key])}</Text>
                  </View>
                ))}
                <Text style={styles.equalsSign}>=</Text>
                  <View style={styles.totalResultBox}>
                    <Text style={styles.totalResultText}>{calculateTotalDesglose()}</Text>
                  </View>
                  <Text style={styles.dateLabel}>FECHA{"\n"}CAPTURA</Text>
                  <View style={[styles.dashedInputContainer, { width: 100 }]}>
                    <TextInput 
                      style={[{ width: 100,padding: 0 , margin: 0,textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#000' }]} 
                      value={fechaCaptura.value} 
                      onChangeText={setFechaCaptura} 
                      editable={false}
                    />
                  </View>                
              </View>
                
            </View>
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar al File</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- ESTILOS PREVIOS ---
  container: { flex: 1, backgroundColor: '#d9d9d9', padding: 10 },
  screenTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  tableContainer: { flexDirection: 'row', borderWidth: 2, borderColor: '#000', backgroundColor: '#1e1e1e',borderRadius: 8, },
  row: { flexDirection: 'row' },
  fixedColumn: { width: 180, borderRightWidth: 2, borderColor: '#000', backgroundColor: '#1a1a1a', zIndex: 1 },
  cell: { height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' },
  headerCell: { height: 40, backgroundColor: '#1a1a1a', width: 45 },
  fixedHeaderCell: { width: '100%' },
  rowHeaderCell: { width: '100%', paddingHorizontal: 5, alignItems: 'center', backgroundColor: '#1a1a1a' },
  inputCell: { width: 45, backgroundColor: '#ffffff', padding: 0 },
  totalCell: { backgroundColor: '#ffffff' },
  headerText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  redText: { color: '#ff4d4d', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  whiteText: { color: '#ffffff', fontSize: 9, textAlign: 'center', marginTop: 2 },
  input: { width: '100%', height: '100%', textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#000' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  
  // --- ESTILOS NUEVA SECCIÓN ---
  desgloseSection: { marginTop: 30, backgroundColor: '#d9d9d9' },
  desgloseTitle: { fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 10 },
  desgloseSubtitle: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  desgloseTableContainer: { paddingBottom: 10 },
  desgloseColGroup: { width: 60, alignItems: 'center', marginHorizontal: 2 },
  dashedInputContainer: {
    width: 55,
    height: 30,
    borderWidth: 1.5,
    borderColor: '#000',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  desgloseInput: { width: '100%', height: '150%', textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#000',margin: 0, padding: 0 },
  siNoText: { fontSize: 14, fontWeight: 'bold', color: '#0066cc' },
  desgloseHeaderCell: { width: 60, height: 40, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 },
  desgloseHeaderText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  percentageCell: { width: 60, height: 25, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2, borderWidth: 1, borderColor: '#888', backgroundColor: '#fff', marginTop: 2 },
  percentageText: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  
  // --- FOOTER DE LA NUEVA SECCIÓN ---
  footerSection: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 15, paddingRight: 10 },
  totalBlock: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  equalsSign: { fontSize: 24, fontWeight: 'bold', marginRight: 5 },
  totalResultBox: { width: 50, height: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  totalResultText: { fontSize: 16, fontWeight: 'bold' },
  dateBlock: { alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },

  // --- BOTÓN ---
  submitButton: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, marginVertical: 30, alignItems: 'center',width: '20%', alignSelf: 'center' },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});