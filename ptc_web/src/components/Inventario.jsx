import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";


function Inventario(props) {
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
                    inventarioNav.style.color="white";
                    Pedido.style.color="white";
                    productosNav.style.color="white";
                    reportesNav.style.color="white";
                    panelPrincipalNav.style.color="white";
                    break
                case 'Asistente':
                    inventarioNav.style.color="white";
                    Pedido.style.color="white";
                    productosNav.style.color="white";
                    reportesNav.style.display="none";
                    panelPrincipalNav.style.display="none";
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
            <h1 className="Titulos">Inventario</h1>

            <div className="Botoninv">
            <button class="btn btn-primary " type="button">Agregar producto</button>
            <button class="btn btn-primary" type="button">Editar producto</button>
            </div>
            
            
            <table class="table table-bordered border border-secondary">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Dimension</th>
                <th scope="col">Volumen</th>
                <th scope="col">Existencia</th>
                <th scope="col">Precio</th>
                <th scope="col">Espacio en Almacen</th>
                <th scope="col">Valor Inventario</th>
                <th scope="col">Fecha Entrada</th>
                <th scope="col">Fecha Salida</th>
                <th scope="col">Proveedor</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                </tr>
                <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                </tr>
                <tr>
                <th scope="row">3</th>
                <td>Larry the Bird</td>
                <td>@twitter</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
                </tr>
            </tbody>
            </table>
                    </>
    );
}
export default Inventario;
