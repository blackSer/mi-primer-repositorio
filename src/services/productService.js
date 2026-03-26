export const agregarProducto = (producto, setProducto, setCant) => { 
    // VALIDACIÓN: Asegurarnos de que el producto traiga una talla seleccionada
  if (!producto.talla) {
    return;
  }
  setProducto((prevProductos) => {
    // Buscamos si ya existe este corte CON ESTA TALLA ESPECÍFICA
    const index = prevProductos.findIndex(
      (p) => p.idUnico === producto.idUnico && p.talla === producto.talla
    );

    if (index !== -1) {
      // Si existe, aumentamos solo esa variante
      const nuevosProductos = [...prevProductos];
      nuevosProductos[index].cantidad += 1;
      return nuevosProductos;
    } else {
      // Si no existe, lo agregamos. 
      // IMPORTANTE: Quitamos "talla: null" y dejamos que pase la talla que viene en 'producto'
      return [...prevProductos, { ...producto, cantidad: 1 }];
    }
  });

  setCant((prevCantidad) => prevCantidad + 1);
};

// AHORA RECIBE "talla" COMO PARAMETRO
export const actualizarCantidad = (id, talla, nuevaCantidad, setProducto) => {
  const cantidadNumerica = parseInt(nuevaCantidad, 10);
  setProducto((prevProductos) =>
    prevProductos.map((p) =>     
      // La condición ahora es ID Y TALLA
      p.idUnico === id && p.talla === talla 
        ? { ...p, cantidad: isNaN(cantidadNumerica) || cantidadNumerica < 0 ? 0 : cantidadNumerica }
        : p
    )
  );
  // alert opcional
};
  
  export const quitarProducto = (id,talla, setProducto, setCant) => {
    //alert("Cantidad actualizada a: " + id);
    setProducto((prevProductos) =>
      prevProductos
        .map((p) => 
          (p.idUnico === id && p.talla === talla ? { ...p, cantidad: p.cantidad - 1 } : p))
        .filter((p) => p.cantidad > 0)
    );  
    setCant((prevCantidad) => (prevCantidad > 0 ? prevCantidad - 1 : 0));
  };
  
  export const eliminarProducto = (setProducto, setSelectedDiscount, setCant, setCambio,setSelectedId,setTipoVentaSeleccionado,setSelectedTipoVentaId) => {  
    setProducto([]); 
    setTipoVentaSeleccionado([]);
    setSelectedDiscount([]);     
    setCant(0);  
    setCambio(0);
    setSelectedTipoVentaId(null);
    setSelectedId(null); // Limpiar selección
  };

  