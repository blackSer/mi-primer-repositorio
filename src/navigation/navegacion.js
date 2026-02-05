import React, { useState, useContext, use } from "react";
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
  const { data, folio, datos } = useContext(DataContext);
  const [filteredData, setFilteredData] = useState(datos);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: () => (
          <SearchBar
            onFilter={setFilteredData}
            onSelect={setSelectedCharacter}
            limpiar={setSelectedCharacter}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Inicio") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Catálogos") {
            iconName = focused ? "list" : "list-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerStyle: { height: 70 },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      })}
    >     
      <Tab.Screen name="Inicio">
        {() => <Inicio filteredData={filteredData} selectedCharacter={selectedCharacter} folio={folio} />}
      </Tab.Screen>
      <Tab.Screen name="Catálogos">
        {() => <Catalogos filteredData={filteredData} selectedCharacter={selectedCharacter} />}
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
