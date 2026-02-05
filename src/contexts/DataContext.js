import React, { createContext, useState, useEffect,useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Crear el contexto
export const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]); // Datos de la API
  const [datos, setDatos] = useState([]); // Datos de la API
  const [loading, setLoading] = useState(true); // Estado de carga
  const [user, setUser] = useState(null);
  const [folio, setFolio] = useState('')

  // Refs para evitar fetches duplicados
  const dataFetchedRef = useRef(false);
  const datosFetchedRef = useRef(false);
  const userFetchedRef = useRef(false);
  //useEffect(() => {
  //  const fetchData = async () => {
  //    try {
  //      const response = await fetch("http://www.almacenesdc.com.mx/puntodeventa.asmx/HelloWorld");
  //      const textResponse = await response.text();
  //      const jsonString = textResponse.match(/>(.*?)</)[1]; // Extraer JSON de XML
  //      const jsonData = JSON.parse(jsonString);
  //      
  //      // Suponiendo que jsonData es un objeto con una lista, si no, ajusta esto
  //      setData(Array.isArray(jsonData) ? jsonData : [jsonData]);
  //    } catch (error) {
  //      console.error("Error al obtener datos:", error);
  //    } finally {
  //      setLoading(false);
  //    }
  //    
  //  };
  //
  //  fetchData();
  //}, []);
  useEffect(() => {   
    const fol='MOV0001'
    setFolio(fol); 
    fetch("https://rickandmortyapi.com/api/character")
      .then((response) => response.json())
      .then((data) => {
        setData(data.results); // Guardamos los resultados en el estado
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);

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
  const agruparPorCorte = (dataApi) => {
    const agrupados = {};

    dataApi.forEach((item) => {
      // 1. Limpiamos la talla (quitamos el \r y espacios)
      const tallaLimpia = item.TALLA ? item.TALLA.trim() : "UNICA";
      const corte = item.CORTE;

      // 2. Si el corte no existe en nuestro objeto temporal, lo creamos
      if (!agrupados[corte]) {
        agrupados[corte] = {
          ...item, // Copiamos datos generales (Imagen, Marca, etc)
          // Creamos un array especial para las variantes
          VARIANTES: [] 
        };
      }

      // 3. Agregamos la talla y sus existencias a la lista de variantes de ese corte
      agrupados[corte].VARIANTES.push({
        talla: tallaLimpia,
        existencias: item.EXISTENCIAS
      });
    });

    // 4. Convertimos el objeto de vuelta a un array
    return Object.values(agrupados);
  };
  //*************API PRODUCTOS****************//
  useEffect(() => {
    if (datosFetchedRef.current) return;
    datosFetchedRef.current = true;
    //fetch("http://www.almacenesdc.com:8081/productos.php?layout=almacenes_prendas")
    fetch("http://www.almacenesdc.com/Tienda.asmx/Productos")
      .then((response) => response.json())
      .then((data) => {
        // AQUI ESTA LA MAGIA: Agrupamos los datos antes de guardarlos
        // Usamos la nueva función
        const productosProcesados = agruparPorCorteYClase(data); 
        setDatos(productosProcesados);
        setLoading(false);
        //console.log(data);
      })
      .catch((error) => console.error("Error de productos", error));      
  }, []);

  useEffect(() => {
    // Cargar sesión almacenada
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const nuevoFolio = async () => {
    const fol='MOV0002'
    setFolio(fol);
    //return { success: true, user: folio };
  }
  
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
    <DataContext.Provider value={{ data, datos, loading, user, login, logout, folio, nuevoFolio}}>
      {children}
    </DataContext.Provider>
  );
}
