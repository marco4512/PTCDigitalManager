import { React, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
function SubMenu(props) {
    const navigate = useNavigate();

    function Navegar(pagina) {
        navigate(`/${pagina}`)
    }

    useEffect(() => {
        var inventarioNav = document.getElementById('inventarioNav');
        var Pedido = document.getElementById('pedidoNav');
        var productosNav = document.getElementById('productosNav');
        var reportesNav = document.getElementById('reportesNav');
        var panelPrincipalNav = document.getElementById('panelPrincipalNav');
        var prooveedores = document.getElementById('prooveedores');
        var tarimas = document.getElementById('tarimas');
        var Clientes = document.getElementById('Clientes');
        console.log('Se esta cargando')
        switch (props.Rol) {
            case 'Admin':
                inventarioNav.style.color = "white";
                Pedido.style.color = "white";
                productosNav.style.color = "white";
                reportesNav.style.color = "white";
                panelPrincipalNav.style.color = "white";
                prooveedores.style.color = "white";
                tarimas.style.color = 'white';
                Clientes.style.color = "white";

                break
            case 'Asistente':
                inventarioNav.style.color = "white";
                Pedido.style.color = "white";
                productosNav.style.color = "white";
                reportesNav.style.display = "none";
                Clientes.style.color = "white";
                panelPrincipalNav.style.display = "none";
                break
        }
    })




    return (
        <>
            <div id="NavTemporal" className="NavTemporal">
                <button onClick={() => Navegar('stock')} id="inventarioNav" className="buttonOpcion2">Inventario</button>
                <button onClick={() => Navegar('pedido')} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
                <button onClick={() => Navegar('productos')} id="productosNav" className="buttonOpcion2">Material</button>
                <button onClick={() => Navegar('reportes')} id="reportesNav" className="buttonOpcion2">Reportes</button>
                <button onClick={() => Navegar('principal')} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
                <button onClick={() => Navegar('proveedores')} id="prooveedores" className="buttonOpcion2">Proveedor</button>
                <button onClick={() => Navegar('tarimas')} id="tarimas" className="buttonOpcion2">Tarimas</button>
                <button onClick={() => Navegar('cliente')} id="Clientes" className="buttonOpcion2">Clientes</button>
            </div>
        </>
    );
}
export default SubMenu;

