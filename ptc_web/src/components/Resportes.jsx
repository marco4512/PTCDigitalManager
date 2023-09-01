import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';
import Card from 'react-bootstrap/Card';


function Reportes(props) {
    const navigate = useNavigate();
    const [rol, setRol] = useState('');
    var db = getFirestore();

    const [inventario, setInventario] = useState();
    const [existencias, setExistencias] = useState();
    const [pedidos, setPedidos] = useState();
    const [totalPedidos, setTotalPedidos] = useState();
    const [valorTotalPedidos, setValorTotalPedidos] = useState();
    const [valorTotalInventario, setValorTotalInventario] = useState('');
    const [totalInventario, setTotalInventario] = useState('');
    const [total, setTotal] = useState('');


    async function ExtraerRol(email) {
        const q = query(collection(db, "Empleados"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setRol(doc.data().rol)
        })
    }


    useEffect(() => {
        let Spinner = document.getElementById('Spinner');
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                navigate('/login')
            }
            else {
                ExtraerRol(usuarioFirebase.email).then(x => {
                    if (Spinner) {
                        Spinner.style.display = 'none';
                    }
                })

            }
        });
        Update();
    }, []);


    async function Update() {

        try {
            const inventarioQ = query(collection(db, "Inventario"));
            const inventarioQuerySnapshot = await getDocs(inventarioQ);
            const totalInventario = inventarioQuerySnapshot.size;
            console.log("Total de elementos en inventario:", valorTotalInventario);
            setValorTotalInventario(valorTotalInventario);

            //Total de Existencias
            let existencias = []; // Array para almacenar los valores de existencia y su información completa
            let calculoTotalInventario=0;
            let elements = [];
            inventarioQuerySnapshot.forEach((doc) => {
                const existencia = {
                    id: doc.id,
                    ...doc.data()
                };

                existencias.push(existencia); // Agrega la información completa de existencia al array existencias
                calculoTotalInventario = calculoTotalInventario + parseFloat(existencia.ValorInventario)
                elements.push(parseFloat(existencia.ValorInventario))
                console.log(doc.id, '=>', existencia);
            });

            // Accede a la información después de finalizar el bucle
            setValorTotalInventario(calculoTotalInventario)
            console.log("calculoTotalInventario", calculoTotalInventario);
            console.log("elements", elements);
            console.log('Información de Existencias:', existencias);
            setExistencias(existencias);
        } catch (error) {
            alert("Error al obtener documentos de inventario:", error);
            return [];
        }


        try {
            const pedidosQ = query(collection(db, "Pedidos"));
            const pedidosQuerySnapshot = await getDocs(pedidosQ);
            const totalPedidos = pedidosQuerySnapshot.size;
            console.log("Total de pedidos:", totalPedidos);
            setTotalPedidos(totalPedidos); // Asegúrate de tener una función para manejar la configuración del estado de los pedidos

            let pedidos = [];
            let calculoTotalPedidos=0;
            
            pedidosQuerySnapshot.forEach((doc) => {
                const pedido = {
                    id: doc.id,
                    ...doc.data()
                };
                if (pedido.estado == 'realizado' || pedido.estado == 'devuelto'){
                    pedidos.push(pedido);
                    try{
                        calculoTotalPedidos = calculoTotalPedidos + parseFloat(pedido.TotalCosto)
                        console.log("Checa esto: ",pedido.TotalCosto)
                    }catch(error){
                        console.error('Error',error)
                    }
                }else{
                    console.log("Se devolvio: ",doc.id);
                }
                console.log(doc.id, '=>', pedido);
            });
            setValorTotalPedidos(calculoTotalPedidos)
            console.log('Información de Pedidos:', pedidos);
            console.log("pedidos 6",pedidos)
            setPedidos(pedidos); // Asegúrate de tener una función para manejar la configuración del estado de la lista de pedidos
            console.log("pedidos 7",pedidos)
            console.log(valorTotalPedidos)
        } catch (error) {
            alert("Error al obtener documentos de inventario:", error);
            return [];
        }
    }
    useEffect(() => {
        if (valorTotalPedidos !== '' && valorTotalInventario !== '') {
            const calculoTotal = parseFloat(valorTotalPedidos) + parseFloat(valorTotalInventario);
            setTotal(calculoTotal);
        }
    }, [valorTotalPedidos, valorTotalInventario]);


    return (
        <>
            <div id="Spinner" className="Loader">
                <div class="spinner">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <Nav state={'SingOut'} />
            <SubMenu Rol={rol} />
            <div>
            <h1 className="home">Reportes</h1>
            {/* <p>{JSON.stringify(existencias)}</p> */}
            <h2>Inventario</h2>
            <table className="numpedi table table-bordered border border-secondary" style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead className="headersTAble">
                    <tr id="subHeader">
                        <th>Material</th>
                        <th>Dimension</th>
                        <th>Proveedor</th>
                        <th>Fecha Entrada</th>
                        <th>Fecha Salida</th>
                        <th>Existencia</th>
                        <th>Precio</th>
                        <th>Espacio en Almacén</th>
                        <th>Volumen</th>
                        <th>Estatus</th>
                        <th>Valor Inventario</th>
                    </tr>
                </thead>
                <tbody>
                    {existencias?.map((dato) => {
                        const { id, Nombre, Dimension, Proveedor, FechaEntrada, FechaSalida, Existencia, Precio, ValorInventario, EspacioEnAlmacen, Volumen, Estatus } = dato;
                        return (
                            <tr key={id}>
                                <td>{Nombre}</td>
                                <td>{Dimension}</td>
                                <td>{Proveedor}</td>
                                <td>{FechaEntrada}</td>
                                <td>{FechaSalida || 'Sin salida'}</td>
                                <td>{Existencia}</td>
                                <td>{Precio}</td>
                                <td>{EspacioEnAlmacen}</td>
                                <td>{Volumen}</td>
                                <td>{Estatus ? 'Activo' : 'Inactivo'}</td>
                                <td>{ValorInventario}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <h1>Total inventario: {valorTotalInventario ? valorTotalInventario : "Calculando..."}</h1>
            {/* <h2>Pedidos</h2>
            <p>{JSON.stringify(pedidos)}</p> */}
            <table className="numpedi table table-bordered border border-secondary" style={{ width: '100%', tableLayout: 'fixed' }}>
      <thead className="headersTAble">
        <tr id="subHeader">
          <th>id</th>
          <th>Demanda</th>
          <th>Estado</th>
          <th>Costo de Stock</th>
          <th>Costo de Material</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Suma de Pies</th>
          <th>Tarima</th>
          <th>Total de Costo</th>
        </tr>
      </thead>
      <tbody>
        {pedidos?.map(pedido => (
          <tr key={pedido.id}>
            <td>{pedido.id}</td>
            <td>{pedido.Demanda}</td>
            <td>{pedido.estado}</td>
            <td>{pedido.costoStock}</td>
            <td>{pedido.costoMaterial}</td>
            <td>{pedido.fechaSalida || 'Sin salida'}</td>
            <td>{pedido.cliente}</td>
            <td>{pedido.SumaPies}</td>
            <td>{pedido.Tarima}</td>
            <td>{pedido.TotalCosto}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <h1>Total inventario: {valorTotalPedidos ? valorTotalPedidos : "Calculando..."}</h1>
    <h1>Total: {total ? total : "Calculando..."}</h1>
            </div>


        </>
    );
}
export default Reportes;