import {React,useState} from "react";
import { View, Text, Button, StyleSheet,Platform } from "react-native";
import * as Print from 'expo-print';

const TicketPreview = ({ ticketData, onClose,realizarVenta }) => {
  const [selectedPrinter, setSelectedPrinter] = useState();
  // Contenido del ticket en HTML
  // 1. Creas una función que devuelve el HTML de UN solo ticket
const renderTicketBody = (titulo) => `
  <div class="ticket ${titulo.includes('Copia') ? 'page-break' : ''}">
    <div class="title">${titulo}</div>
    <div class="info">
      <p><strong>Fecha:</strong> ${ticketData.fecha}</p>
      <p><strong>Vendedor:</strong> ${ticketData.vendedor}</p>
      <hr />
    </div>
    <table>
      <tr><th>UDS</th><th>DESCRIPCION</th><th>IMPORTE</th></tr>
      ${ticketData.productos.map(item =>
        `<tr><td>${item.cantidad}</td><td>${item.corte}</td><td>$${item.existencias.toFixed(2)}</td></tr>`
      ).join("")}
    </table>
    <hr>
    <p>Total: $${ticketData.total.toFixed(2)}</p>
    <p>Gracias por su compra</p>
  </div>
`;
  // 2. Usas esa función dentro de tu template principal
const html = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; }
        .ticket { padding: 10px; width: 300px; margin: auto; }
        .title { font-size: 18px; font-weight: bold; }
        /* Estilo para separar hojas */
        .page-break { page-break-before: always; break-before: page; }
        table { width: 100%; }
      </style>
    </head>
    <body>
      ${renderTicketBody("Almacenes dc")}
      ${renderTicketBody("Almacenes dc (Copia)")}
    </body>
  </html>
`;  
  

  const print = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const printToFile = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html });
    console.log('File has been saved to:', uri);
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };


  return (
    <View style={styles.container}>
      <Button title="Realizar Venta" onPress={()=>{print();realizarVenta()}} />
      <View style={styles.spacer} />
      {/*<Button style={styles.buttonContainer} title="Imprimir en PDF" onPress={printToFile} />*/}
      {Platform.OS === 'ios' && (
        <>
          <View style={styles.spacer} />
          <Button title="Select printer" onPress={selectPrinter} />
          <View style={styles.spacer} />
          {selectedPrinter ? (
            <Text style={styles.printer}>{`Selected printer: ${selectedPrinter.name}`}</Text>
          ) : undefined}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  productList: { marginTop: 10 },
  buttonContainer: { padding:10 }
});

export default TicketPreview;
