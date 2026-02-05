import { use } from "react";

export const realizarVenta = (producto, eliminarProducto, setModalVisible, setShowTicket, setShowPicker,setTallasSeleccionadas,quitarFoco,user) => {
  if (producto.length > 0) {
    console.log(generarTicketData(producto, 0,user)); // Pasar el descuento correcto
    console.log("Éxito");
    eliminarProducto({ type: "RESET" });
    setModalVisible(false);
    setShowTicket(false);
    setShowPicker(false);
    setTallasSeleccionadas({});
    quitarFoco();
  } else {
    console.log("Error, no hay productos para vender");
  }
};

export const calcularSubtotal = (productos) => {
  return productos.reduce((total, item) => total + item.existencias * item.cantidad, 0);
};

export const calcularDescuento = (subtotal, descuentoSeleccionado) => {
  return subtotal * descuentoSeleccionado;
};

export const generarTicketData = (productos, descuentoSeleccionado,user) => {
  //alert('Sin productos para generar el ticket');
  const subtotal = calcularSubtotal(productos);
  const descuento = calcularDescuento(subtotal, descuentoSeleccionado);
  return {
    fecha: new Date().toLocaleDateString(),
    vendedor: user,
    total: subtotal - descuento,
    productos: productos.map((item) => ({
      corte: item.tipo?item.tipo: item.idUnico, // Limitar a 20 caracteres
      cantidad: item.cantidad,
      existencias: item.existencias, // Asegúrate de que aquí va el precio correcto
      clase: item.clase?item.clase:'1RAS',
      talla: item.talla?item.talla:'UNICA',
    })),
  };
};
