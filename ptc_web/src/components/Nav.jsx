import React from "react";
import { useNavigate } from 'react-router-dom';
function Nav() {
    const navigate = useNavigate();
    const login = () => {
        navigate('/login')
    }
    return (
        <>
            <div className="navBar">
                <div className="LogoEmpresa"></div>
                <div className="Separador">
                </div>
                <div className="PartesPagina">
                    <button onClick={login} className="buttonOpcion">Login<div className="debajo"></div></button>
                    <button className="buttonOpcion">Inventario</button>
                    <button className="buttonOpcion">Pedido</button>
                    <button className="buttonOpcion">Productos</button>
                    <button className="buttonOpcion">Reportes</button>
                    <button className="buttonOpcion">PanelPrincipal</button>
                </div>
            </div>
        </>
    );
}
export default Nav;
