// @ts-check
'use strict';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  //estilos flexbox
  container: { 
    flex: 1,
    flexDirection: 'row',
  },
  scrollContainer: {
    zIndex: 0,
    flex: 1,
    margin: 10,
    //backgroundColor: '#A2D9CE',
  },
  row: {
    flexDirection: 'row',   
  },
  column: {
    flexDirection: 'column',
    marginBottom: 0,
    width: "60%",
    height: "100%",   
  },
  column1: {
    flexDirection: 'column',
    width: "40%",
    height: "100%",
  },
  column2: {
    flexDirection: 'column',
    marginBottom: 0,
    width: "100%",
  },
  column3: {
    flexDirection: 'column',
    marginBottom: 0,
    width: "50%",
  },
  column4: {
    flexDirection: 'column',
    marginBottom: 0,
    width: "60%",
  },
  box: {
    borderWidth:1,
    borderColor:"white",
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  box2: {
    padding: 2,
    backgroundColor: '#85929e',
    color:'white'
  },
  box3: {
    backgroundColor: '#eceff1',
    color:'white'
  },
  cantidadInput: {
    justifyContent:'center',
    textAlign:'center',
    fontSize: 13,
    borderColor: 'black',
    backgroundColor:'white',
    borderWidth: 1,
    borderRadius:5,
    width: 32,
    height:22,
    margin: 0,
    padding: 0,
  }
});