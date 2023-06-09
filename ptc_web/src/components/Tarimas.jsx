import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, deleteDoc, doc, getFirestore, collection, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';


function Tarimas(props) {
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
    const [productos, setProductos] = useState([]);
    const [rol, setRol] = useState('');
    var filaVacia = [{
        'Select': '',
        'Cantidad': ''
    }]
    const [productosAgregar, setProductosAgregar] = useState(filaVacia)
    var db = getFirestore();
    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
    const inventarioRef = collection(db, "Inventario");
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
                        ExtraerProductos().then(x => x)
                        ExtraerTarimas().then(x => { Spinner.style.display = 'none'; })
                    }
                })
            }

        });
    }, []);
   
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
    async function ExtraerTarimas() {
        var tarimas = []
        const subColRef = collection(db, "Tarimas");
        const querySnapshot = await getDocs(subColRef)
        querySnapshot.forEach((doc) => {
            tarimas.push(doc.id)
        })
        tarimas.map(function (tarima) {
            subColeccion(tarima)
        })
    }
    async function subColeccion(tarima) {
        var axobj = {};
        const subColRef = collection(db, "Tarimas", tarima, 'Construccion');
        const querySnapshot = await getDocs(subColRef)
        querySnapshot.forEach((doc) => {
            axobj[doc.id] = doc.data();
        })
        let salida = {};
        salida[tarima] = axobj
        //console.log('_arregloTarimas_', tempTarima, ' nombreTarima', tarima)
        if (!tempTarima.includes(tarima)) {
            tempTarima.push(tarima)
            //console.log('Entro a tarimas ', salida)
            //console.log('nuevas tarimas', tempTarima)
            setDataFilter(prev => [...prev, salida])
        }
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
    const [nT, setNT] = useState('')
    async function eliminarTarima(data, bandera, indice) {
        if (bandera) {
            let sal = {}
            setNT(Object.keys(data)[0])
            sal[Object.keys(data)[0]] = data[Object.keys(data)[0]]
            setAntesEliminar([])
            setAntesEliminar([sal])
            handleShow4()
        } else {
            let newData = [];
            dataFilter.map(function (fila) {
                if (nT != Object.keys(fila)[0]) {
                    newData.push(fila)
                }
            })
            const docRef = doc(db, "Tarimas", nT);
            deleteDoc(docRef).then(function (fila) {
                setDataFilter(newData)
                handleClose4()
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
    function onChangeSelect(event) {
        let valor = event.target.value;
        setMaterial(valor)
    }
    const filteredData = dataFilter.filter((key) => Object.keys(key)[0].toLowerCase().trim().replaceAll(' ', '').includes(searchTerm.toLowerCase().trim().replaceAll(' ', '')));
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

            <Modal show={show5} onHide={handleClose5}>
                <Modal.Header className="TituloEditar" closeButton>
                    <Modal.Title>Agregar nuevo Material</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" > Selecciona El material y agrega La cantidad
                    {
                        <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    <tr className="centrarfila">
                                        <select id="select" onChange={onChangeSelect} name="Material">
                                            <option key={'0.0'} value={'noVale'}>Selecciona uno</option>
                                            {productos.map((fila, indice) =>
                                                <option key={fila['data']['id']} value={fila['id']}>{fila['data']['Dimension'] + ' ---- ' + fila['data']['Nombre']}</option>
                                            )}
                                        </select>
                                        <td key={1} ><input className="inputEditar" required type={"number"} min={1} max={100000} onChange={onChangeEditar} pattern="[0-9]*" name='cantidad' /></td>
                                    </tr>
                                }
                            </tbody>
                        </Table>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose5}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { agregarProducto(false) }}>
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={show4} onHide={handleClose4}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Tarima</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >Estas seguro que deeseas eliminar esta tarima ?
                    {
                        Object.keys(antesEliminar).map((data, indice) =>
                            <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                                <thead>
                                    <tr className="nombreTarima">
                                        <th className="centarTitule" colSpan={3} >
                                            Nombre de la tarima <br />
                                            {Object.keys(antesEliminar[data])}

                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Dimensiones</th>
                                        <th>Cantidad</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(antesEliminar[data][Object.keys(antesEliminar[data])]).map(fila =>
                                            < tr className="centrarfila">
                                                <td key={`1`} >{antesEliminar[data][Object.keys(antesEliminar[data])][fila]['Nombre']}</td>
                                                <td key={`2`} >{antesEliminar[data][Object.keys(antesEliminar[data])][fila]['Dimension']}</td>
                                                <td key={`3`} >{antesEliminar[data][Object.keys(antesEliminar[data])][fila]['Cantidad']}</td>
                                            </tr>
                                        )
                                    }
                                </tbody>

                            </Table>
                        )
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose4}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { eliminarTarima(dataOf, false) }}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Material</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >¿Estas Seguro que quieres eliminar este Material?
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimension</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                <tr className="centrarfila">
                                    <td key={1} >{dataOf['Dimension']}</td>
                                    <td key={2} >{dataOf['Nombre']}</td>
                                    <td key={3} >{dataOf['Cantidad']}</td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { eliminarMejorado(dataOf, false) }}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal size="lg" centered show={show2} onHide={handleClose2}>
                <Modal.Header className="TituloEditar" closeButton>
                    <Modal.Title>Editar Material</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >Ingresa los nuevos campos de tu Material
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {

                                <tr className="centrarfila">
                                    <td key={1} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='dimension' value={dimension} /></td>
                                    <td key={2} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='nombre' value={nombre} /></td>
                                    <td key={3} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='cantidad' value={cantidad} /></td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose2}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { editarProductoMejorado(dataOf, false) }}>
                        GuardarCambios
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal size="xl" animation={false} centered show={show3} onHide={handleClose3}>
                <Modal.Header className="TituloProductosNuevos" closeButton>
                    <Modal.Title>Agregar Tarima</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >
                    <p className="ingresanuevosprod">Define una nueva Tarima</p>
                    <div className="tablaAgregarProductos">
                        <Table id="TBALADIRECTA" striped bordered hover className="table table-bordered border border-secondary">
                            <thead>
                                <tr className="nombreTarima">
                                    <th>Nombre Tarima: </th>
                                    <th className="centarTitule">
                                        <input type="text" onChange={onChangeNombreTarima} className="inputEditar" />
                                    </th>
                                </tr>
                                <tr>
                                    <th>Material</th>
                                    <th>Cantidad</th>
                                </tr>
                            </thead>
                            {
                                productosAgregar.map((keys, index) =>
                                    <tbody>
                                        <tr className="centrarfila">
                                            <td key={1} >
                                                <select id="select" onChange={onChangeSelctTow} name={index} value={keys['Select']} >
                                                    <option key={'0.0'} value={'noVale'}>{keys['Select']}</option>
                                                    {productos.map((fila, indice) =>
                                                        <option key={fila['data']['id']} value={fila['id']}>{fila['data']['Dimension'] + ' ---- ' + fila['data']['Nombre']}</option>
                                                    )}
                                                </select>

                                            </td>
                                            <td key={3} ><input className="inputEditar" name={index} onChange={onChangeCantidad} required type="text" value={keys['Cantidad']} /></td>

                                            <div className="accionAtomar">
                                                <button id="cancelarButton" onClick={() => eliminarFila(index, productosAgregar)} >X</button>
                                            </div>
                                        </tr>
                                    </tbody>
                                )
                            }
                        </Table>
                        <button onClick={() => AñadirFila()} className="nuevafilaButton">Agregar una nueva fila</button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose3}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { UpdateInventario() }}>
                        Registrar Productos
                    </Button>
                </Modal.Footer>
            </Modal>
             
            <div className="tituloProdi">
                <h1>Tarimas</h1>

            </div>
            <div className="contenidoTotal">
                <div className="TablaCont">
                    {
                        Object.keys(filteredData).map((data, indiceDeTarima) =>
                            <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                                <thead>
                                    <tr className="nombreTarima">
                                        <th className="centarTitule" colSpan={2} >
                                            Nombre de la tarima <br />
                                            {Object.keys(filteredData[data])}
                                        </th>
                                        <th colSpan={2}>
                                            Eliminar/Agregar
                                            <div className="accionAtomar">
                                                <button id="cancelarButton" onClick={() => eliminarTarima(filteredData[data], true, Object.keys(filteredData[data]))}>X</button>
                                                <button id="editarButton2" className="material-symbols-outlined" onClick={() => agregarProducto(true, Object.keys(filteredData[data]), data)}  ><span > add_box </span></button>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Dimensiones</th>
                                        <th>Cantidad</th>
                                        <th>Eliminar/Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(filteredData[data][Object.keys(filteredData[data])]).map((fila, indiceTari) =>
                                            < tr className="centrarfila">
                                                <td key={`1`} >{filteredData[data][Object.keys(filteredData[data])][fila]['Nombre']}</td>
                                                <td key={`2`} >{filteredData[data][Object.keys(filteredData[data])][fila]['Dimension']}</td>
                                                <td key={`3`} >{filteredData[data][Object.keys(filteredData[data])][fila]['Cantidad']}</td>
                                                <div className="accionAtomar">
                                                    <button id="cancelarButton" onClick={() => eliminarMejorado(filteredData[data], true, fila)} >X</button>
                                                    <button id="editarButton" onClick={() => editarProductoMejorado(filteredData[data], true, fila, indiceDeTarima)} className="material-symbols-outlined" ><span > edit </span></button>
                                                </div>
                                            </tr>
                                        )
                                    }
                                </tbody>

                            </Table>
                        )

                    }
                </div>
                <div className="OpcionesDeProductos">
                    <p className="tituloProductoAmin">Administración de las Tarimas</p>
                    <div className="group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input placeholder="Search" onChange={handleSearchChange} type="search" className="input" />
                    </div>
                    <br />
                    <br />
                    <div className="ButtonesAgregarProducto">
                        <button id="NuevoProducto" onClick={handleShow3} >Agregar Tarima</button>
                    </div>
                </div>
            </div >

        </>
    );
}
export default Tarimas;
