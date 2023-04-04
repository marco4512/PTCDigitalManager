import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, deleteDoc, doc, getFirestore, collection, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Clientes(props) {
    const [tempTarima, setTempTarima] = useState([]);
    const [dataFilter, setDataFilter] = useState([])
    const [dimension, setDimension] = useState();
    const [material, setMaterial] = useState('vacio');
    const [nombre, setNombre] = useState();
    const [cantidad, setCantidad] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [show2, setShow2] = useState(false);
    const handleClose2 = () => setShow2(false);
    const handleShow2 = () => setShow2(true);
    const [show3, setShow3] = useState(false);
    const handleClose3 = () => setShow3(false);
    const handleShow3 = () => setShow3(true);
    const [show4, setShow4] = useState(false);
    const handleClose4 = () => setShow4(false);
    const handleShow4 = () => setShow4(true);
    const [show5, setShow5] = useState(false);
    const handleClose5 = () => setShow5(false);
    const handleShow5 = () => setShow5(true);
    const [dataOf, setDataOf] = useState([]);
    const [antesEliminar, setAntesEliminar] = useState([]);
    const [indexTem, setIndexTem] = useState();
    const navigate = useNavigate();
    const [email, setEmail] = useState(false);
    const [primera_vez, setPrimera_vez] = useState(false);
    const [productos, setProductos] = useState([]);
    var filaVacia = [{
        'Select': '',
        'Cantidad': ''
    }]
    const [productosAgregar, setProductosAgregar] = useState(filaVacia)
    var containerPrincial = document.getElementById('containerPrincial');
    var db = getFirestore();
    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
    const inventarioRef = collection(db, "Inventario");
    function Navegar(lugar) {
        navigate(`/${lugar}`)
    }

    function onChangeEditar(event) {
        let etiqueta = event.target.name;
        switch (etiqueta) {
            case 'dimension':
                setDimension(event.target.value);
                break
            case 'nombre':
                setNombre(event.target.value);
                break
            case 'cantidad':
                if ((/^[0-9]*$/.test(event.target.value)) && String(event.target.value).length < 6) {
                    setCantidad(event.target.value);
                }
                break
            default:
                break;
        }
    }
    function AñadirFila() {
        let nuevaData = filaVacia[0]
        setProductosAgregar([...productosAgregar, nuevaData])
    }

    useEffect(() => {
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                containerPrincial.style.display = 'none';
                navigate('/login')
            }
            else {
                setEmail(usuarioFirebase.email);
                ObtenerNav(usuarioFirebase.email)
                ExtraerTarimas().then(x => x)
                console.log('vacio->', allTarimas)
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
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    async function UpdateInventario() {
        let salida = [];
        productosAgregar.map(function (fila) {
            let DataProduct = productos[fila['Select']]['data']
            let data = {
                Dimension: DataProduct['Dimension'],
                Nombre: DataProduct['Nombre'],
                Cantidad: fila['Cantidad']
            }
            salida.push(data);
            //const docRef = doc(db, "Tarimas", nombreTarimados, 'Construccion',fila['Select']);
            const docRef = doc(db, "Tarimas", nombreTarimados)
            setDoc(docRef, {}).then(function (x) {
                handleClose3()
                const docRef2 = doc(db, "Tarimas", nombreTarimados, 'Construccion', fila['Select']);
                setDoc(docRef2, data).then(x => x)
            }
            )

        })
        let auxData = dataFilter;
        let newIndex = dataFilter.length
        let formato = {}
        formato[nombreTarimados] = salida
        auxData[newIndex] = formato;
        console.log(auxData)

    }

    const [allTarimas, setAllTarimas] = useState([]);

    async function ExtraerTarimas() {
        const subColRef = collection(db, "Clientes");
        const querySnapshot = await getDocs(subColRef)
        let nombres = [];
        let AllTarimas = [];
        let salidaFormateado = {};
        querySnapshot.forEach((doc) => {
            nombres.push(doc.id)
            Object.keys(doc.data()).map(function (key) {
                salidaFormateado[doc.id] = []
                if (doc.data()[key]) {
                    AllTarimas.push([key, doc.id])
                }
            })
        })
        AllTarimas.map(fila => salidaFormateado[fila[1]].push(fila[0]))
        setAllTarimas([salidaFormateado])
        console.log(allTarimas)


    }
    async function ExtraerProductos() {
        const querySnapshot = await getDocs(collection(db, "Inventario"));
        let alldata = []
        querySnapshot.forEach((doc) => {
            if (doc.data()['Estatus']) {
                let data = {
                    'id': doc.id,
                    'data': doc.data()
                }
                alldata.push(data)

            }

        });
        setProductos(alldata)
    }
    const[TarimaAEliminar,setTarimaAEliminar]=useState('')
    const[indiceTarimaTemp,setIndiceTarimaTemp]= useState('')
    const[temporalAllCliente,setTemporalAllCliente]= useState('')

    async function eliminarTarima(data, bandera, indice) {
        if (bandera) {
            console.log(data,indice) 
            setTemporalAllCliente(data)
            setTarimaAEliminar(allTarimas[0][data][indice])
            setIndiceTarimaTemp(indice)
            handleShow()
        } else {
            const docRef = doc(db, "Clientes",temporalAllCliente)
            let newData={}
            newData[TarimaAEliminar]=false
            updateDoc(docRef, newData).then(docRef => {
                ExtraerTarimas().then(x=>handleClose())
               
            }).catch(error => {
                console.log(error);
            })
      
            

           
        }
    }
    const [nombreTarimaTemp, setNombreTarimaTemp] = useState('')
    async function eliminarMejorado(data, bandera, indice) {
        if (bandera) {
            setIndexTem(indice)
            console.log(indice, data)
            setNombreTarimaTemp(Object.keys(data)[0])
            setDataOf(data[Object.keys(data)[0]][indice])
            handleShow()
        } else {
            console.log("Tarimas", nombreTarimaTemp, 'Construccion', indexTem)
            let indiceTarima;
            dataFilter.map(function (fila, indice) {
                if (fila[nombreTarimaTemp] != undefined) {
                    indiceTarima = indice;
                }
            })
            const docRef = doc(db, "Tarimas", nombreTarimaTemp, 'Construccion', indexTem);
            deleteDoc(docRef).then(function (fila) {
                let nuevo = { ...dataFilter[indiceTarima][nombreTarimaTemp] }
                delete nuevo[indexTem]
                let newData = dataFilter;
                newData[indiceTarima][nombreTarimaTemp] = nuevo
                handleClose()
            }
            )
        }
    }
    const [tarimaAUX, setTarimaAUX] = useState('')
    const [indiceDeTarima2, setIndiceDeTarima] = useState('')

    async function agregarProducto(bandera, indice, indiceDeTarima) {
        if (bandera) {
            console.log(indiceDeTarima)
            setIndiceDeTarima(indiceDeTarima)
            setMaterial('vacio')
            handleShow5()
            setTarimaAUX(indice[0])
        } else {
            if (material == 'vacio' || cantidad == undefined) {
                handleClose5()
            } else {
                let DataAsubir = {
                    Dimension: productos[material]['data']['Dimension'],
                    Nombre: productos[material]['data']['Nombre'],
                    Cantidad: cantidad
                }
                const docRef = doc(db, "Tarimas", tarimaAUX, 'Construccion', productos[material]['id']);
                setDoc(docRef, DataAsubir).then(function (x) {
                    let data = dataFilter;
                    let auxTemp = data[indiceDeTarima2][tarimaAUX]
                    auxTemp[productos[material]['id']] = DataAsubir
                    data[indiceDeTarima2][tarimaAUX] = auxTemp
                    setDataFilter(data)
                    handleClose5()
                }
                )
            }

        }
    }
    let [nonbretem, setNonbretem] = useState('');
    let [secondIndex, setSecondIndex] = useState('');
    async function editarProductoMejorado(data, bandera, indice, indiceTari) {
        // let aux = filteredData;
        if (bandera) {
            setSecondIndex(indiceTari)
            console.log(data, indiceTari)
            setNonbretem(Object.keys(data)[0])
            setIndexTem(indice)
            setDataOf(data[Object.keys(data)[0]][indice])
            setDimension(data[Object.keys(data)[0]][indice]['Dimension'])
            setNombre(data[Object.keys(data)[0]][indice]['Nombre'])
            setCantidad(data[Object.keys(data)[0]][indice]['Cantidad'])
            handleShow2()

        } else {
            //console.log(data,indexTem,nonbretem)
            if (data['Dimension'] == dimension && data['Nombre'] == nombre && data['Cantidad'] == cantidad) {
                // Cambian Nada
                console.log('Nada Actualizado')
            } else {
                var SoloCantidad = {
                    Cantidad: cantidad
                }
                var Material = {
                    Nombre: nombre,
                    Dimension: dimension
                }

                if (data['Cantidad'] != cantidad && data['Nombre'] == nombre && data['Dimension'] == dimension) {
                    // solo la cantidad cambio
                    const docRef = doc(db, "Tarimas", nonbretem, 'Construccion', indexTem);
                    updateDoc(docRef, SoloCantidad).then(docRef => {
                        dataFilter[secondIndex][nonbretem][indexTem]['Cantidad'] = cantidad
                        handleClose2()
                    }).catch(error => {
                        console.log(error);
                    })

                }
                if (data['Cantidad'] == cantidad && (data['Nombre'] != nombre || data['Dimension'] != dimension)) {
                    // Cambia SOlo material
                    const docRef2 = doc(db, "Inventario", indexTem);
                    updateDoc(docRef2, Material).then(docRef => {
                        dataFilter[secondIndex][nonbretem][indexTem]['Dimension'] = dimension
                        dataFilter[secondIndex][nonbretem][indexTem]['Nombre'] = nombre
                        handleClose2()
                    }).catch(error => {
                        console.log(error);
                    })
                    const docRef3 = doc(db, "Tarimas", nonbretem, 'Construccion', indexTem);
                    updateDoc(docRef3, Material).then(docRef => {
                    }).catch(error => {
                        console.log(error);
                    })


                }
                if (data['Dimension'] != dimension && data['Nombre'] != nombre && data['Cantidad'] != cantidad) {
                    // Todo
                    // Cambia SOlo material
                    const docRef4 = doc(db, "Inventario", indexTem);
                    updateDoc(docRef4, Material).then(docRef => {
                        dataFilter[secondIndex][nonbretem][indexTem]['Dimension'] = dimension
                        dataFilter[secondIndex][nonbretem][indexTem]['Nombre'] = nombre
                        dataFilter[secondIndex][nonbretem][indexTem]['Cantidad'] = cantidad
                        handleClose2()
                    }).catch(error => {
                        console.log(error);
                    })
                    let todo = {
                        Cantidad: cantidad,
                        Nombre: nombre,
                        Dimension: dimension
                    }
                    const docRef5 = doc(db, "Tarimas", nonbretem, 'Construccion', indexTem);
                    updateDoc(docRef5, todo).then(docRef => {
                    }).catch(error => {
                        console.log(error);
                    })



                }

            }

        }

    }
    function eliminarFila(index, data) {
        handleClose3();
        data.splice(index, 1)
        setProductosAgregar(data)
        const timer = setTimeout(() => {
            handleShow3();
        }, .1);
    }

    function onChangeDimension(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        //console.log(productosAgregar)
        productosAgregar[indice]['Dimension'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeMaterial(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Material'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    const [nombreTarimados, setNombreTarimados] = useState('')
    function onChangeNombreTarima(event) {
        let valor = event.target.value;
        setNombreTarimados(valor)
    }
    function onChangeCantidad(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        productosAgregar[indice]['Cantidad'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeSelctTow(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        productosAgregar[indice]['Select'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeVolumen(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Volumen'] = valor;
        setProductosAgregar([...productosAgregar])
    }

    function onChangeSelect(event) {
        let valor = event.target.value;
        setMaterial(valor)
    }
    const filteredData = []
    const filteredData2 = allTarimas.filter((key) => Object.keys(key).includes(searchTerm.toLocaleUpperCase().trim().replaceAll(' ', '')) || searchTerm.length == 0);

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Tarima</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >¿Estas Seguro que quieres eliminar esta Tarima?
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                <tr className="centrarfila">
                                    <td key={1} >{TarimaAEliminar}</td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { eliminarTarima(TarimaAEliminar, false)} }>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <div id="NavTemporal" className="NavTemporal">
                <button onClick={() => Navegar('stock')} id="inventarioNav" className="buttonOpcion2">Inventario</button>
                <button onClick={() => Navegar('pedido')} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
                <button onClick={() => Navegar('productos')} id="productosNav" className="buttonOpcion2">Material</button>
                <button onClick={() => Navegar('reportes')} id="reportesNav" className="buttonOpcion2">Reportes</button>
                <button onClick={() => Navegar('principal')} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
                <button onClick={() => Navegar('proveedores')} id="prooveedores" className="buttonOpcion2">Proveedor</button>
                <button onClick={() => Navegar('tarimas')} id="tarimas" className="buttonOpcion2">Tarimas</button>
            </div>
            <div className="tituloProdi">
                <h1>Clientes</h1>

            </div>
            <div className="contenidoTotal">
                <div className="TablaCont">
                    {
                        filteredData2.map((data) =>
                            Object.keys(data).map(nombreCLiente =>
                                <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                                <thead>
                                    <tr className="nombreTarima">
                                        <th className="centarTitule" colSpan={3} >
                                            Cliente:<br />
                                            {nombreCLiente}
                                        </th>
                                        <th colSpan={2}>
                                        
                                            <div className="accionAtomar">
                                                <p>Eliminar o Agregar</p>
                                                <button id="cancelarButton" >X</button>
                                                <button id="editarButton2" className="material-symbols-outlined" ><span > add_box </span></button>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2}>Nombre</th>
                                        <th>Identificador</th>
                                        <th>Eliminar/Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                         data[nombreCLiente].map((fila,indice) =>
                                            < tr className="centrarfila">
                                                <td key={`1`} colSpan={2} >{fila}</td>
                                                <td key={`2`} >{nombreCLiente.substr(0, 2)+' '+fila}</td>
                                                <div className="accionAtomar">
                                                    <button id="cancelarButton" onClick={()=>eliminarTarima(nombreCLiente, true,indice)}>X</button>
                                                    <button id="editarButton" className="material-symbols-outlined" ><span > edit </span></button>
                                                </div>
                                            </tr>
                                        )
                                        
                                    }
                                </tbody>

                            </Table>
                            )
                        )
                    }
                </div>
                <div className="OpcionesDeProductos">
                    <p className="tituloProductoAmin">Administración de los Clientes</p>
                    <div className="group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input placeholder="Search" onChange={handleSearchChange} type="search" className="input" />
                    </div>
                    <br />
                    <br />
                    <div className="ButtonesAgregarProducto">
                        <button id="NuevoProducto" onClick={handleShow3} >Nuevo Cliente</button>
                    </div>
                </div>
            </div >

        </>
    );
}
export default Clientes;
