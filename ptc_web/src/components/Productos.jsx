import { React, useEffect, useState } from "react";
import { json, useNavigate } from 'react-router-dom';
import { query, where, getDocs, doc, getFirestore, collection, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import { async } from "@firebase/util";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

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
    function ChangeDimension(event) {
        setDimension(event.target.value);
    }
    function ChangeMaterial(event) {
        setMaterial(event.target.value);
    }
    function ChangeNombre(event) {
        setNombre(event.target.value);
    }
    function ChangeVolumen(event) {
        setVolumen(event.target.value);
    }
    const [productosAgregar, setProductosAgregar] = useState([{
        'Dimension': '',
        'Material': '',
        'Nombre': '',
        'Volumen': ''
    }])
    function AñadirFila() {
        //handleClose3();
        let nuevaData = {
            'Dimension': '',
            'Material': '',
            'Nombre': '',
            'Volumen': ''
        }
        setProductosAgregar([...productosAgregar, nuevaData])
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
                    console.log('sin nada', productosAgregar)
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
    async function UpdateProductos() {

        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((documento) => {
            let Finales = []
            documento.data()['Productos'].map(function (producto) {
                Finales.push(producto)
            })
            productosAgregar.map((fila) => Finales.push(fila))
            const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
            let dataEnviar = { 'Productos': Finales }
            setDoc(docRef, dataEnviar).then(docRef => {
                console.log("Entire Document has been updated successfully");
                ExtraerProductos().then(function (x) {
                    setProductosAgregar([{
                        'Dimension': '',
                        'Material': '',
                        'Nombre': '',
                        'Volumen': ''
                    }])
                    handleClose3()
                })
            }).catch(error => {
                console.log(error);
            })
            //console.log('salida->', Finales)
        })

    }
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    async function ExtraerProductos() {
        let db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "Productos"));
        querySnapshot.forEach((doc) => {
            setProductos(doc.data().Productos)
        });
        console.log('Los Productos', productos)

    }
    var db = getFirestore();
    async function eliminarProducto(data, bandera) {
        if (bandera) {
            console.log(data)
            setDataOf(data)
            handleShow()
        } else {
            handleClose()

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
                    ExtraerProductos().then(x => x)
                }).catch(error => {
                    console.log(error);
                })
                console.log('salida->', Finales)
            });
        }
    }
    async function editarProducto(data, bandera) {
        if (bandera) {
            console.log('datos', data)
            setDataOf(data)
            setDimension(data['Dimension'])
            setMaterial(data['Material'])
            setNombre(data['Nombre'])
            setVolumen(data['Volumen'])
            handleShow2()
        } else {
            if (data['Dimension'] == dimension && data['Material'] == material && data['Nombre'] == nombre && data['Volumen'] == volumen) {
                console.log('No se edito nada')
                handleClose2()
            } else {
                var productoEditado = {
                    Nombre: nombre,
                    Volumen: volumen,
                    Dimension: dimension,
                    Material: material
                }
                const querySnapshot = await getDocs(collection(db, "Productos"));
                querySnapshot.forEach((documento) => {
                    let Finales = []
                    documento.data()['Productos'].map(function (producto) {
                        let arregloFirebase = Object.values(producto).sort();
                        let arregloActual = Object.values(data).sort();
                        console.log(arregloFirebase, arregloActual)
                        if (String(arregloFirebase) != String(arregloActual)) {
                            Finales.push(producto)
                        }
                    })
                    handleClose2()
                    Finales.push(productoEditado)
                    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
                    let dataEnviar = { 'Productos': Finales }
                    setDoc(docRef, dataEnviar).then(docRef => {
                        console.log("Entire Document has been updated successfully");
                        ExtraerProductos().then(x => x)

                    }).catch(error => {
                        console.log(error);
                    })
                    console.log('salida->', Finales)
                })
                console.log('Anterior', data)
                console.log('Nuevo', dimension, '-', material, '-', nombre, '-', volumen)

            }
        }


    }
    function eliminarFila(index, data) {
        handleClose3();
        data.splice(index, 1)
        console.log('index : ', index)
        console.log('data :', data)
        //setProductosAgregar([...data,data])
        setProductosAgregar(data)
        const timer = setTimeout(() => {
            handleShow3();
        }, .1);
    }

    function onChangeDimension(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        console.log('Este es el indice', indice)
        console.log(productosAgregar)
        productosAgregar[indice]['Dimension'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeMaterial(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        console.log('Este es el indice', indice)
        productosAgregar[indice]['Material'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeNombre(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        console.log('Este es el indice', indice)
        productosAgregar[indice]['Nombre'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeVolumen(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        console.log('Este es el indice', indice)
        productosAgregar[indice]['Volumen'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    const filteredData = productos.filter((row) =>
        row.Nombre.toLowerCase().trim().replaceAll(' ','').includes(searchTerm.toLowerCase().trim().replaceAll(' ',''))||
        row.Dimension.toLowerCase().trim().replaceAll(' ','').includes(searchTerm.toLowerCase().trim().replaceAll(' ',''))
    );
    return (
        <>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >¿Estas Seguro que quieres eliminar este Producto?
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>
                                <th>Material</th>
                                <th>Nombre</th>
                                <th>Volumen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                <tr className="centrarfila">
                                    <td key={1} >{dataOf['Dimension']}</td>
                                    <td key={2} >{dataOf['Material']}</td>
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
                    <Button variant="primary" onClick={() => { eliminarProducto(dataOf, false) }}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal size="lg" centered show={show2} onHide={handleClose2}>
                <Modal.Header className="TituloEditar" closeButton>
                    <Modal.Title>Editar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >Ingresa los nuevos campos de tu producto
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>
                                <th>Material</th>
                                <th>Nombre</th>
                                <th>Volumen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {

                                <tr className="centrarfila">
                                    <td key={1} ><input className="inputEditar" required type="text" onChange={ChangeDimension} value={dimension} /></td>
                                    <td key={2} ><input className="inputEditar" required type="text" onChange={ChangeMaterial} value={material} /></td>
                                    <td key={2} ><input className="inputEditar" required type="text" onChange={ChangeNombre} value={nombre} /></td>
                                    <td key={3} ><input className="inputEditar" required type="text" onChange={ChangeVolumen} value={volumen} /></td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose2}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { editarProducto(dataOf, false) }}>
                        GuardarCambios
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal size="xl" animation={false} centered show={show3} onHide={handleClose3}>
                <Modal.Header className="TituloProductosNuevos" closeButton>
                    <Modal.Title>Agregar Productos</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >
                    <p className="ingresanuevosprod">Ingresa un nuevo producto</p>
                    <div className="tablaAgregarProductos">
                        <Table id="TBALADIRECTA" striped bordered hover className="table table-bordered border border-secondary">
                            <thead>
                                <tr>
                                    <th>Dimensión</th>
                                    <th>Material</th>
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
                                            <td key={2} ><input className="inputEditar" name={index} onChange={onChangeMaterial} required type="text" value={keys['Material']} /></td>
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
                    <Button variant="primary" onClick={() => { UpdateProductos() }}>
                        Registrar Productos
                    </Button>
                </Modal.Footer>
            </Modal>
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
                    <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Dimensión</th>
                                <th>Material</th>
                                <th>Nombre</th>
                                <th>Volumen</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredData.map((number) =>
                                    <tr className="centrarfila">
                                        <td key={number.id} >{number['Dimension']}</td>
                                        <td key={number.id} >{number['Material']}</td>
                                        <td key={number.id} >{number['Nombre']}</td>
                                        <td key={number.id} >{number['Volumen']}</td>
                                        <div className="accionAtomar">
                                            <button id="cancelarButton" onClick={() => { eliminarProducto(number, true) }} >X</button>
                                            <button id="editarButton" className="material-symbols-outlined" onClick={() => { editarProducto(number, true) }}><span > edit </span></button>
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
                        <input placeholder="Search" onChange={handleSearchChange} type="search" className="input" />
                    </div>
                    <br />
                    <br />
                    <div className="ButtonesAgregarProducto">
                        <button id="NuevoProducto" onClick={handleShow3} >Agregar Productos</button>
                        <button id="DesdeSheet">Agregar desde Sheet</button>
                    </div>
                </div>
            </div>

        </>
    );
}
export default Productos;
