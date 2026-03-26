import React, { createContext, useState, useEffect,useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Crear el contexto
export const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]); // Datos de la API
  const [datos, setDatos] = useState([]); // Datos de la API
  const [loading, setLoading] = useState(true); // Estado de carga
  const [user, setUser] = useState(null);
  const [tallas, setTallas] = useState([]);
  const [corte, setCorte] = useState("");
  
  //*******API TALLAS**********/
  const cargarTallas = async (corte) => {      
      try {
        setLoading(true);
        const response = await fetch(
          `http://www.almacenesdc.com/Tienda.asmx/Estatus_corte?c=${corte}`
        );     
        const data = await response.json();      

        if (data && data.length > 0) {
        const objetoCorte = data[0]; 
        const tallaProcesadas = normalizarTallas(objetoCorte);
        setTallas(tallaProcesadas);
        setCorte(corte);
      } else {
        setTallas([]); // Evita errores si la API no devuelve nada
      }
      } catch (error) {
        console.error("Error de tallas: ", error);
      }finally {
        setLoading(false);
      }
  };
    //Extraemos las tallas de la API y las agrupamos por corte para mostrarlas en el picker
  const normalizarTallas = (item) => {
    const resultado = [];
      
    //const totalCoratdasKey = i === 0 ? "TOTAL_CORTADAS_REAL" : {};
    for (let i = 0; i <= 9; i++) {
      
      const tallaKey = i === 0 ? "TALLAS" : `TALLAS${i}`;
      const piezasKey = i === 0 ? "TALLAS_PZAS_CORTADAS_REAL" : `TALLAS_PZAS_CORTADAS_REAL${i}`;
      //console.log(`Procesando ${tallaKey} y ${piezasKey}: `, item[tallaKey], item[piezasKey]);
      if (item[tallaKey] !== null && item[tallaKey] !== undefined) {
        resultado.push({
          talla: item[tallaKey],
          piezas: item[piezasKey] !== null ? item[piezasKey] : 0,
        });
      }
    }

    return resultado;
  };
  //*************API PRODUCTOS****************//
  const cargarProductos = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://www.almacenesdc.com/Tienda.asmx/Productos"
      );

      const data = await response.json();
      const productosProcesados = agruparPorCorteYClase(data);

      setDatos(productosProcesados);
    } catch (error) {
      console.error("Error de productos", error);
    } finally {
      setLoading(false);
    }
  };
//*******AGRUPAMOS LOS REGISTOS DUPLICADOS**********
  const agruparPorCorteYClase = (dataApi) => {
    const agrupados = {};

    dataApi.forEach((item) => {
    // 1. LIMPIEZA DE DATOS
    // .trim() elimina los espacios gigantes "EG      " y los "\r"
    const tallaLimpia = item.TALLA ? item.TALLA.toString().trim() : "UNICA";
    const clase = item.CLASE ? item.CLASE.toString().trim() : "1RAS";
    const corte = item.CORTE ? item.CORTE.toString().trim() : "S/C";

    // Importante: Asegurar que existencias sea un número para poder sumar
    const cantidad = Number(item.EXISTENCIAS) || 0;
    // 2. CREACIÓN DE LA LLAVE ÚNICA DE GRUPO
    // Esta llave identifica a la TARJETA, no a la talla individual.
    // Una tarjeta es única por su Corte y su Clase.
    const uniqueGroupId = `${corte}-${clase}`; 

    // 3. AGRUPACIÓN
    if (!agrupados[uniqueGroupId]) {
      // Si el grupo no existe, lo creamos
      agrupados[uniqueGroupId] = {
        ...item, // Copiamos info general (Marca, Estilo, etc.)
        idUnico: uniqueGroupId, // Guardamos la KEY para el FlatList
        VARIANTES: [] // Aquí guardaremos las tallas
      };
    }

    // 4. AGREGAR LA VARIANTE
    // 4. LÓGICA DE UNIFICACIÓN (AQUÍ ESTÁ EL CAMBIO)
    // ---------------------------------------------------------
    // Buscamos si ya existe esta talla específica dentro de las variantes guardadas
    const varianteExistente = agrupados[uniqueGroupId].VARIANTES.find(
      (v) => v.talla === tallaLimpia
    );

    if (varianteExistente) {
      // CASO A: La talla YA existe en este grupo.
      // En lugar de agregar otra fila, SUMAMOS la cantidad a la existente.
      varianteExistente.existencias += cantidad;
    } else {
      // CASO B: Es la primera vez que vemos esta talla en este grupo.
      // La agregamos al array.
      agrupados[uniqueGroupId].VARIANTES.push({
        talla: tallaLimpia,
        existencias: cantidad
      });
    }
  });

  // Convertimos el objeto de vuelta a un Array limpio para el FlatList
  return Object.values(agrupados);
  };

  useEffect(() => {
    cargarProductos();
    //cargarTallas()
  }, []);

  useEffect(() => {
    // Cargar sesión almacenada
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);
  
  const login = async (username, password) => {
    const userData = { username, password };
    const response = await fetch(`http://hfe098cdecj.sn.mynetname.net/servicesadc.asmx/Valida_usuario?us=${username}&pa=${password}`);
    const datos = await response.text();
    if (datos.substring(76, 77) === "1") {
      await AsyncStorage.setItem("user", JSON.stringify(userData)); // Guardar usuario
        setUser(userData);
        return { success: true, user: userData };
    }else {
      return { success: false, message: "Correo o contraseña incorrectos" };
    }   
  };
  
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <DataContext.Provider value={{ data, datos,cargarProductos,cargarTallas,tallas,corte, loading, user, login, logout,}}>
      {children}
    </DataContext.Provider>
  );
}
