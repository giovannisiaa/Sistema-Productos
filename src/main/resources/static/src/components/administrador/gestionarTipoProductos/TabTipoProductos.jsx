import {useEffect, useState, useContext} from "react";

import {funcionesContext} from "../../../context/FuncionesTablaContext";
import "../../../styles/ventana-productos/Pantallas.css";
import ModalAgregarTipoProducto from "../modals/ModalAgregarTipoProducto.jsx";

import "../../../styles/ventana-productos/Tabla.css";

//Iconos
import {MdLabelImportant} from "react-icons/md";
// import PaginadorTipoProductos from "./PaginadorTipoProductos";
// import PaginadorProductos from "../gestionarProductos/PaginadorProductos";
import TablaAdministrador from "../../utils/TablaAdministrador";
import {useSelector} from "react-redux";
import Navbar from "../sidebar/NavBar.jsx";
import {useNavigate} from "react-router";
import {usePageDetailsActions} from "../../../redux/slices/pageDetails/usePageDetailsActions.js";

const TabTipoProducto = () => {

  // const tiposProductos = useSelector(store => store.productsType.value)
  const navigate = useNavigate();
  const {
    borrarProductoGenerico,
    // tiposProductos,
    // actualizarTipoProductos,
    // sesionIniciada
  } =
    useContext(funcionesContext);

  const pageDetails = useSelector(store => store.pageDetails);
  const productsType = useSelector(store => store.productsType.value)

  const { updateValuePageDetail } = usePageDetailsActions();

  //variables de paginacion
  // const [totalTipoProductos, setTotalTiposProductos] = useState(tiposProductos.length);
  // const [tipoProductosPorPagina] = useState(5);
  // const [paginaActual, setPaginaActual] = useState(1);
  // const ultimoIndex = paginaActual * tipoProductosPorPagina;
  // const primerIndex = ultimoIndex - tipoProductosPorPagina;

  //modal
  const [showModalAgregar, setShowModalAgregar] = useState(false);

  //Agregar-Editar
  const [prodAEditar, setProdAEditar] = useState();
  const [esAgregar, setEsAgregar] = useState(false); //si es agregar se borran los valores seteados

  const manejarModalAgregar = () => {
    setShowModalAgregar(false);
  };

  const agregarProd = () => {
    setEsAgregar(true);
    setProdAEditar(null);
    setShowModalAgregar(true);
  };

  //Abre la ventana modal con los tiposProd cargados
  const editarProducto = (tipoProd) => {
    setEsAgregar(false);
    setProdAEditar(tipoProd);
    setShowModalAgregar(true);
  };

  const borrarProducto = (prod) => {
    borrarProductoGenerico("tiposProductos", prod.id)
      .then(() => {
        updateValuePageDetail("paginaActual", 1);
        // resetProducts();
      })
      .catch(e => {
        console.log(e)
      })
  };

  const getTableData = (tipoProd) => {
    return (
      <>
        <td>{tipoProd.id}</td>
        <td>{tipoProd.nombre}</td>
      </>
    );
  }

  useEffect(() => {
    // if(!sesionIniciada){
    if(!pageDetails.sessionStarted) {
      navigate('/login');
      return;
    }
    updateValuePageDetail("paginaActual",1);
  }, []);

  return (
    <>
      <div className="contenedor-pantalla-productos">
        <Navbar/>
        <TablaAdministrador
          // show={show}
          show={true}
          titleIcon={<MdLabelImportant style={{width: "40px", height: "40px", margin: "0 0 0 5px"}}/>}
          title={"Gestion de Tipos de Productos"}
          description={"Listado de los tipos productos a los que puede pertenecer un producto"}
          addObject={agregarProd}
          editObject={editarProducto}
          removeObject={borrarProducto}
          textButtonAdd={"Agregar"}
          columnNames={["Nombre", "Acciones"]}
          // objects={tiposProductos}
          objects={productsType}
          objectTD={getTableData}
        />
      </div>
      {/*      <PaginadorProductos
          setPaginaAnterior={handlePaginaNueva}
          setPaginaSiguiente={handlePaginaNueva}
          setPaginaActual={handlePaginaNueva}
          numeroTotalDePaginas={0}
          paginaActual={paginaActual}
          show={show}
      />*/}

      <ModalAgregarTipoProducto
        mostrarVentana={showModalAgregar}
        cerrarVentana={manejarModalAgregar}
        tipoProd={prodAEditar}
        esAgregar={esAgregar}
      />
      {/*<p>{JSON.stringify(pageDetails)}</p>*/}
    </>
  );
};
export default TabTipoProducto;
