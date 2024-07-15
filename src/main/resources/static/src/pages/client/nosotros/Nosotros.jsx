import React from "react";
import "./nosotros.css";
import {useNavigate} from "react-router";
import {PublicRoutes} from "../../../router/routes.js";
import {useSelector} from "react-redux";

const Nosotros = () => {
  const navigate = useNavigate();
  const pageDetails = useSelector((store) => store.pageDetails);

  const handleUnirse = () => {
    navigate(PublicRoutes.LOGIN)
  }

  return (
    <div id="nosotros-link" className="nosotros">
      <h1>Nosotros</h1>
      <p>
        {pageDetails.pageDescription}
{/*        En Tienda Humilde nos centramos en ofrecer a nuestros clientes que
        puedan vender sus productos de la forma más humilde posible.{" "}*/}
      </p>
      <a>
      <button onClick={handleUnirse}>Unirse</button>
      </a>
    </div>
  );
};

export default Nosotros;
