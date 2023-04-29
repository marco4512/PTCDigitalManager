import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, doc, getFirestore, collection, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';


function Productos(props) {

    const [dimension, setDimension] = useState();
    const [material, setMaterial] = useState();
    const [nombre, setNombre] = useState();
    const [volumen, setVolumen] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [show2, setShow2] = useState(false);
    const handleClose2 = () => setShow2(false);
    const handleShow2 = () => setShow2(true);
    const [show3, setShow3] = useState(false);
    const handleClose3 = () => setShow3(false);
    const handleShow3 = () => setShow3(true);
    const [dataOf, setDataOf] = useState([])
    const [indexTem, setIndexTem] = useState();
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [rol, setRol] = useState('');
    async function ExtraerRol(email) {
        const q = query(collection(db, "Empleados"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setRol(doc.data().rol)
        })
    }

    var filaVacia = [{
        'Dimension': '',
        'Nombre': '',
        'Volumen': ''
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
            case 'volumen':
                setVolumen(event.target.value);
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
        let Spinner = document.getElementById('Spinner');
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                navigate('/login')
            }
            else {
                ExtraerRol(usuarioFirebase.email).then(x => {
                    if (Spinner) {
                        ExtraerProductos().then(x => { Spinner.style.display = 'none'; })
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
        const querySnapshot = await getDocs(inventarioRef);
        const totalDocumentos = querySnapshot.size;
        productosAgregar.map(function (fila, index) {
            const documento = { // Crear el objeto con los datos del producto
                Dimension: fila['Dimension'],
                EspacioEnAlmacen: 0,
                Existencia: 0,
                FechaEntrada: "",
                FechaSalida: "",
                Nombre: fila['Nombre'],
                Precio: 0,
                Proveedor: "",
                ValorInventario: 0,
                Volumen: fila['Volumen'],
                Estatus: true
            };
            let indice = totalDocumentos + index;
            const docRef = doc(db, "Inventario", String(indice));
            setDoc(docRef, documento).then(docRef => {
                ExtraerProductos().then(function (x) {
                    setProductosAgregar(filaVacia)
                    handleClose3()
                })
            }).catch(error => {
                console.log(error);
            })
        })

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
        console.log(alldata)
    }

    async function eliminarMejorado(data, bandera, indice) {
        let aux = filteredData;
        if (bandera) {
            setIndexTem(indice)
            setDataOf(data)
            handleShow()
            console.log(indice)
        } else {
            delete aux[indexTem];
            const data = {
                Estatus: false
            };
            const docRef = doc(db, "Inventario", String(indexTem));
            updateDoc(docRef, data).then(docRef => {
                ExtraerProductos().then(function (x) {
                    handleClose()
                    setIndexTem()
                })
            }).catch(error => {
                console.log(error);
            })
        }
    }
    async function editarProductoMejorado(data, bandera, indice) {
        let aux = filteredData;
        if (bandera) {
            setIndexTem(indice)
            setDataOf(data)
            setDimension(data['Dimension'])
            setMaterial(data['Material'])
            setNombre(data['Nombre'])
            setVolumen(data['Volumen'])
            handleShow2()

        } else {
            if (data['Dimension'] == dimension && data['Material'] == material && data['Nombre'] == nombre && data['Volumen'] == volumen) {
                //console.log('No se edito nada')
                handleClose2()
            } else {
                var productoEditado = {
                    Nombre: nombre,
                    Volumen: volumen,
                    Dimension: dimension
                }
                const docRef = doc(db, "Inventario", String(indexTem));
                updateDoc(docRef, productoEditado).then(docRef => {
                    ExtraerProductos().then(function (x) {
                        handleClose2()
                        setIndexTem()
                    })
                }).catch(error => {
                    console.log(error);
                })

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
    function onChangeNombre(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Nombre'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeVolumen(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Volumen'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    const filteredData = productos.filter((row) =>
        row.data.Nombre.toLowerCase().trim().replaceAll(' ', '').includes(searchTerm.toLowerCase().trim().replaceAll(' ', '')) ||
        row.data.Dimension.toLowerCase().trim().replaceAll(' ', '').includes(searchTerm.toLowerCase().trim().replaceAll(' ', ''))
    );
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
            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >¿Estas Seguro que quieres eliminar este Material?
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>

                                <th>Nombre</th>
                                <th>Volumen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                <tr className="centrarfila">
                                    <td key={1} >{dataOf['Dimension']}</td>

                                    <td key={2} >{dataOf['Nombre']}</td>
                                    <td key={3} >{dataOf['Volumen']}</td>
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
                    <Modal.Title>Editar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >Ingresa los nuevos campos de tu Material
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>

                                <th>Nombre</th>
                                <th>Volumen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {

                                <tr className="centrarfila">
                                    <td key={1} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='dimension' value={dimension} /></td>

                                    <td key={2} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='nombre' value={nombre} /></td>
                                    <td key={3} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='volumen' value={volumen} /></td>
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
                    <Modal.Title>Agregar Productos</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >
                    <p className="ingresanuevosprod">Ingresa un nuevo Material</p>
                    <div className="tablaAgregarProductos">
                        <Table id="TBALADIRECTA" striped bordered hover className="table table-bordered border border-secondary">
                            <thead>
                                <tr>
                                    <th>Dimensión</th>

                                    <th>Nombre</th>
                                    <th>Volumen</th>
                                    <th>Action</th>

                                </tr>
                            </thead>
                            {
                                productosAgregar.map((keys, index) =>
                                    <tbody>
                                        <tr className="centrarfila">
                                            <td key={1} ><input className="inputEditar" name={index} onChange={onChangeDimension} required type="text" value={keys['Dimension']} /></td>

                                            <td key={3} ><input className="inputEditar" name={index} onChange={onChangeNombre} required type="text" value={keys['Nombre']} /></td>
                                            <td key={4} ><input className="inputEditar" name={index} onChange={onChangeVolumen} required type="text" value={keys['Volumen']} /></td>
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
                <h1>Material</h1>

            </div>
            <div className="contenidoTotal">
                <div className="TablaCont">
                    <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>

                                <th>Nombre</th>
                                <th>Volumen</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredData.map((number, indice) =>
                                    <tr className="centrarfila">
                                        <td key={`1.${indice}`} >{number['data']['Dimension']}</td>

                                        <td key={`3.${indice}`} >{number['data']['Nombre']}</td>
                                        <td key={`4.${indice}`} >{number['data']['Volumen']}</td>
                                        <div className="accionAtomar">
                                            <button id="cancelarButton" onClick={() => { eliminarMejorado(number['data'], true, number['id']) }} >X</button>
                                            <button id="editarButton" className="material-symbols-outlined" onClick={() => { editarProductoMejorado(number['data'], true, number['id']) }}><span > edit </span></button>
                                        </div>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </div>
                <div className="OpcionesDeProductos">
                    <p className="tituloProductoAmin">Administración de los Materiales</p>
                    <div className="group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input placeholder="Search" onChange={handleSearchChange} type="search" className="input" />
                    </div>
                    <br />
                    <br />
                    <div className="ButtonesAgregarProducto">
                        <button id="NuevoProducto" onClick={handleShow3} >Agregar Material</button>
                        <button id="DesdeSheet">Agregar desde Sheet</button>
                    </div>
                </div>
            </div>

        </>
    );
}
export default Productos;
