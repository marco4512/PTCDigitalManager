import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function PanelPrincipal(props) {
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
            <div id="containerPrincial" className="containerPanelPrincipal">
                <div id="NavTemporal" className="NavTemporal">
                    <button onClick={inventario} id="inventarioNav" className="buttonOpcion2">Inventario</button>
                    <button onClick={Pedido} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
                    <button onClick={Productos} id="productosNav" className="buttonOpcion2">Materiales</button>
                    <button onClick={Reportes} id="reportesNav" className="buttonOpcion2">Reportes</button>
                    <button onClick={PanelPrincipal} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
                </div>
                <h1 className="home">PanelPrincipal</h1>
                <h1 className="text-center mx-auto">Nombre de Usuario</h1>
                <br /><br /><br />


                <div className="row text-center pb-5">
                    <div className="col-10">
                        <div>
                            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio1">Hoy</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio2">Ayer</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio3">Semana</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio4" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio4">Fecha</label>
                            </div>
                            <div className="btn-group mx-3" role="group" aria-label="Basic radio toggle button group">
                                <input type="radio" className="btn-check" name="btnradio" id="btnradio5" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio5">Todos</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio6" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio6">Cliente</label>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="row pb-5 px-5">
                    <div className="panel-lg text-center col-6 bg-dark mx-3">Pedidos</div>
                    <div id="mi-col" className="col-5">
                        <div class="child bg-dark">Pendientes</div>
                        <div class="child bg-dark">Proceso</div>
                        <div class="child bg-dark">Realizados</div>
                    </div>
                </div>

                <div className="row pb-5 px-5">
                    <div id="mi-col" className="col-5">
                        <div class="child bg-dark">En Stock</div>
                        <div class="child bg-dark">Comprometidas</div>
                        <div class="child bg-dark">Necesitadas</div>
                    </div>
                    <div className="panel-lg col-6 bg-dark mx-3">Existencias</div>
                </div>

                <div className="row h-70 pb-5 px-5">
                    <div className="panel-lg col-5 bg-dark mx-4">Ventas</div>
                    <div className="panel-lg col-5 bg-dark mx-4">Clientes</div>
                </div>
            </div>
        </>
    );
}
export default PanelPrincipal;