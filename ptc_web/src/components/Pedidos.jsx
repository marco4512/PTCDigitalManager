import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function Pedidos(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(false);
    const [primera_vez, setPrimera_vez] = useState(false);
    var containerPrincial = document.getElementById('containerPrincial');
    function Navegar(lugar) {
        navigate(`/${lugar}`)
    }
    var db = getFirestore();
    useEffect(() => {
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                containerPrincial.style.display = 'none';
                navigate('/login')
            }
            else {
                setEmail(usuarioFirebase.email);
                ObtenerNav(usuarioFirebase.email)
                ExtraerClientes().then(x => x)
                ExtraerTarimas().then(x => x)
                ExtraerProductos().then(x => x)
            }
            props.setUsuario(usuarioFirebase);
        });
    }, []);
    const [clientes, setClientes] = useState([{}])

    async function ExtraerClientes() {
        const subColRef = collection(db, "Clientes");
        const querySnapshot = await getDocs(subColRef)
        let json = {}
        querySnapshot.forEach((doc) => {
            json[doc.id] = doc.data()
        })
        setClientes([json])
        console.log('NOmbre clientes', clientes)
    }
    const [tarimaFiltro, setTarimaFiltro] = useState([])

    function buscarTarima(event) {
        let valor = event.target.value;
        if (valor != 'Cliente') {
            let TarimasFiltradas = Object.keys(clientes[0][valor])
            setTarimaFiltro(TarimasFiltradas)
            console.log(tarimaFiltro)
        } else {
            setTarimaFiltro([])
        }
    }
    const [construccion, setConstruccion] = useState([])
    function SeSeleccionoTarima(event) {
        let valor = event.target.value;
        if (valor != 'Tarima') {
            let datosTarima = tarimas.filter((tarima) => tarima[valor])
            let Construccion = []
            /**Extrallendo materiales de construccion y guardandolo para el
             * Futuro
            */
            datosTarima.map(function (tarima) {
                Object.keys(tarima[valor]).map(idProducto => {
                    Construccion.push([idProducto, tarima[valor][idProducto]['Cantidad']])
                })
            })
            setConstruccion(Construccion)
            console.log(construccion)
        } else {
            console.log('estas en tarima')

        }

    }
    const [productos, setProductos] = useState([])
    async function ExtraerProductos() {
        const querySnapshot = await getDocs(collection(db, "Inventario"));
        let alldata = []
        querySnapshot.forEach((doc) => {
            let data = {}
            if (doc.data()['Estatus']) {
                data[doc.id] = doc.data()
                alldata.push(data)
            }

        });
        setProductos(alldata)
    }

    const [tarimas, setTarimas] = useState([])

    async function ExtraerTarimas() {
        const subColRef = collection(db, "Tarimas");
        const querySnapshot = await getDocs(subColRef)
        let auxTarimas = [];
        querySnapshot.forEach((doc) => {
            auxTarimas.push(doc.id)
        })
        console.log('Se cargan los nombres', auxTarimas)
        let arregloAux = []
        auxTarimas.map(nombreTarima => {
            let aux = {};
            subTarimas(nombreTarima, aux).then(function (salida) {
                arregloAux.push(aux)
            })
        })

        setTarimas(arregloAux)
        console.log('tarimas', tarimas)

    }

    async function subTarimas(nombreTarima, aux) {
        const subColRef2 = collection(db, "Tarimas", nombreTarima, 'Construccion');
        const querySnapshot2 = await getDocs(subColRef2)
        let subAux = {};
        querySnapshot2.forEach((doc) => {
            subAux[doc.id] = doc.data();
        })
        aux[nombreTarima] = subAux;
    }
    const [cantidadinput, setCantidadinput] = useState('')
    function onChangeCantidad(event) {
        let valor = event.target.value
        console.log(valor)
        setCantidadinput(valor)
    }
    function presupuestar() {
        construccion.map(function (material) {
            let productData = productos.filter(producto => producto[material[0]])
            console.log('Material: ', productData,
                        ' CantidadTarimas: ', cantidadinput, 
                        ' Cantidad de ese material: ', material[1])
        })

    }
    async function ObtenerNav(email) {
        var inventarioNav = document.getElementById('inventarioNav');
        var Pedido = document.getElementById('pedidoNav');
        var productosNav = document.getElementById('productosNav');
        var reportesNav = document.getElementById('reportesNav');
        var panelPrincipalNav = document.getElementById('panelPrincipalNav');
        var prooveedores = document.getElementById('prooveedores');
        var tarimas = document.getElementById('tarimas');
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
                    prooveedores.style.color = "white";
                    tarimas.style.color = 'white';
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
                <button onClick={() => Navegar('stock')} id="inventarioNav" className="buttonOpcion2">Inventario</button>
                <button onClick={() => Navegar('pedido')} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
                <button onClick={() => Navegar('productos')} id="productosNav" className="buttonOpcion2">Material</button>
                <button onClick={() => Navegar('reportes')} id="reportesNav" className="buttonOpcion2">Reportes</button>
                <button onClick={() => Navegar('principal')} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
                <button onClick={() => Navegar('proveedores')} id="prooveedores" className="buttonOpcion2">Proveedor</button>
                <button onClick={() => Navegar('tarimas')} id="tarimas" className="buttonOpcion2">Tarimas</button>
            </div>
            <select id="select" onChange={buscarTarima} name="proveedores">
                <option key={'0.0'} value={'Cliente'}>Cliente</option>
                {Object.keys(clientes[0]).map((fila, indice) =>
                    < option key={indice} value={fila}>{fila}</option>
                )}
            </select >
            <select id="select" onChange={SeSeleccionoTarima} name="proveedores">
                <option key={'0.0'} value={'Tarima'}>Tarimas</option>
                {tarimaFiltro.map((fila, indice) =>
                    < option key={indice} value={fila}>{fila}</option>
                )}
            </select >
            <label > Ingresa la cantidad</label>
            <input type="number" onChange={onChangeCantidad} value={cantidadinput} />
            <button onClick={() => presupuestar()}>Presupuesto</button>
        </>
    );
}
export default Pedidos;