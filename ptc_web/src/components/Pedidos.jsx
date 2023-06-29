import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, doc, where, setDoc, getDocs, getFirestore, collection, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';
import { Toaster, toast } from 'sonner';

function Pedidos(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [dataDelate, setDataDelate] = useState(false);
    const [rol, setRol] = useState('');

    const [showDelate, setShowDelate] = useState(false);

    function handleShowDelate(allData) {
        setShowDelate(true);
        setDataDelate(allData);

    };

    const handleCloseDelate = () => setShowDelate(false);


    var db = getFirestore();
    const [pedidos, setPedidos] = useState([])

    async function ExtraerPedidos() {
        const querySnapshot = await getDocs(collection(db, "Pedidos"));
        let alldata = []
        querySnapshot.forEach((doc) => {
            let data = {}
            data[doc.id] = doc.data()
            alldata.push(data)
        });

        setPedidos(alldata)

    }
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
                        ExtraerPedidos().then(x => x)
                        ExtraerClientes().then(x => x)
                        ExtraerTarimas().then(x => x)
                        ExtraerProductos().then(x => {
                            Spinner.style.display = 'none';
                        })
                    }
                })


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

    }
    const [tarimaFiltro, setTarimaFiltro] = useState([])
    function buscarTarima(event) {
        let valor = event.target.value;
        if (valor != 'Cliente') {
            setClienteSeleccionado(valor)
            let JustTrue = Object.keys(clientes[0][valor]).filter(key => clientes[0][valor][key])
            setTarimaFiltro(JustTrue)

        } else {
            setTarimaFiltro([])
        }
    }
    const [construccion, setConstruccion] = useState([])
    const [TarimaSeleccionada, setTarimaSeleccionada] = useState('')
    const [clienteSeleccionado, setClienteSeleccionado] = useState('')
    function SeSeleccionoTarima(event) {
        let valor = event.target.value;

        if (valor != 'Tarima') {
            setTarimaSeleccionada(valor)
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

        let arregloAux = []
        auxTarimas.map(nombreTarima => {
            let aux = {};
            subTarimas(nombreTarima, aux).then(function (salida) {
                arregloAux.push(aux)
            })
        })

        setTarimas(arregloAux)


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
        setCantidadinput(valor)
    }
    const [datosFiltrados, setDatosFiltrados] = useState([])
    const [costoStock, setCostoStock] = useState('');
    const [costoMaterial, setCostoMaterial] = useState('');
    const [TotalCosto, setTotalCosto] = useState('');
    const [TotalPies, setTotalPies] = useState('');
    const [controller, setControler] = useState(false);
    function presupuestar() {
        let full = [];
        setControler(true)
        construccion.map(function (material) {
            let productData = productos.filter(producto => producto[material[0]])
            let idProducto = Object.keys(productData[0])[0]
            let cantidadTarimas = isNaN(Number(cantidadinput)) ? 0 : Number(cantidadinput)
            let cantidadDeMaterial = isNaN(Number(material[1])) ? 0 : Number(material[1])
            let ExistenciaActual = isNaN(Number(productData[0][idProducto]['Existencia'])) ? 0 : Number(productData[0][idProducto]['Existencia'])
            let VolumenTabla = isNaN(Number(productData[0][idProducto]['Volumen'])) ? 0 : Number(productData[0][idProducto]['Volumen'])
            let totalPieza = cantidadDeMaterial * cantidadTarimas
            let TotalPies = Number((VolumenTabla * totalPieza).toFixed(4))
            let precio = Number(productData[0][idProducto]['Precio'])
            let PiezasAPedir = ExistenciaActual - totalPieza < 0 ? (ExistenciaActual - totalPieza) * -1 : 0
            let PiezasQueSiTenemos = PiezasAPedir == 0 ? totalPieza : ExistenciaActual;
            let PiezasRestantesEnInventario = ExistenciaActual - totalPieza
            let InventarioRestante = PiezasRestantesEnInventario < 0 ? 0 : PiezasRestantesEnInventario
            let PiezasDelStockQueSeVan = ExistenciaActual > totalPieza ? totalPieza : ExistenciaActual
            let CostoDeStock = PiezasDelStockQueSeVan * precio
            let CostoMaterialAComprar = PiezasAPedir != 0 ? PiezasAPedir * precio : 0
            let totalInversion = CostoMaterialAComprar + CostoDeStock;


            let salidaFormateada = {
                'Cliente': clienteSeleccionado,
                'Tarima': TarimaSeleccionada,
                'Material': productData[0][idProducto]['Nombre'],
                'Dimension': productData[0][idProducto]['Dimension'],
                'CantidadPorMaterial': cantidadDeMaterial,
                'CantidadDeTarimas': cantidadTarimas,
                'TotalPiezas': totalPieza,
                'PieTabla': VolumenTabla,
                'TotalPies': TotalPies,
                'StockPiezas': ExistenciaActual,
                'Precio': precio,
                'Piezas a pedir': PiezasAPedir,
                'Proveedor': productData[0][idProducto]['Proveedor'],
                'InversionPorMaterial': CostoMaterialAComprar,
                'InversionDeStock': CostoDeStock,
                'TotalDeInversion': totalInversion
            }
            full.push(salidaFormateada)
        })
        setDatosFiltrados(full)
        let CostoStock = 0;
        let CostoMaterial = 0;
        let SumaPies = 0;
        full.map(function (fila) {
            CostoStock = CostoStock + fila['InversionDeStock']
            CostoMaterial = CostoMaterial + fila['InversionPorMaterial']
            SumaPies = SumaPies + Number(fila['TotalPies'])

        }
        )
        let CostoTotal = CostoStock + CostoMaterial;

        setCostoStock(CostoStock.toFixed(2))
        setCostoMaterial(CostoMaterial.toFixed(2))
        setTotalCosto(CostoTotal.toFixed(2))
        setTotalPies(SumaPies.toFixed(2))
    }
    async function SubirPedido() {
        let NoPermitidos = ['', '0', 'Cliente', 'Tarima'];
        if ((controller && !NoPermitidos.includes(clienteSeleccionado)) && (!NoPermitidos.includes(TarimaSeleccionada)) && (!NoPermitidos.includes(cantidadinput))) {
            //console.log('Data valida')
            const subColRef = collection(db, "Pedidos");
            const querySnapshot = await getDocs(subColRef);
            var lastIndex = -1;
            querySnapshot.forEach((doc) => {
                lastIndex = doc.id;
            });

            const totalDocumentos = lastIndex != 0 - 1 ? parseInt(lastIndex) + 1 : 0;

            const currentDate = new Date();
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            let formateado = {
                pedido: datosFiltrados,
                fecha: `${day}/${month}/${year}`,
                cliente: datosFiltrados[0]['Cliente'],
                Tarima: datosFiltrados[0]['Tarima'],
                SumaPies: TotalPies,
                costoStock: costoStock,
                costoMaterial: costoMaterial,
                TotalCosto: TotalCosto,
                Demanda: cantidadinput
            }
            const subColRef2 = doc(db, "Pedidos", String(totalDocumentos));
            setDoc(subColRef2, formateado).then(docRef => {
                ExtraerProductos().then(function (x) {
                    setDatosFiltrados([])
                    setCostoStock('')
                    setCostoMaterial('')
                    setTotalCosto('')
                    setTotalPies('')
                    setCantidadinput('')
                    setControler(false)
                    handleClose();
                    ExtraerPedidos();
                    toast.success('Pedido Creado Correctamente')

                })
            }).catch(error => {
                console.log(error);
            })


        } else {
            console.log('Data vacia')

        }

    }
    async function EliminarPedido(indiceDocumento) {
        let Spinner = document.getElementById('Spinner');
        await deleteDoc(doc(db, "Pedidos", indiceDocumento)).then(function (x) {
            Spinner.style.display = 'flex';
            handleCloseDelate()
            toast.success('Eliminado correctamente')
            ExtraerPedidos().then(x => x)
            ExtraerClientes().then(x => x)
            ExtraerTarimas().then(x => x)
            ExtraerProductos().then(x => {
                Spinner.style.display = 'none';

            })


        })
    }

    const [showEdit, setShowEdit] = useState(false);
    const handleEditClose = () => setShowEdit(false);
    const handleEditShow = () => setShowEdit(true);


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
            <Modal id='main-modal' show={show} onHide={handleClose}>
                <Modal.Header className="TituloProductosNuevos" closeButton>
                    <Modal.Title>Agregar Un Nuevo Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >
                    Generando Pedidos
                    <Table id="tablaProductos" striped bordered hover className="tablaProductos numpedi table table-bordered border border-secondary">
                        <thead className="headersTAble">
                            <tr id="topOfDataPedido" style={{ alignItems: 'center' }}>
                                <th colSpan={2}>Cliente:</th>
                                <th id="labelCliente" colSpan={2}>
                                    <select id="select2" onChange={buscarTarima} name="proveedores">
                                        <option key={'0.0'} value={'Cliente'}>Cliente</option>
                                        {Object.keys(clientes[0]).map((fila, indice) =>
                                            < option key={indice} value={fila}>{fila}</option>
                                        )}
                                    </select >
                                </th>
                                <th colSpan={1} >Tarima:</th>
                                <th colSpan={2} >

                                    <select id="select2" onChange={SeSeleccionoTarima} name="proveedores">
                                        <option key={'0.0'} value={'Tarima'}>Tarimas</option>
                                        {tarimaFiltro.map((fila, indice) =>
                                            < option key={indice} value={fila}>{`${clienteSeleccionado.substring(0, 2)} ${fila}`}</option>
                                        )}
                                    </select >
                                </th>
                                <th style={{ textAlign: 'center' }} >
                                    <label> Demanda</label>
                                    <input className="inputEditar" onChange={onChangeCantidad} required type="number" min={1} max={100000} />
                                </th>

                                <th style={{ textAlign: 'center' }}>
                                    <label>Fecha de entrega</label>
                                    <input className="inputEditar" required type="date" />
                                </th>

                                <th colSpan={2}>
                                    <button id="generarBotton" onClick={() => presupuestar()} >Generar</button>
                                </th>
                            </tr>

                            <tr id="subHeader" >
                                <th colSpan={5}>Datos de la Tarima</th>
                                <th colSpan={8} >Datos del Pedido</th>
                            </tr>
                            <tr id="subHeader">

                                <th >No Tarima</th>
                                <th>Material</th>
                                <th>Dimensión</th>
                                <th>Precio</th>
                                <th>Qty</th>
                                <th>TotalPiezas</th>
                                <th>Pie Tabla</th>
                                <th>Total Pies</th>
                                <th>Stock Piezas</th>
                                <th>Piezas x Pedir</th>
                                <th>Proveedor</th>


                            </tr>
                        </thead>

                        <tbody className="bodyTable">
                            {
                                datosFiltrados.map(fila =>
                                    <tr>
                                        <th>{fila['Tarima']}</th>
                                        <th>{fila['Material']}</th>
                                        <th>{fila['Dimension']}</th>
                                        <th>${fila['Precio']}</th>
                                        <th>{fila['CantidadPorMaterial']}</th>
                                        <th>{fila['TotalPiezas']}</th>
                                        <th>{fila['PieTabla']}</th>
                                        <th>{fila['TotalPies']}</th>
                                        <th style={fila['StockPiezas'] < 5 ? { color: 'red' } : { color: 'black' }} >{fila['StockPiezas']}</th>
                                        <th style={fila['Piezas a pedir'] > 0 ? { color: 'red' } : { color: 'black' }} >{fila['Piezas a pedir']}</th>
                                        <th>{fila['Proveedor']}</th>
                                    </tr>
                                )
                            }

                            <tr >
                                <th colSpan={2}  >Costo de Stock</th>
                                <th colSpan={1} style={{ color: 'green' }}>${costoStock}</th>
                                <th colSpan={2} >Costo de materiales a comprar</th>
                                <th colSpan={2} style={{ color: 'green' }}>${costoMaterial}</th>
                                <th colSpan={2} >Total de Costo</th>
                                <th colSpan={2} style={{ color: 'green' }}>${TotalCosto}</th>
                            </tr>

                        </tbody>

                    </Table>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={SubirPedido} >
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal id='main-modal' show={showDelate} onHide={handleCloseDelate}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >
                    Datos de pedido
                    <Table id="tablaProductos" striped bordered hover className="tablaProductos numpedi table table-bordered border border-secondary">
                        <thead className="headersTAble">
                            <tr id="topOfDataPedido" style={{ alignItems: 'center' }}>
                                <th colSpan={2} style={{ textAlign: 'center' }} >
                                    <label >Cliente</label>
                                    <br />
                                    <label >{`${dataDelate[Object.keys(dataDelate)] != undefined ? dataDelate[Object.keys(dataDelate)]['cliente'] : ''}`}</label>
                                </th>
                                <th id="labelCliente" colSpan={2} style={{ textAlign: 'center' }}>
                                    <label >Tarima</label>
                                    <br />
                                    <label >{`${dataDelate[Object.keys(dataDelate)] != undefined ? dataDelate[Object.keys(dataDelate)]['Tarima'] : ''}`}</label>
                                </th>
                                <th style={{ textAlign: 'center' }} colSpan={2}>
                                    <label> Demanda</label>
                                    <br />
                                    <label> {`${dataDelate[Object.keys(dataDelate)] != undefined ? dataDelate[Object.keys(dataDelate)]['Demanda'] : ''}`}</label>
                                </th>
                                <th style={{ textAlign: 'center' }} colSpan={3}>
                                    <label>Fecha de inicio</label>
                                    <input className="inputEditar" required value={`${dataDelate[Object.keys(dataDelate)] != undefined ? dataDelate[Object.keys(dataDelate)]['fecha'] : ''}`} type="text" />
                                </th>
                                <th style={{ textAlign: 'center' }} colSpan={3}>
                                    <label>Fecha de entrega</label>
                                    <input className="inputEditar" required type="date" />
                                </th>
                            </tr>
                            <tr id="subHeader" >
                                <th colSpan={5}>Datos de la Tarima</th>
                                <th colSpan={8} >Datos del Pedido</th>
                            </tr>
                            <tr id="subHeader">

                                <th >No Tarima</th>
                                <th>Material</th>
                                <th>Dimensión</th>
                                <th>Precio</th>
                                <th>Qty</th>
                                <th>TotalPiezas</th>
                                <th>Pie Tabla</th>
                                <th>Total Pies</th>
                                <th>Stock Piezas</th>
                                <th>Piezas x Pedir</th>
                                <th>Proveedor</th>


                            </tr>
                        </thead>

                        <tbody className="bodyTable">
                            {
                                dataDelate[Object.keys(dataDelate)] != undefined ?
                                    dataDelate[Object.keys(dataDelate)]['pedido'].map(fila =>
                                        <tr>
                                            <th>{fila['Tarima']}</th>
                                            <th>{fila['Material']}</th>
                                            <th>{fila['Dimension']}</th>
                                            <th style={{ color: 'green' }} >${fila['Precio']}</th>
                                            <th>{fila['CantidadPorMaterial']}</th>
                                            <th>{fila['TotalPiezas']}</th>
                                            <th style={{ color: '#1F618D' }} >{fila['PieTabla']}</th>
                                            <th style={{ color: '#1F618D' }} >{fila['TotalPies']}</th>
                                            <th>{fila['StockPiezas']}</th>
                                            <th style={fila['Piezas a pedir'] != 0 ? { color: 'red' } : { color: 'black' }} >{fila['Piezas a pedir']}</th>
                                            <th>{fila['Proveedor']}</th>
                                        </tr>
                                    ) :
                                    ''

                            }

                            <tr >
                                <th colSpan={2}  >Costo de Stock</th>
                                <th colSpan={1} style={{ color: 'green' }}>${costoStock}</th>
                                <th colSpan={2} >Costo de materiales a comprar</th>
                                <th colSpan={2} style={{ color: 'green' }}>${costoMaterial}</th>
                                <th colSpan={2} >Total de Costo</th>
                                <th colSpan={2} style={{ color: 'green' }}>${TotalCosto}</th>
                            </tr>

                        </tbody>

                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDelate}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => EliminarPedido(`${Object.keys(dataDelate)}`)}  >
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal id='main-modal' show={showEdit} onHide={handleEditClose}>
            <Modal.Header className="TituloProductosNuevos" closeButton>
                    <Modal.Title>Editar Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >
                    Generando Pedidos
                    <Table id="tablaProductos" striped bordered hover className="tablaProductos numpedi table table-bordered border border-secondary">
                        <thead className="headersTAble">
                            <tr id="topOfDataPedido" style={{ alignItems: 'center' }}>
                                <th colSpan={2}>Cliente:</th>
                                <th id="labelCliente" colSpan={2}>
                                    <select id="select2" onChange={buscarTarima} name="proveedores">
                                        <option key={'0.0'} value={`${dataDelate[Object.keys(dataDelate)] != undefined ? dataDelate[Object.keys(dataDelate)]['cliente'] : ''}`}>`${dataDelate[Object.keys(dataDelate)] != undefined ? dataDelate[Object.keys(dataDelate)]['cliente'] : ''}`</option>
                                        {Object.keys(clientes[0]).map((fila, indice) =>
                                            < option key={indice} value={fila}>{fila}</option>
                                        )}
                                    </select >
                                </th>
                                <th colSpan={1} >Tarima:</th>
                                <th colSpan={2} >

                                    <select id="select2" onChange={SeSeleccionoTarima} name="proveedores">
                                        <option key={'0.0'} value={'Tarima'}>Tarimas</option>
                                        {tarimaFiltro.map((fila, indice) =>
                                            < option key={indice} value={fila}>{`${clienteSeleccionado.substring(0, 2)} ${fila}`}</option>
                                        )}
                                    </select >
                                </th>
                                <th style={{ textAlign: 'center' }} >
                                    <label> Demanda</label>
                                    <input className="inputEditar" onChange={onChangeCantidad} required type="number" min={1} max={100000} />
                                </th>

                                <th style={{ textAlign: 'center' }}>
                                    <label>Fecha de entrega</label>
                                    <input className="inputEditar" required type="date" />
                                </th>

                                <th colSpan={2}>
                                    <button id="generarBotton" onClick={() => presupuestar()} >Generar</button>
                                </th>
                            </tr>

                            <tr id="subHeader" >
                                <th colSpan={5}>Datos de la Tarima</th>
                                <th colSpan={8} >Datos del Pedido</th>
                            </tr>
                            <tr id="subHeader">

                                <th >No Tarima</th>
                                <th>Material</th>
                                <th>Dimensión</th>
                                <th>Precio</th>
                                <th>Qty</th>
                                <th>TotalPiezas</th>
                                <th>Pie Tabla</th>
                                <th>Total Pies</th>
                                <th>Stock Piezas</th>
                                <th>Piezas x Pedir</th>
                                <th>Proveedor</th>


                            </tr>
                        </thead>

                        <tbody className="bodyTable">
                            {
                                datosFiltrados.map(fila =>
                                    <tr>
                                        <th>{fila['Tarima']}</th>
                                        <th>{fila['Material']}</th>
                                        <th>{fila['Dimension']}</th>
                                        <th>${fila['Precio']}</th>
                                        <th>{fila['CantidadPorMaterial']}</th>
                                        <th>{fila['TotalPiezas']}</th>
                                        <th>{fila['PieTabla']}</th>
                                        <th>{fila['TotalPies']}</th>
                                        <th style={fila['StockPiezas'] < 5 ? { color: 'red' } : { color: 'black' }} >{fila['StockPiezas']}</th>
                                        <th style={fila['Piezas a pedir'] > 0 ? { color: 'red' } : { color: 'black' }} >{fila['Piezas a pedir']}</th>
                                        <th>{fila['Proveedor']}</th>
                                    </tr>
                                )
                            }

                            <tr >
                                <th colSpan={2}  >Costo de Stock</th>
                                <th colSpan={1} style={{ color: 'green' }}>${costoStock}</th>
                                <th colSpan={2} >Costo de materiales a comprar</th>
                                <th colSpan={2} style={{ color: 'green' }}>${costoMaterial}</th>
                                <th colSpan={2} >Total de Costo</th>
                                <th colSpan={2} style={{ color: 'green' }}>${TotalCosto}</th>
                            </tr>

                        </tbody>

                    </Table>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={SubirPedido} >
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>


            <div className="contenedorPedidos">
                <div className="top">
                    <p className="tituloPedidos">Pedidos</p>
                    <Toaster position="top-right" richColors />
                    <button className="botonPedidos" onClick={handleShow}>Nuevo Pedido</button>
                    <div id="buscarPedido" className="group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input placeholder="Search" type="search" className="input" />
                    </div>
                </div>
                <br />
                {
                    pedidos.map(fila =>
                        <Table id="tablaProductos" striped bordered hover className="tablaProductos numpedi table table-bordered border border-secondary">
                            <thead className="headersTAble">
                                <tr id="topOfDataPedido">
                                    <th>Num.</th>
                                    <th style={{ opacity: .8, textAlign: 'center' }}>{Object.keys(fila)[0]}</th>
                                    <th>Cliente:</th>
                                    <th style={{ opacity: .8, textAlign: 'center' }} colSpan={2}>{fila[Object.keys(fila)[0]]['cliente']}</th>
                                    <th colSpan={1} >Demanda:</th>
                                    <th style={{ opacity: .8, textAlign: 'center' }}>{fila[Object.keys(fila)[0]]['Demanda']}</th>
                                    <th>Suma Pies:</th>
                                    <th colSpan={2} style={{ opacity: .8, textAlign: 'center', color: '#1F618D' }}>{fila[Object.keys(fila)[0]]['SumaPies']}ft³</th>
                                    <th colSpan={1}>
                                        <div className="accionAtomar" >
                                            <button id="editarButton" className="material-symbols-outlined" ><span > edit </span></button>
                                            <button id="cancelarButton" onClick={() => handleShowDelate(fila)} >X</button>
                                        </div>
                                    </th>
                                </tr>

                                <tr id="subHeader" >
                                    <th colSpan={5}>Datos de la Tarima</th>
                                    <th colSpan={8} >Datos del Pedido</th>
                                </tr>
                                <tr id="subHeader">
                                    <th >No Tarima</th>
                                    <th>Material</th>
                                    <th>Dimensión</th>
                                    <th>Precio</th>
                                    <th>Qty</th>
                                    <th>TotalPiezas</th>
                                    <th>Pie Tabla</th>
                                    <th>Total Pies</th>
                                    <th>Stock Piezas</th>
                                    <th>Piezas x Pedir</th>
                                    <th>Proveedor</th>
                                </tr>
                            </thead>
                            <tbody className="bodyTable">
                                {
                                    fila[Object.keys(fila)[0]]['pedido'].map(fila =>
                                        <tr>
                                            <th>{fila['Tarima']}</th>
                                            <th>{fila['Material']}</th>
                                            <th>{fila['Dimension']}</th>
                                            <th style={{ color: 'green' }} >${fila['Precio']}</th>
                                            <th>{fila['CantidadPorMaterial']}</th>
                                            <th>{fila['TotalPiezas']}</th>
                                            <th style={{ color: '#1F618D' }} >{fila['PieTabla']}</th>
                                            <th style={{ color: '#1F618D' }} >{fila['TotalPies']}</th>
                                            <th>{fila['StockPiezas']}</th>
                                            <th style={fila['Piezas a pedir'] != 0 ? { color: 'red' } : { color: 'black' }} >{fila['Piezas a pedir']}</th>
                                            <th>{fila['Proveedor']}</th>
                                        </tr>
                                    )
                                }

                                <tr >
                                    <th colSpan={2}  >Costo de Stock</th>
                                    <th colSpan={1} style={{ color: 'green' }}>${fila[Object.keys(fila)[0]]['costoStock']}</th>
                                    <th colSpan={2} >Costo de materiales a comprar</th>
                                    <th colSpan={2} style={{ color: 'green' }}>${fila[Object.keys(fila)[0]]['costoMaterial']}</th>
                                    <th colSpan={2} >Total de Costo</th>
                                    <th colSpan={2} style={{ color: 'green' }}>${fila[Object.keys(fila)[0]]['TotalCosto']}</th>
                                </tr>
                            </tbody>

                        </Table>

                    )
                }
            </div>

        </>
    );
}
export default Pedidos;