import React, { useState,useCallback, useEffect } from "react";
import { cargarObjetosConPaginacion, borrarObjeto,crearObjeto, cargarTodosLosObjetos } from "../service/GestionProductos";

import SpinnerLoading from "../components/utils/SpinnerLoading.jsx";
import MensajeToast from "../components/utils/MensajeToast.jsx";

import WebSocket from '../service/WebSocket.jsx';
import { administradorCantObjPorTabla } from "../service/Configuracion.js";
export const funcionesContext = React.createContext();

export function FuncionesTablaContext({ children }) {
  //Spinner
  const [showSpinner, setShowSpinner] = useState(false);
  const [mensajeSpinner, setMensajeSpinner] = useState(""); //el msj del spinner puede variar

  const [productos, setProductos] = useState([]);
  const [tiposProductos, setTiposProductos] = useState([]);

  const [sesionIniciada, setSesionIniciada] = useState(false);

  //Paginacion
  const [cantPaginasPorProducto, setCantPaginasPorProducto] = useState(0)
  const [paginaActualProductos,setPaginaActualProductos] = useState(1)

    //Toast
    const [toast, setToast] = useState({
      show: false,
      msjBody: "",
      color: "#dc1717",
    });
  //Carga las variables productos y tiposProductos

  //msj recibido del ws que dice qué actualizar
  const manejarMsjRecibido = (payload)=>{
    actualizarValores();
  };

  const getTipoProducto = (id,tiposProduct) => {
    return tiposProduct.find(tipoProd => tipoProd.id === id);
  }

  //A cada objeto se le asigna su objeto tipoProducto correspondiente
  const cargarTipoProductoAProductos = (productosBD,tiposProduct) => {
    if(productosBD === undefined || tiposProduct === undefined ||
      productosBD.length === 0 || tiposProduct.length === 0){ 
      return
    }
    let productosAux = [];
    productosBD.forEach(prod => {
      prod.tipoProducto = getTipoProducto(prod.productTypeId,tiposProduct);
      productosAux.push(prod);
    })
    return productosAux;
  }

  //Al actualizar los tipoProduct también se actualizan los productos asociados a los tipoProducto
  const actualizarTipoProductos =  async () => {
    //Cargamos todos los tipoProductos
    let location = window.location.href;
    setMensajeSpinner("Actualizando Tabla");
    if(location.includes('/administrador') || location.includes('/administrador/tablaTipoProductos')){
      setShowSpinner(true);
      setMensajeSpinner("Actualizando Tabla");
    }
    try{
      const response = await cargarTodosLosObjetos("tiposProductos");
      setShowSpinner(false);
      setTiposProductos(response);
      // cargarTipoProductoAProductos(productos,response);
      return response;
    } catch(e){
      setShowSpinner(false);
      console.error("Error al actualizar tipo productos:", e);
      setToast({
        show: true,
        msjBody: "Error conectando al servidor",
        color: "#dc1717",
      });
    }
  };

  const actualizarProductos =  async (direccion,page,size, tiposProductos) => {
    let location = window.location.href;
    if(location.includes('/administrador') || location.includes('/administrador/tablaTipoProductos')){
      setMensajeSpinner("Actualizando Tabla");
      setShowSpinner(true);
    }
    //Cargamos algunos productos
      try{
          const response = await cargarObjetosConPaginacion(direccion,page,size);
          setShowSpinner(false);
          const productosCargados = cargarTipoProductoAProductos(response.content,tiposProductos);
          setCantPaginasPorProducto(response.totalPages);
          setProductos(productosCargados);
          return productosCargados;
      }catch(e) {
          setShowSpinner(false);
          console.log("callo act prod: "+e);
          setToast({
              show: true,
              msjBody: "Error contectando al servidor",
              color: "#dc1717",
          });
      }
  };

  const actualizarValores = async () => {
    const tiposProductosAct = await actualizarTipoProductos();
    const productosAct = await actualizarProductos(
      "productos",
      paginaActualProductos - 1,
      administradorCantObjPorTabla,
      tiposProductosAct);
  }
  const borrarProductoGenerico = async (direccion, idEntidad) => {
    setMensajeSpinner("Borrando de DB");
    setShowSpinner(true);
    borrarObjeto(direccion, idEntidad)
        .then(() => {
          if(mensajeSpinner !== 'Actualizando Tabla'){
            setShowSpinner(false);
          }
        })
        .catch((error) => {
          console.log(error)
          setShowSpinner(false);
          setToast({
            show: true,
            msjBody: "Se ha producido un error al borrar",
            color: "#dc1717",
          });
        });
  }

  const agregarProductoGenerico = async (direccion,objeto,imagen,method) => {
    setMensajeSpinner("Guardando en DB");
    setShowSpinner(true);
    try{
      await crearObjeto(direccion,objeto, imagen,method)
      // if(mensajeSpinner !== 'Actualizando Tabla'){
      setShowSpinner(false);
      actualizarValores();
      // }
    }catch(e){
      console.log("error en agregarProductoGenerico: "+e)
      setShowSpinner(false)
    }
  };

  useEffect(()=>{
    actualizarValores();
  },[])

  return (
    <funcionesContext.Provider
      value={{
        productos,
        setProductos,
        tiposProductos,
        setTiposProductos,
        showSpinner,
        setShowSpinner,
        mensajeSpinner,
        setMensajeSpinner,
        toast,
        setToast,
        // actualizarTablaGenerica,
        borrarProductoGenerico,
        agregarProductoGenerico,
        actualizarTipoProductos,
        actualizarProductos,
        actualizarValores,
        sesionIniciada, setSesionIniciada,
        cantPaginasPorProducto,
        paginaActualProductos,setPaginaActualProductos
      }}
    >
      <SpinnerLoading />
      <MensajeToast />
      {/*<WebSocket mensajeRecibido={manejarMsjRecibido}/>*/}
      {children}
    </funcionesContext.Provider>
  );
}
