import {React,useState} from "react";
import axios from 'axios';

  export const realizarVenta = async (producto, user, selectedDiscount, tipoVentaSeleccionado) => {
  try {
    const jsonList = JSON.stringify(producto);
    const postData = `list=${encodeURIComponent(jsonList)}&cl=${tipoVentaSeleccionado}&de=${selectedDiscount}&us=${user}`;
    
    // 1. Usamos 'await' para detener la ejecución hasta que el servidor responda
    const response = await axios.post('http://www.almacenesdc.com/Tienda.asmx/Movimiento_salida_det', postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 2. Procesamos la respuesta
    let movimiento = response.data;
    console.log('Respuesta del servidor en sucio:', movimiento);
    
    // Nota: cambié 'const' por 'let' aquí porque estás reasignando el valor
    if (typeof movimiento === "string") {
      movimiento = JSON.parse(movimiento);
    }
    
    const folio = movimiento.movimiento1 || movimiento.movimiento2;
    console.log('Respuesta del servidor ya limpio:', folio);   
    
    // 3. Ahora sí, la función entera retorna el folio
    return folio; 

  } catch (error) {
    console.log('Error: ', error);
    // Es buena práctica retornar null o lanzar el error para que el componente sepa que falló
    return null; 
  }
};

export const calcularSubtotal = (productos) => {
  return productos.reduce((total, item) => total + item.precio * item.cantidad, 0);
};

export const calcularDescuento = (subtotal, descuentoSeleccionado) => {
  return subtotal * descuentoSeleccionado;
};

export const generarTicketData = (productos, descuentoSeleccionado,tipoVentaSeleccionado,user,folio) => {
  const subtotal = calcularSubtotal(productos);
  const descuento = calcularDescuento(subtotal, descuentoSeleccionado);
  return {
    folio: folio, // Asegúrate de que aquí va el folio correcto
    fecha: new Date().toLocaleDateString(),
    vendedor: user,
    tipoVenta: tipoVentaSeleccionado,
    descuento: descuento, // Convertir a porcentaje
    subtotal:subtotal,
    total: subtotal - descuento,
    productos: productos.map((item) => ({
      corte: item.corte, // Limitar a 20 caracteres
      cantidad: item.cantidad,
      precio: item.precio, // Asegúrate de que aquí va el precio correcto
      clase: item.clase?item.clase:'1RAS',
      talla: item.talla?item.talla:'UNICA',
      descripcion: item.descripcion?item.descripcion:item.idUnico, // Usar descripción si está disponible, sino idUnico
    })),
  };
};
