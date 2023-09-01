import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, doc, getDoc, where, setDoc, getDocs, getFirestore, collection, deleteDoc, documentId, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';
import { Toaster, toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import PTCImage from '../asserts/images/PTC.jpg';

function Pedidos(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [dataDelate, setDataDelate] = useState(false);
    const [rol, setRol] = useState('');
    const [today, setToday] = useState(new Date);

    const [showDelate, setShowDelate] = useState(false);
    let countRow =0;

    async function handleShowDelate(allData) {
        let id = Object.keys(allData)[0]
        setStatus(allData[id]["estado"] = allData[id]["estado"] === undefined ? "pendiente" : allData[id]["estado"]);
        console.log("El valor es:   ", allData[id]);

        let data = allData[id].pedido
        let pedidos = Object.keys(data)

        console.log(data)
        const updatedSelectedRows = [];
        for (let item = 0; item < data.length; item++) {
            await cargar(item, data[item]['estado']);
            updatedSelectedRows.push(item);
        }

        console.log(updatedSelectedRows);
        console.log(selectedRows);

        setShowDelate(true);
        setDataDelate(allData);

    };
    const handleCloseDelate = async (indiceDocumento) => {
        try {
            console.log("Cerrado");
        } catch {
            console.log("Error");
        }
        setShowDelate(false);
    }

    const handleCloseGuardar = async (indiceDocumento) => {
        try {
            const documentoRef = doc(db, "Pedidos", indiceDocumento);
            await updateDoc(documentoRef, {
                estado: status
            });

            //pendiente
            actualizarPedido(indiceDocumento)
            console.log('Documento creado o actualizado con éxito.', status);
        } catch {
            console.log("Error");
        }
        setShowDelate(false);
    }



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
                'estado': status,
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


    //Estado de pedido
    const [status, setStatus] = useState('pendiente');
    const handleStatusChange = (event) => {
        setStatus(event.target.value)


    };
    useEffect(() => {


        // if (status == 'devuelto' && selectedRows.length !== 0) {
        //     setStatus('devuelto')
        // }
        // if (status == 'devuelto' && selectedRows.length === 0) {
        //     setStatus('realizado')
        // }


        if (status !== 'devuelto' && selectedRows.length !== 0) {
            handleSelectAll({ target: { checked: false } })
        }

        if (status == 'devuelto' && selectedRows.length == 0) {
            handleSelectAll({ target: { checked: true } })
            // alert("holis")
        }

    }, [status]);

    const generatePDF = () => {
        const fechaHoraActual = new Date();
        const fecha = fechaHoraActual.toLocaleDateString().replaceAll('/', '-');
        const hora = fechaHoraActual.toLocaleTimeString().replaceAll(':', '-');

        // Crear el nombre de archivo con fecha y hora
        const opt = {
            margin: 10,
            filename: `reporte_pedidos ${fecha} ${hora}.pdf`,
            image: { type: 'png', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            header: {
                height: '10mm', // Altura del encabezado
                contents: "<h1 style='text-align: center;'>Hola Mundo</h1>"
            }
        };

        const element = document.getElementById('pdf-container');
        const table = document.querySelector('.numpedi');
        table.style.width = '100%'; // Ajustar el ancho de la tabla al 100%
        table.style.tableLayout = 'fixed'; // Ajustar el layout de la tabla

        html2pdf().set(opt).from(element).save();
    };


    // const [selectAll, setSelectAll] = useState(false);
    // const [selectedRows, setSelectedRows] = useState([]);

    // const handleSelectAll = (event) => {
    //     const checkbox = event.target;

    //     if (checkbox.checked) {
    //         alert("Seleccion de todos")
    //         setSelectAll(true)
    //     } else {
    //         setSelectAll(false)
    //         alert("Se quita el check")
    //         // El checkbox se ha desmarcado
    //         // Realizar otras acciones aquí
    //     }
    // };

    const handleSelectRow = (row) => {
    };

    // async function test(indiceDocumento) {
    //     // console.log("Filas seleccionadas: ",selectedRows)
    //     // actualizarPedido(indiceDocumento)

    //     const pedidoData = {
    //         "Demanda": "33",
    //         "SumaPies": "1468.02",
    //         "Tarima": "46 x 63 T",
    //         "TotalCosto": "43147.50",
    //         "cliente": "JAYCOM",
    //         "costoMaterial": "32140.00",
    //         "costoStock": "11007.50",
    //         "estado": "proceso",
    //         "fecha": "17/7/2023",
    //         "pedido": [
    //             {
    //                 "CantidadDeTarimas": "33",
    //                 "CantidadPorMaterial": "11",
    //                 "Cliente": "JAYCOM",
    //                 "Dimension": "5/8 x 3 1/4 x 46",
    //                 "InversionDeStock": "4000",
    //                 "InversionPorMaterial": "14150",
    //                 "Material": "TABLA ",
    //                 "PieTabla": "0.6488",
    //                 "Piezas a pedir": "283",
    //                 "Precio": "50",
    //                 "Proveedor": "TriPlaynet",
    //                 "StockPiezas": "80",
    //                 "Tarima": "46 x 63 T",
    //                 "TotalDeInversion": "18150",
    //                 "TotalPies": "235.5144",
    //                 "TotalPiezas": "363"
    //             },
    //             {
    //                 "CantidadDeTarimas": "33",
    //                 "CantidadPorMaterial": "8",
    //                 "Cliente": "JAYCOM",
    //                 "Dimension": "5/8 x 3 1/4 x 63 ",
    //                 "InversionDeStock": "3200",
    //                 "InversionPorMaterial": "7360",
    //                 "Material": "TABLA",
    //                 "PieTabla": "0.8886",
    //                 "Piezas a pedir": "184",
    //                 "Precio": "40",
    //                 "Proveedor": "TresMaderas",
    //                 "StockPiezas": "80",
    //                 "Tarima": "46 x 63 T",
    //                 "TotalDeInversion": "10560",
    //                 "TotalPies": "234.5904",
    //                 "TotalPiezas": "264"
    //             },
    //             {
    //                 "CantidadDeTarimas": "33",
    //                 "CantidadPorMaterial": "10",
    //                 "Cliente": "JAYCOM",
    //                 "Dimension": "5/8 x 3 1/4 x 57",
    //                 "InversionDeStock": "1435",
    //                 "InversionPorMaterial": "5330",
    //                 "Material": "TABLA ",
    //                 "PieTabla": "0.804",
    //                 "Piezas a pedir": "260",
    //                 "Precio": "20.5",
    //                 "Proveedor": "TresMaderas",
    //                 "StockPiezas": "70",
    //                 "Tarima": "46 x 63 T",
    //                 "TotalDeInversion": "6765",
    //                 "TotalPies": "265.32",
    //                 "TotalPiezas": "330"
    //             },
    //             {
    //                 "CantidadDeTarimas": "33",
    //                 "CantidadPorMaterial": "9",
    //                 "Cliente": "JAYCOM",
    //                 "Dimension": "3 x 3 x 5",
    //                 "InversionDeStock": "640",
    //                 "InversionPorMaterial": "5300",
    //                 "Material": "TACON",
    //                 "PieTabla": "1.3",
    //                 "Piezas a pedir": "265",
    //                 "Precio": "20",
    //                 "Proveedor": "WoodenUno",
    //                 "StockPiezas": "32",
    //                 "Tarima": "46 x 63 T",
    //                 "TotalDeInversion": "5940",
    //                 "TotalPies": "386.1",
    //                 "TotalPiezas": "297"
    //             },
    //             {
    //                 "CantidadDeTarimas": "33",
    //                 "CantidadPorMaterial": "105",
    //                 "Cliente": "JAYCOM",
    //                 "Dimension": "2\" CAL 92\"",
    //                 "InversionDeStock": "1732.5",
    //                 "InversionPorMaterial": "0",
    //                 "Material": "CLAVO",
    //                 "PieTabla": "0.1",
    //                 "Piezas a pedir": "0",
    //                 "Precio": "0.5",
    //                 "Proveedor": "TresMaderas",
    //                 "StockPiezas": "8000",
    //                 "Tarima": "46 x 63 T",
    //                 "TotalDeInversion": "1732.5",
    //                 "TotalPies": "346.5",
    //                 "TotalPiezas": "3465"
    //             }
    //         ]
    //     };

    //     try {
    //         const pedidoRef = doc(db, "Pedidos", "2"); // Referencia al documento con ID 2
    //         await setDoc(pedidoRef, pedidoData); // Agregar el documento con los datos
    //         console.log("Pedido agregado exitosamente a Firebase.");
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // }

    // function handleCheckboxChange(event, fila, item) {
    //     const checkbox = event.target;
    //     console.log("Fila: ", fila);
    //     console.log("Item: ", item);

    //     if (checkbox.checked) {
    //         selectedRows.push(fila);
    //     } else {
    //         const index = selectedRows.indexOf(fila);
    //         if (index !== -1) {
    //             selectedRows.splice(index, 1);
    //         }
    //     }
    // }






    // async function actualizarPedido(idPedido, idsSubpedidos) {
    async function actualizarPedido(indiceDocumento) {
        const idsSubpedidos = selectedRows; // IDs de subpedidos a actualizar
        try {
            const pedidoRef = doc(db, "Pedidos", String(indiceDocumento));
            const pedidoSnapshot = await getDoc(pedidoRef); // Utiliza getDoc para obtener un documento individual
            if (pedidoSnapshot.exists()) {
                const pedidoData = pedidoSnapshot.data();
                //console.log("flag 1",pedidoData.estado)
                // Verificar que el número de idsSubpedidos sea igual al número de subpedidos en el doc
                console.log(`flag 2: idsSubpedidos - ${idsSubpedidos} - Object.keys(pedidoData.pedido).length - ${Object.keys(pedidoData.pedido).length}`);
                if (idsSubpedidos.length <= Object.keys(pedidoData.pedido).length && idsSubpedidos.length >= 0) {
                    // if (status === 'devuelto'){
                    //     for (const idSubpedido of idsSubpedidos) {
                    //         console.log(!pedidoData.pedido[idSubpedido])
                    //         pedidoData.pedido[idSubpedido].estado= true ;
                    //         // if (!pedidoData.pedido[idSubpedido]) {
                    //         //     pedidoData.pedido[idSubpedido] = { estado: false }; // Crear y poner en false si no existe
                    //         // } else {
                    //         //     pedidoData.pedido[idSubpedido].estado = !pedidoData.pedido[idSubpedido].estado;  // Cambiar estado
                    //         // }
                    //     }
                    // }
                    console.log(status !== 'devuelto')
                    if (status !== 'devuelto') {
                        console.log(pedidoData.pedido)
                        pedidoData.pedido.map((pedido, id) => {
                            console.log(`${pedido} -> ${id}`)
                            if (!selectedRows.includes(id)) {
                                console.log(`Se debe actualizar: ${id}`)
                                pedido.estado = false
                            } else {
                                console.log(`No se debe actualizar: ${id}`)
                            }
                        })
                    } else {
                        pedidoData.pedido.map((pedido, id) => {
                            console.log(`${pedido} -> ${id}`)
                            if (selectedRows.includes(id)) {
                                console.log(`Se debe actualizar en true: ${id}`)
                                pedidoData.pedido[id].estado = true;  // Cambiar estado
                            } else {
                                pedidoData.pedido[id].estado = false;
                            }
                        })

                    }

                    await updateDoc(pedidoRef, pedidoData);
                    console.log("Pedido actualizado exitosamente.");
                } else {
                    console.log("La cantidad de subpedidos no coincide.");
                }
            } else {
                console.log("Pedido no encontrado.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }



    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [updateSelectedRows, setUpdateSelectedRows] = useState([]);

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        // if (isChecked){
        //     setStatus('devuelto')
        // }
        // if (!isChecked){
        //     setStatus('realizado')
        // }
        setSelectAll(isChecked);

        const updatedSelectedRows = isChecked ? dataDelate[Object.keys(dataDelate)]['pedido'].map((fila, item) => item) : [];
        setSelectedRows(updatedSelectedRows);
    };

    const handleCheckboxChange = (event, item) => {
        const isChecked = event.target.checked;
        const updatedSelectedRows = [...selectedRows];
        console.log("al iniciar: ", selectedRows.length)
        if (isChecked) {
            updatedSelectedRows.push(item);
            setSelectedRows(updatedSelectedRows);
            setStatus('devuelto')
        } else {
            const index = updatedSelectedRows.indexOf(item);
            if (index !== -1) {
                updatedSelectedRows.splice(index, 1);
                setSelectedRows(updatedSelectedRows);
            }
        }


        // if (status == 'devuelto' && selectedRows.length === 0) {
        //     setStatus('realizado')
        // }
        console.log("al terminar: ", selectedRows.length)
    };

    async function cargar(fila, valor) {
        console.log(fila, " -> ", valor)
        if (valor) {
            await setSelectedRows(prevSelectedRows => [...prevSelectedRows, fila]);
        } else {
            console.log("No se actualizo: ", valor);
        }
    }


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
                                <th colSpan={5} >Datos del Pedido</th>
                                <th colSpan={3} >Estado</th>
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

                                <th>Devolver</th>
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
                <Modal.Header className="TituloEditar" closeButton>
                    <Modal.Title>Editar Pedido</Modal.Title>
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
                                {/* <th style={{ textAlign: 'center' }}>
                                    <label>Estado</label>
                                    <label >{`${dataDelate[Object.keys(dataDelate)] && dataDelate[Object.keys(dataDelate)]['estado'] !== undefined ? dataDelate[Object.keys(dataDelate)]['estado'] : status}`}</label>
                                </th> */}
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
                                <th>Devolver</th>
                            </tr>
                        </thead>

                        <tbody className="bodyTable">
                            {
                                dataDelate[Object.keys(dataDelate)] != undefined ?
                                    dataDelate[Object.keys(dataDelate)]['pedido'].map((fila, item) =>
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
                                            {/* <th>{String(fila['estado'])}</th> */}
                                            {/* {cargar(item, fila['estado'])} */}
                                            <input
                                                type="checkbox"
                                                onChange={(event) => handleCheckboxChange(event, item, fila['estado'])}
                                                checked={selectedRows.includes(item)}
                                            />
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
                                <th colSpan={3} style={{ color: 'green' }}>${TotalCosto}</th>
                                {/* <th colSpan={2}>Seleccionar Todo
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectAll}
                                    />
                                </th> */}
                            </tr>

                        </tbody>

                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <label htmlFor="statusSelect">Estado:</label>
                    <select id="statusSelect" value={status} onChange={handleStatusChange}>
                        <option value="realizado">Realizado</option>
                        <option value="proceso">En Proceso</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="devuelto">Devuelto</option>
                    </select>
                    {/* <Button variant="secondary" onClick={() => handleCloseDelate(`${Object.keys(dataDelate)}` !== undefined ? `${Object.keys(dataDelate)}` : 'pendiente')}  ></Button> */}
                    {/* <Button variant="danger" onClick={() => test(Object.keys(dataDelate))}  >
                        Test
                    </Button> */}
                    <Button variant="danger" onClick={() => EliminarPedido(`${Object.keys(dataDelate)}`)}  >
                        Eliminar
                    </Button>
                    <Button variant="primary" onClick={() => handleCloseGuardar(`${Object.keys(dataDelate)}`)}  >
                        Guardar
                    </Button>
                    <Button variant="secondary" onClick={() => handleCloseDelate(`${Object.keys(dataDelate)}`)}  >
                        Cancelar
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
                                        <th>new</th>
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
                                    {/* <th>Estado</th>
                                    <th style={{ opacity: .8, textAlign: 'center' }}>{fila[Object.keys(fila)[0]]['estado']}</th> */}
                                    <th>Cliente:</th>
                                    <th style={{ opacity: .8, textAlign: 'center' }} colSpan={2}>{fila[Object.keys(fila)[0]]['cliente']}</th>
                                    <th colSpan={1} >Demanda:</th>
                                    <th style={{ opacity: .8, textAlign: 'center' }}>{fila[Object.keys(fila)[0]]['Demanda']}</th>
                                    <th>Suma Pies:</th>
                                    <th colSpan={2} style={{ opacity: .8, textAlign: 'center', color: '#1F618D' }}>{fila[Object.keys(fila)[0]]['SumaPies']}ft³</th>
                                    <th colSpan={1}>
                                        <div className="accionAtomar" >
                                            {/* <button id="editarButton" className="material-symbols-outlined" ><span > edit </span></button> */}
                                            <button id="editarButton" className="material-symbols-outlined" onClick={() => handleShowDelate(fila)} ><span > edit </span></button>
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

            <div className="row justify-content-center">
                <button className="btn btn-primary col-2" onClick={generatePDF}>
                    Generar PDF
                </button>
            </div>
            <br />
                <h3>Reporte de Material Necesario</h3>
            <div id="pdf-container" className="center" >
                <table striped className="table-bordered">
                    <thead className="header">
                        <tr colSpan={12}>
                            <th colSpan={1}>
                                <img src={PTCImage} className="logo-pdf" alt="PTC" />
                            </th>
                            <th colSpan={7}>

                            </th>
                            <th colSpan={4}>
                                <h6 className="center">Fecha: {today.toLocaleString()}</h6>
                            </th>
                        </tr>
                        <tr id="subHeader">
                            <th className="newTable">Material</th>
                            <th className="newTable">Dimension</th>
                            <th className="newTable" col={3}>Proveedor</th>
                            <th className="newTable" col={1}>Cantidad De Tarimas</th>
                            <th className="newTable" col={1}>Cantidad Por Material</th>
                            <th className="newTable">Precio Unitario</th>
                            <th className="newTable">Total De Piezas</th>
                            <th className="newTable">Piezas en Stock</th>
                            <th className="newTable" style={{ color: 'black', fontWeight: 'bold' }}>Total De Inversion</th>
                            <th className="newTable" style={{ color: 'black', fontWeight: 'bold' }}>Inversion De Stock</th>
                            <th className="newTable" style={{ color: 'black', fontWeight: 'bold' }}>Piezas a pedir</th>
                            <th className="newTable" style={{ color: 'black', fontWeight: 'bold' }}>Inversion De Piezas a Pedir</th>
                        </tr>
                    </thead>
                    {/* <tbody>
                       {pedidos.map((documento, index) => {
                            const pedido = Object.values(documento)[0].pedido;
                            const rows = pedido.map((subpedido, subIndex) => {
                                if (subpedido['Piezas a pedir'] > 0) {
                                    const inversionPiezasPedir = subpedido['Piezas a pedir'] * subpedido.Precio;
                                    return (
                                        <>
                                        {
                                       countRow++
                                        }
                                            <tr key={`documento-${index}-subpedido-${subIndex}`}>
                                            <td style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.Material}</td>
                                            <td style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.Dimension}</td>
                                            <td style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.Proveedor}</td>
                                            <td style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.CantidadDeTarimas}</td>
                                            <td style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.CantidadPorMaterial}</td>
                                            <td style={{ color: 'green', fontWeight: 'bold' }}>{subpedido.Precio}</td>
                                            <td style={{ color: 'CornflowerBlue', fontWeight: 'bold' }}>{subpedido.TotalPiezas}</td>
                                            <td style={{ color: 'Goldenrod', fontWeight: 'bold' }}>{subpedido.StockPiezas}</td>
                                            <td style={{ color: 'CornflowerBlue', fontWeight: 'bold' }}>{subpedido.TotalDeInversion}</td>
                                            <td style={{ color: 'Goldenrod', fontWeight: 'bold' }}>{subpedido.InversionDeStock}</td>
                                            <td style={{ color: 'Teal', fontWeight: 'bold' }}>{subpedido['Piezas a pedir']}</td>
                                            <td style={{ color: 'Crimson', fontWeight: 'bold' }}>{inversionPiezasPedir}</td>
                                        </tr>
                                        </>
                                    );
                                }
                                return null;
                            });

                            const shouldInsertEmptyRow = countRow % 7 === 0;

                            const emptyRow = shouldInsertEmptyRow ? (
                                <>
                                    <tr key={`documento-${index}-pagebreak`} className="pagebreak"></tr>
                                    <tr >hola</tr>
                                </>
                            ): null;

                            return [...rows, emptyRow];



                        })}
                    </tbody> */}
                    <tbody>
    {(() => {
        const rows = [];

        for (let index = 0; index < pedidos.length; index++) {
            const documento = pedidos[index];
            const pedido = Object.values(documento)[0].pedido;

            for (let subIndex = 0; subIndex < pedido.length; subIndex++) {
                const subpedido = pedido[subIndex];
                if (subpedido['Piezas a pedir'] > 0) {
                    const inversionPiezasPedir = subpedido['Piezas a pedir'] * subpedido.Precio;
                    countRow++;

                    rows.push(
                        <tr key={`documento-${index}-subpedido-${subIndex}`}>
                            <td className="newTable" style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.Material}</td>
                            <td className="newTable" style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.Dimension}</td>
                            <td className="newTable" style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.Proveedor}</td>
                            <td className="newTable" style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.CantidadDeTarimas}</td>
                            <td className="newTable" style={{ color: 'dark', fontWeight: 'bold' }}>{subpedido.CantidadPorMaterial}</td>
                            <td className="newTable" style={{ color: 'green', fontWeight: 'bold' }}>{subpedido.Precio}</td>
                            <td className="newTable" style={{ color: 'CornflowerBlue', fontWeight: 'bold' }}>{subpedido.TotalPiezas}</td>
                            <td className="newTable" style={{ color: 'Goldenrod', fontWeight: 'bold' }}>{subpedido.StockPiezas}</td>
                            <td className="newTable" style={{ color: 'CornflowerBlue', fontWeight: 'bold' }}>{subpedido.TotalDeInversion}</td>
                            <td className="newTable" style={{ color: 'Goldenrod', fontWeight: 'bold' }}>{subpedido.InversionDeStock}</td>
                            <td className="newTable" style={{ color: 'Teal', fontWeight: 'bold' }}>{subpedido['Piezas a pedir']}</td>
                            <td className="newTable" style={{ color: 'Crimson', fontWeight: 'bold' }}>{inversionPiezasPedir}</td>
                        </tr>
                    );
                    const shouldInsertEmptyRow = countRow % 10 === 0;
                    console.log("Console",countRow)
        
                    if (shouldInsertEmptyRow) {
                        rows.push(
                            <tr key={`documento-${index}-pagebreak`} className="pagebreak"></tr>
                        );
                        countRow=0;
                    }
                }
            }

        }

        return rows;
    })()}
</tbody>

                </table>

            </div>

        </>
    );
}
export default Pedidos;