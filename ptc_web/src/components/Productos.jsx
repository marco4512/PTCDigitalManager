import { React, useEffect, useState } from "react";
import { json, useNavigate } from 'react-router-dom';
import { query, where, getDocs, doc, getFirestore, collection, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import { async } from "@firebase/util";

function Productos(props) {


    const navigate = useNavigate();
    const [email, setEmail] = useState(false);
    const [primera_vez, setPrimera_vez] = useState(false);
    const [productos, setProductos] = useState([]);
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
                if (primera_vez == false || productos) {
                    console.log('cargando la primera vez')
                    setPrimera_vez(true);
                    ObtenerNav(usuarioFirebase.email)
                    ExtraerProductos()
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

    async function ExtraerProductos() {

        let db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((doc) => {
            setProductos(doc.data().Productos)
        });
        console.log('Los Productos', productos)

    }

    async function eliminarProducto(data) {
        let db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((documento) => {
            let Finales = []
            documento.data()['Productos'].map(function (producto) {
                let arregloFirebase = Object.values(producto).sort();
                let arregloActual = Object.values(data).sort();
                if (String(arregloFirebase) != String(arregloActual)) {
                    Finales.push(producto)
                }
            })
            const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
            let dataEnviar = { 'Productos': Finales }
            setDoc(docRef, dataEnviar).then(docRef => {
                console.log("Entire Document has been updated successfully");
                window.location.reload()
            }).catch(error => {
                    console.log(error);
                })
            console.log('salida->', Finales)
        });

    }
    function editarProducto(data) {
        console.log('datos', data)

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
            <div className="tituloProdi">
                <h1>Productos</h1>

            </div>
            <div className="contenidoTotal">
                <div className="TablaCont">
                    <Table striped bordered hover className="tablaProductos">
                        <thead>
                            <tr>
                                <th>Dimension</th>
                                <th>Material</th>
                                <th>Nombre</th>
                                <th>Volumen</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                productos.map((number) =>
                                    <tr className="centrarfila">
                                        <td key={number.id} >{number['Dimension']}</td>
                                        <td key={number.id} >{number['Material']}</td>
                                        <td key={number.id} >{number['Nombre']}</td>
                                        <td key={number.id} >{number['Volumen']}</td>
                                        <div className="accionAtomar">
                                            <button id="cancelarButton" onClick={() => { eliminarProducto(number) }} >X</button>
                                            <button id="editarButton" className="material-symbols-outlined" onClick={() => { editarProducto(number) }}><span > edit </span></button>
                                        </div>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </div>
                <div className="OpcionesDeProductos">
                    <p className="tituloProductoAmin">Administración de los productos</p>
                    <div className="group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input placeholder="Search" type="search" className="input" />
                    </div>
                    <br />
                    <br />
                    <div className="ButtonesAgregarProducto">
                        <button id="NuevoProducto" >Agregar NuevoProducto</button>
                        <button id="DesdeSheet">Agregar desde Sheet</button>
                    </div>
                </div>
            </div>

        </>
    );
}
export default Productos;
