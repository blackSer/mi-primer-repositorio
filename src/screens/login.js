import React, { useState,useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,ActivityIndicator } from "react-native";
import { DataContext } from "../contexts/DataContext";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { login } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const result = await login(usuario,password);   
    console.log(result);
    if (result.success){
      //Alert.alert("Éxito", "Inicio de sesión correcto");
      navigation.navigation("Main");
      //navigation.replace("Main"); // Redirige a la pantalla principal
      
    } else {
      Alert.alert("Error", result.message);
      
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>      
    {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <View style={styles.container2}>        
        <Text style={styles.title}>Iniciar Sesión</Text>      
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          keyboardType='default'
          autoCapitalize="none"
          value={usuario}
          onChangeText={setUsuario}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  container2: {
    borderWidth: 0.5,
    borderColor:'black',
    width: '30%',
    height: 240,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center",
  },
  input: {
    width: "80%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f4f4f4",
    justifyContent:'center',
    textAlign:"center",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
