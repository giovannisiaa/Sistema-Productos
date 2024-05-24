import React, {useContext, useEffect, useState} from "react";
import {funcionesContext} from "./FuncionesTablaContext.jsx";
import {cargarObjetosConPaginacion} from "../service/GestionProductos.js";
import {clienteCantObjParaMostrar} from "../service/Configuracion.js";

export const clienteContext = React.createContext();

export function FuncionesClienteContext({ children }) {
  const { tiposProductos,cargarTipoProductoAProductos } = useContext(funcionesContext);

  const [productosFiltrados, setProductosFiltrados] = useState(new Map);

  const getKeyProdFiltrado = (idTipoProducto) => {
    let productosFiltradosKeys = Array.from(productosFiltrados.keys());
    if(productosFiltradosKeys.length===0){
      return undefined;
    }
    return productosFiltradosKeys.find(prodFiltrado => prodFiltrado.id === idTipoProducto);
  }

  const yaExistenProductosFiltradosCargadosPara = (nroPagina,idTipoProducto,keyProductoFiltrado) => {
    return productosFiltrados.get(keyProductoFiltrado)!==undefined
    && productosFiltrados.get(keyProductoFiltrado).get(nroPagina)!==undefined;
  }

  const cargarProductosFiltrados = async (nroPagina,idTipoProducto) => {
    if(Array.from(productosFiltrados.keys())===undefined || Array.from(productosFiltrados.keys()).length===0){
      return ;
    }
    let keyProductoFiltrado = getKeyProdFiltrado(idTipoProducto);

    if(yaExistenProductosFiltradosCargadosPara(nroPagina,idTipoProducto,keyProductoFiltrado)){
      return productosFiltrados.get(keyProductoFiltrado);
    }
    let response = await cargarObjetosConPaginacion(
      "productos/byProductType",
      nroPagina,
      clienteCantObjParaMostrar,
      idTipoProducto
    );
    let prodCargadosCompletos = cargarTipoProductoAProductos(response.content,tiposProductos);
    //Contiene el valor de un tipoProducto con su key=nroPagina, valor=[...productos]
    let mapProductosDeTipoProducto = productosFiltrados.get(keyProductoFiltrado);
    mapProductosDeTipoProducto.set(nroPagina,prodCargadosCompletos);

    //SI ESTO NO ANDA HACER TO DO JUNTO productosFiltrados.get(keyProductoFiltrado).set(nroPagina,prodCargadosCompletos);

    //Actualizamos a la key las pag
    keyProductoFiltrado.totalPaginas = response.totalPages;
    keyProductoFiltrado.pagActual = nroPagina;

    //guardamos los cambios
    setProductosFiltrados(new Map(productosFiltrados));

    keyProductoFiltrado = getKeyProdFiltrado(idTipoProducto);
    return productosFiltrados.get(keyProductoFiltrado);
  }

  //Carga todos los tiposProductos como keys a los productosFiltrados
  const cargarProductosFiltradosBase = () => {
    if(tiposProductos===undefined){
      return;
    }
    let productosFiltradosAux = new Map;
    tiposProductos.forEach(tp => {
      let tpAux = tp;
      tpAux.totalPaginas = 0;
      tpAux.pagActual = 0;
      productosFiltradosAux.set(tpAux,new Map)
    });
    console.log("productosFiltradosBase:")
    console.log(Array.from(productosFiltradosAux.keys()));
    setProductosFiltrados(productosFiltradosAux);
  }

  useEffect(() => {
    cargarProductosFiltradosBase();
  }, [tiposProductos]);

  return (<clienteContext.Provider
    value={{
      productosFiltrados,
      setProductosFiltrados,
      cargarProductosFiltrados
    }}
  >
    {children}
  </clienteContext.Provider>);
}
/*
productosFiltrados = Map<{id, nombreTp, TOTALPAG,PagAct}, Map< NroPag, [...productos]

1° Cargar productosFiltrados
  - Primero se llena el map con todas las claves como tipoProducto haya
  - El valor de cada tipoProducto será un Map vacío por el momento.
2° Se debe contar con una función que reciba por parámetro el id del tipoProducto a cargar, nroPagina
  - Primero se verifica si ya se cuenta con algún valor para el tipo producto (significa que al menos una request se hizo),
  - Si se cuenta con el nro pagina ya cargado, se termina ahi la funcion
  - Si no se cuenta con el nro de pagina entonces se hace la request, se carga la nueva pagina y se termina ahi
  - Si no se contiene ningún valor para el tipoProducto entonces se crea uno con los objetos cargados en la request con
  clave como nro pagina y valor los productos

*/
