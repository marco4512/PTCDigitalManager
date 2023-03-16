import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function AdminDashboard(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(false);
    const [primera_vez, setPrimera_vez] = useState(false);
    var containerPrincial = document.getElementById('containerPrincial');
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
    useEffect(() => {
        let NavTemporal = document.getElementById('NavTemporal');
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                containerPrincial.style.display = 'none';
                navigate('/login')
            }
            else {
                setEmail(usuarioFirebase.email);
                if (primera_vez == false) {
                    setPrimera_vez(true);
                    ObtenerNav(usuarioFirebase.email)
                    //obteniendo_nombre(usuarioFirebase.email);
                }
                if (primera_vez) {
                    console.log('ya se cargo');
                }
                //console.log(usuarioFirebase.email);
            }
            props.setUsuario(usuarioFirebase);
        });
    }, []);

    async function ObtenerNav(email) {
        var inventarioNav = document.getElementById('inventarioNav');
        var Pedido = document.getElementById('pedidoNav');
        var productosNav = document.getElementById('productosNav');
        var reportesNav = document.getElementById('reportesNav');
        var panelPrincipalNav = document.getElementById('panelPrincipalNav');
        const q = query(collection(getFirestore(), "Empleados"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            switch (doc.data().rol) {
                case 'Admin':
                    inventarioNav.style.color = "white";
                    Pedido.style.color = "white";
                    productosNav.style.color = "white";
                    reportesNav.style.color = "white";
                    panelPrincipalNav.style.color = "white";
                    break
                case 'Asistente':
                    inventarioNav.style.color = "white";
                    Pedido.style.color = "white";
                    productosNav.style.color = "white";
                    reportesNav.style.display = "none";
                    panelPrincipalNav.style.display = "none";
                    break

            }
        });
    }
    return (
        <>
            <div id="NavTemporal" className="NavTemporal">
                <button onClick={inventario} id="inventarioNav" className="buttonOpcion2">Inventario</button>
                <button onClick={Pedido} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
                <button onClick={Productos} id="productosNav" className="buttonOpcion2">Productos</button>
                <button onClick={Reportes} id="reportesNav" className="buttonOpcion2">Reportes</button>
                <button onClick={PanelPrincipal} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
            </div>
            <h1 className="home">AdminDashboard</h1>
        </>
    );
}
export default AdminDashboard;
