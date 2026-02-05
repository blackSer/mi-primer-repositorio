import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Navegacion from "./src/navigation/navegacion";
import { DataProvider } from "./src/contexts/DataContext"; // Importar el contexto

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Navegacion />
      </NavigationContainer>
    </DataProvider>
  );
}
