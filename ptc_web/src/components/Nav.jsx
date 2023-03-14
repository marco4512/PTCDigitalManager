import React from "react";
import { useNavigate } from 'react-router-dom';
function Nav() {
    const navigate = useNavigate();
    const login = () => {
        navigate('/login')
    }
    const inventario = () => {
        navigate('/stock')
    }
    const Pedido = () => {
        navigate('/pedido')
    }
    const Productos = () => {
        navigate('/productos')
    }
    const Reportes = () => {
        navigate('/reportes')
    }
    const PanelPrincipal = () => {
        navigate('/principal')
    }
    const Home = () => {
        navigate('/')
    }
    return (
        <>
            <div className="navBar">
                <div onClick={Home} className="LogoEmpresa"></div>
                <div className="Separador">
                </div>
                <div className="PartesPagina">
                    <button onClick={login} className="buttonOpcion">Login</button>
                    <button onClick={inventario} className="buttonOpcion">Inventario</button>
                    <button onClick={Pedido} className="buttonOpcion">Pedido</button>
                    <button onClick={Productos} className="buttonOpcion">Productos</button>
                    <button onClick={Reportes} className="buttonOpcion">Reportes</button>
                    <button onClick={PanelPrincipal} className="buttonOpcion">PanelPrincipal</button>
                </div>
            </div>
        </>
    );
}
export default Nav;
