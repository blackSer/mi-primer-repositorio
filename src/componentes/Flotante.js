import React,{useContext , useState} from "react";
import { StyleSheet, Text, View,Modal,Button } from 'react-native';



export default function Home({mostrar,onClose,title,children}) {
  
  return (
    <Modal visible={mostrar} animationType="slide" transparent={true} >
        <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>{children}</View>
          <Button title="Cerrar" color={'#6633FF'} onPress={ onClose} />
        </View>   
        </View>            
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
  modalContent: {
    width: 350,
    height: 300,
    padding: 20,
    backgroundColor: '#A9DFBF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
  },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { width: 300, padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  content: { marginBottom: 20 },
  closeButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 5 },
  closeText: { color: "#fff", fontWeight: "bold" },
});
