import {React,useState} from "react";
import { View, Text, Button, StyleSheet,Platform } from "react-native";
import * as Print from 'expo-print';

const TicketPreview = ({ ticketData ,realizarVenta, limpiarVenta}) => {
  const [selectedPrinter, setSelectedPrinter] = useState();
  // Contenido del ticket en HTML
  // 1. Creas una función que devuelve el HTML de UN solo ticket
const generarHTML = (folioActual) => {
    // 1. Quitamos la lógica del page-break de la clase del div
    const renderTicketBody = (titulo) => `
      <div class="ticket">
        <div class="title">${titulo}</div>
        <div class="header-container">
          <div class="logo">
            <img src="http://www.almacenesdc.com.mx/img/logo.png" alt="Logo" />
          </div>
          <div class="info">
            <p><strong>Movimiento:</strong> ${folioActual}</p>
            <p><strong>Fecha:</strong> ${ticketData.fecha}</p>
            <p><strong>Vendedor:</strong> ${ticketData.vendedor}</p>
          </div>
        </div>
       
        <table>
          <tr><th>UDS</th><th>DESCRIPCION</th><th>IMPORTE</th></tr>
          ${ticketData.productos.map(item =>
            `<tr><td>${item.cantidad}</td><td class="descripcion">${item.descripcion ? item.descripcion : item.idUnico}</td><td>$${(item.cantidad * item.precio).toFixed(1)}</td></tr>`
          ).join("")}
        </table>
        <hr>
        <div class="piedepagina">
          <p>Descuento: $${ticketData.descuento.toFixed(1)}</p>
          <p class="title">SubTotal: $${ticketData.subtotal.toFixed(1)}</p>
          <p class="title">Total: $${ticketData.total.toFixed(1)}</p>
          <p>Gracias por su compra</p>
        </div>
        
      </div>
    `;

    // 2. Agregamos el estilo de la línea de corte y la colocamos entre ambos tickets
    return `
      <html>
        <head>
          <style>
            /* 1. Configuramos la página para quitar márgenes predeterminados */
            @page { margin: 0; size: letter portrait; }
            body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 0;height: 100vh; }
            .info {margin: 0; padding: 0;line-height:2px;
            text-align: left; /* Alineamos el texto a la izquierda para que se vea ordenado junto al logo */
            }
            .piedepagina {margin: 0; padding: 0;line-height:2px}
            .ticket {width: 100%;height:49vh; max-width: 450px; margin: auto; }
            .title { font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 0 0; font-size: 12px; }
            th { border-bottom: 2px solid #000; padding-bottom: 4px;}
            td { text-align: left; padding: 0;line-height:11px}
            td:first-child, th:first-child { text-align: center; width: 15%; }
            td:last-child, th:last-child { text-align: right; width: 25%; }
            hr { border: 0; border-top: 1px solid #000; }
            .descripcion {font-size: 11px;}
            
            .header-container {
              display: flex;
              flex-direction: row;
              align-items: center; /* Centra verticalmente el logo y el texto */
              justify-content: center; /* Centra todo el bloque en el ticket */
              margin-bottom: 5px;
              gap: 15px; /* Espacio entre el logo y el texto */
            }
            .logo {
              width: 50px; /* Tamaño del logo */
              flex-shrink: 0; /* Evita que el logo se aplaste */
            }
            .logo img {
              width: 100%;
              height: auto;
              filter: grayscale(100%); /* Opcional: Para que se imprima mejor en impresoras térmicas o blanco y negro */
            }
            .info {
              text-align: left; /* Alineamos el texto a la izquierda para que se vea ordenado junto al logo */
            }
            
            /* 🔥 Nueva clase para la línea de recorte */
            .cut-line {
              width: 100%;
              margin: 4px auto;
              border-top: 2px dashed #000; /* Línea punteada */
              position: relative;
            }
            /* Icono de tijeras en medio de la línea (opcional pero se ve muy bien) */
            .cut-line::after {
              content: "✂️";
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 0 10px;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          ${renderTicketBody("Almacenes DC")}
          
          <div class="cut-line"></div>
          
          ${renderTicketBody("Almacenes DC (Copia)")}
        </body>
      </html>
    `;
  };
  

  // 3. Esta es la nueva función maestra que se ejecuta al presionar el botón
  const handleVentaYPrint = async () => {
    try {
      // A. Esperamos a que el servidor haga la venta y nos devuelva el folio
      const nuevoFolio = await realizarVenta();
      console.log('Folio desde ticket' , nuevoFolio)
      if (!nuevoFolio) {
        console.error("No se recibió un folio válido del servidor");
        return; // Detenemos la impresión si la venta falló
      }

      // B. Generamos el string de HTML con el folio fresco
      const htmlDinamico = generarHTML(nuevoFolio);

      // C. Ejecutamos la impresión
      await Print.printAsync({
        html: htmlDinamico,
        printerUrl: selectedPrinter?.url, // iOS only
      });

      // D. Una vez que la impresión terminó (o se mandó a la cola), limpiamos la UI
      if (limpiarVenta) {
        limpiarVenta();
      }

    } catch (error) {
      console.error("Error al procesar la venta y el ticket:", error);
    }
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
      {/* 4. Asignamos nuestra nueva función al botón */}
      <Button title="Realizar Venta" onPress={handleVentaYPrint} />
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
