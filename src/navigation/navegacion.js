import React, { useState, useContext, useEffect ,useRef} from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Inicio from "../screens/inicio";
import Catalogos from "../screens/catalogos";
import LoginScreen from "../screens/login";
import SearchBar from "../componentes/searchbar";
import { DataContext } from "../contexts/DataContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { data, tallas, datos } = useContext(DataContext);
  
  // ✅ 1. Creamos estados INDEPENDIENTES para cada pantalla
  const [filteredDataInicio, setFilteredDataInicio] = useState(datos);
  const [filteredDataDesgloses, setFilteredDataDesgloses] = useState(tallas);
  
  // ✅ 2. Creamos triggers independientes por si quieres limpiar una pantalla sin afectar la otra
  const [clearSearchTriggerInicio, setClearSearchTriggerInicio] = useState(0);
  const [clearSearchTriggerDesgloses, setClearSearchTriggerDesgloses] = useState(0);

  const [productoEscaneado, setProductoEscaneado] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  useEffect(() => {
    // Actualizamos ambos cuando los datos originales cambian
    setFilteredDataInicio(datos);
    setFilteredDataDesgloses(tallas);
  }, [datos],[tallas]);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: () => {
          // ✅ 3. Aplicamos TU lógica: evaluamos qué pantalla está activa
          const isInicio = route.name === "Inicio";

          return (
            <SearchBar
              // 🔥 IMPORTANTE: La 'key' obliga a React a crear un SearchBar distinto por pestaña. 
              // Así el texto que escribas en uno, no aparecerá escrito en el otro.
              key={route.name} 
              
              // Mandamos la info al estado que corresponda
              onFilter={isInicio ? setFilteredDataInicio : setFilteredDataDesgloses}
              limpiarTrigger={isInicio ? clearSearchTriggerInicio : clearSearchTriggerDesgloses}
              
              // Si la cámara solo se usa en Inicio, lo condicionamos también
              onAutoAdd={isInicio ? (itemData) => setProductoEscaneado(itemData) : undefined}
              //onSelect={isInicio ? setSelectedCharacter : undefined} // O crea un estado separado si Desgloses también lo usa
            />
          );
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Inicio") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Desgloses") {
            iconName = focused ? "list" : "list-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerStyle: { height: 80 },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      })}
    >     
      <Tab.Screen name="Inicio">
        {() => (
          <Inicio 
            // ✅ 4. Le pasamos solo los datos de Inicio
            filteredData={filteredDataInicio} 
            selectedCharacter={selectedCharacter} 
            productoEscaneado={productoEscaneado} 
            limpiarBusqueda={() => setClearSearchTriggerInicio(prev => prev + 1)} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Desgloses">
        {() => (
          <Catalogos 
            // ✅ 5. Le pasamos solo los datos de Desgloses
            filteredData={filteredDataDesgloses} 
            limpiarBusqueda={() => setClearSearchTriggerDesgloses(prev => prev + 1)}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function Navegacion() {
  const { user } = useContext(DataContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}