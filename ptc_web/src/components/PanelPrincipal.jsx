import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import SubMenu from './SubMenu';
import Nav from "./Nav.jsx";
import html2pdf from 'html2pdf.js';//Añadir la libreria

function PanelPrincipal(props) {
    const navigate = useNavigate();
    const [rol, setRol] = useState('');
    const auth = getAuth();
    var db = getFirestore();


    const [user, setUser] = useState('UserName');
    const [pedidos, setPedidos] = useState();
    const [clientes, setClientes] = useState();
    const [inventario, setInventario] = useState();
    const [existencias, setExistencias] = useState();
    const [ventas, setVentas] = useState();


    useEffect(() => {
        let Spinner = document.getElementById('Spinner');
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                navigate('/login')
            }
            else {
                console.log('Deberia de pasar a block')
                ExtraerRol(usuarioFirebase.email, Spinner).then(x => {
                    if (Spinner) {
                        Spinner.style.display = 'none';
                        console.log('El rol', rol)
                    }
                })
            }
        });
        Update();
    }, []);

    async function ExtraerRol(email, Spinner) {
        const q = query(collection(db, "Empleados"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setRol(doc.data().rol)
            setUser(doc.data().email)
        })
    }

    async function Update() {


        const qpedidos = query(collection(db, "Pedidos"));
const querySnapshotpedidos = await getDocs(qpedidos);
let contadorRealizados = 0;
let contadorProceso = 0;
let contadorPendiente = 0;
let contadorSinEstado = 0;
let totalCostoStockRealizado = 0;

querySnapshotpedidos.forEach((doc) => {
  console.log(doc.id, '====>', doc.data());

  const estado = doc.data().estado;
  const costoStock = parseFloat(doc.data().costoStock);

  if (estado === "realizado") {
    contadorRealizados++;
    totalCostoStockRealizado += costoStock;
  } else if (estado === "proceso") {
    contadorProceso++;
  } else if (estado === "pendiente") {
    contadorPendiente++;
  } else {
    contadorSinEstado++;
    contadorPendiente++;
  }
});

console.log("Total de documentos con estado 'realizado':", contadorRealizados);
console.log("Total de documentos con estado 'proceso':", contadorProceso);
console.log("Total de documentos con estado 'pendiente':", contadorPendiente);

if (contadorSinEstado > 0) {
  console.log("Total de documentos sin estado:", contadorSinEstado);
  console.log("Los documentos sin estado se consideraron como 'pendiente'.");
}

console.log("Total de costoStock de pedidos en estado 'realizado':", totalCostoStockRealizado);
        setVentas(totalCostoStockRealizado);

        //Total de Pedidos
        const q = query(collection(db, "Pedidos"));
        const querySnapshot = await getDocs(q);
        const totalDocuments = querySnapshot.docs.length;
        console.log("Número total de documentos:", totalDocuments);

        let Pedidos = {
            Total: totalDocuments,
            Realizados: contadorRealizados,
            Proceso: contadorProceso,
            Pendientes: contadorPendiente
        };
        console.log("Pedidos: ", Pedidos);
        console.log("Pedidos Realizados: ", Pedidos.Realizados);
        //Propuesta
        //Para calcular los pedidos pendientes se calculara Total - Realizados - Proceso
        setPedidos(Pedidos);

        //Total de clientes
        const clientesQ = query(collection(db, "Clientes"));
        const clientesQuerySnapshot = await getDocs(clientesQ);
        const totalClientes = clientesQuerySnapshot.size;
        console.log("Total de clientes:", totalClientes);
        setClientes(totalClientes);
        // Recorrer Clientes
        // clientesQuerySnapshot.forEach((doc) => {
        //     console.log(doc.id, '=>', doc.data());
        // });


        //INVENTARIO
        const inventarioQ = query(collection(db, "Inventario"));
        const inventarioQuerySnapshot = await getDocs(inventarioQ);
        const totalInventario = inventarioQuerySnapshot.size;
        console.log("Total de elementos en inventario:", totalInventario);
        setInventario(totalInventario);

        //Total de Existencias
        let existencias = []; // Array para almacenar los valores de existencia y su información completa

        inventarioQuerySnapshot.forEach((doc) => {
            const existencia = {
                id: doc.id,
                ...doc.data()
            };

            existencias.push(existencia); // Agrega la información completa de existencia al array existencias

            console.log(doc.id, '=>', existencia);
        });

        // Accede a la información después de finalizar el bucle
        console.log('Información de Existencias:', existencias);
        setExistencias(existencias);
    };

    //DECLARAR BOTON PARA DECARGAR PDF

    const DownloadPDFButton = ({ contentId, buttonLabel }) => {
        const handleDownloadPDF = () => {
            var today = new Date();
            // obtener la fecha y la hora
            var now = today.toLocaleString();
            const element = document.getElementById(contentId);
            const opt = {
                margin: 10,
                filename: now + ' PTC-report.pdf', // Nombre del archivo PDF
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };

            html2pdf().from(element).set(opt).save();
        };

        return <button onClick={handleDownloadPDF}>{buttonLabel}</button>;
    };

    return (
        <>
            <Nav state={'SingOut'} />
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
            <div id="containerPrincial" className="containerPanelPrincipal">
                <SubMenu Rol={rol} />
                <div id="containerPDF">
                    <h1 className="home">PanelPrincipal</h1>
                    <h1 className="text-center mx-auto">{user}</h1>
                    {/* <h1 className="text-center mx-auto">PedidosTotal: {pedidos?.Total}</h1>
                    <hr />
                    <h1 className="text-center mx-auto">{JSON.stringify(pedidos)}</h1>
                    <h1 className="text-center mx-auto">PedidosTotal: {pedidos?.Total}</h1>
                    <h1 className="text-center mx-auto">PedidosRealizados: {pedidos?.Realizados}</h1>
                    <h1 className="text-center mx-auto">PedidosProceso: {pedidos?.Proceso}</h1>
                    <h1 className="text-center mx-auto">PedidosPendientes: {pedidos?.Pendientes}</h1>
                    <hr /> */}
                    <br /><br /><br />
                    <div className="row text-center pb-5">
                        <div className="col-10">
                            {/* <div>
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
                        </div> */}
                        </div>
                    </div>



                    <div className="row pb-5 px-5">
                        <div className="panel-lg text-center col-6 bg-dark mx-3">
                            Pedidos
                            <div class="content-panel-lg">{pedidos?.Total}</div>
                        </div>

                        <div id="mi-col" className="col-5">
                            <div class="child bg-dark text-center">Pendientes
                                <div class="content-panel-sm">{pedidos?.Pendientes}</div>
                            </div>
                            <div class="child bg-dark text-center">Proceso
                                <div class="content-panel-sm">{pedidos?.Proceso}</div>
                            </div>
                            <div class="child bg-dark text-center">Realizados
                                <div class="content-panel-sm">{pedidos?.Realizados}</div>
                            </div>
                        </div>
                    </div>

                    <div className="row pb-5 px-5">
                        <div id="mi-col" className="col-5">
                            <div class="child bg-dark text-center text-center">En Stock
                                <div class="content-panel-sm">---</div>
                            </div>
                            <div class="child bg-dark text-center text-center">Comprometidas
                                <div class="content-panel-sm">---</div>
                            </div>
                            <div class="child bg-dark text-center text-center">Necesitadas
                                <div class="content-panel-sm">---</div>
                            </div>
                        </div>
                        <div className="panel-lg col-6 bg-dark mx-3 text-center">Existencias
                            <div class="content-panel-lg">---</div>
                        </div>
                    </div>

                    <div className="row h-70 pb-5 px-5">
                        <div className="panel-lg col-5 bg-dark mx-4 text-center">Ventas
                            <div className="content-panel-lg-money"><p>${ventas}</p></div>
                        </div>
                        <div className="panel-lg col-5 bg-dark mx-4 text-center">Clientes
                            <div class="content-panel-lg">{clientes }</div>
                        </div>
                    </div>
                </div>
            </div>
            <DownloadPDFButton contentId="containerPDF" className="material-symbols-outlined" buttonLabel="Descargar PDF" />
        </>
    );
}
export default PanelPrincipal;