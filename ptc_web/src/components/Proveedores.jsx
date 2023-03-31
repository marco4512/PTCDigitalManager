import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, doc, getFirestore, collection, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Proveedores(props) {

    const [Nombre, setNombre] = useState();
    const [Encargado, setEncargado] = useState();
    const [Contacto, setContacto] = useState();

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
    const [email, setEmail] = useState(false);
    const [primera_vez, setPrimera_vez] = useState(false);
    const [productos, setProductos] = useState([]);
    var filaVacia = [{
        'Dimension': '',
        'Nombre': '',
        'Volumen': ''
    }]
    const [productosAgregar, setProductosAgregar] = useState(filaVacia)
    var containerPrincial = document.getElementById('containerPrincial');
    var db = getFirestore();
    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
    const inventarioRef = collection(db, "Proveedores");
    function Navegar(lugar) {
        navigate(`/${lugar}`)
    }

    function onChangeEditar(event) {
        let etiqueta = event.target.name;
        switch (etiqueta) {
            case 'Nombre':
                setNombre(event.target.value);
                break
            case 'Encargado':
                setEncargado(event.target.value);
                break
            case 'Contacto':
                setContacto(event.target.value);
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
                if (primera_vez == false || productos) {
                    setPrimera_vez(true);
                    ObtenerNav(usuarioFirebase.email)
                    ExtraerProductos()
                    //console.log('sin nada', productosAgregar)
                }
                if (primera_vez) {
                    //console.log('ya se cargo');
                }
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
        const querySnapshot = await getDocs(inventarioRef);
        const totalDocumentos = querySnapshot.size;
        productosAgregar.map(function (fila, index) {
            const documento = { 
                Nombre: fila['Nombre'],
                Encargado: fila['Encargado'],
                Contacto: fila['Contacto'],
                Estatus: true
            };
            let indice = totalDocumentos + index;
            const docRef = doc(db, "Proveedores", String(indice));
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
        const querySnapshot = await getDocs(collection(db, "Proveedores"));
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
            const docRef = doc(db, "Proveedores", String(indexTem));
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
            setNombre(data['Nombre'])
            setEncargado(data['Encargado'])
            setContacto(data['Contacto'])
            handleShow2()

        } else {
            if (data['Nombre'] == Nombre && data['Encargado'] == Encargado && data['Contacto'] == Contacto) {
                //console.log('No se edito nada')
                handleClose2()
            } else {
                var productoEditado = {
                    Nombre: Nombre,
                    Encargado: Encargado,
                    Contacto: Contacto
                }
                const docRef = doc(db, "Proveedores", String(indexTem));
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
    function onChangeNombre(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Nombre'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onEncargado(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Encargado'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    function onChangeContacto(event) {
        let valor = event.target.value;
        let indice = event.target.name;
        //console.log('Este es el indice', indice)
        productosAgregar[indice]['Contacto'] = valor;
        setProductosAgregar([...productosAgregar])
    }
    const filteredData = productos.filter((row) =>
        row.data.Nombre.toLowerCase().trim().replaceAll(' ', '').includes(searchTerm.toLowerCase().trim().replaceAll(' ', '')) ||
        row.data.Encargado.toLowerCase().trim().replaceAll(' ', '').includes(searchTerm.toLowerCase().trim().replaceAll(' ', '')) ||
        row.data.Contacto.toLowerCase().trim().replaceAll(' ', '').includes(searchTerm.toLowerCase().trim().replaceAll(' ', ''))
    );
    return (
        <>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >¿Estas Seguro que quieres eliminar este Proveedor?
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Encargado</th>
                                <th>Contacto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                <tr className="centrarfila">
                                    <td key={1} >{dataOf['Nombre']}</td>
                                    <td key={2} >{dataOf['Encargado']}</td>
                                    <td key={3} >{dataOf['Contacto']}</td>
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
                <Modal.Body className="bodymodla" >Ingresa los nuevos campos de tu Proveedor
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Encargado</th>
                                <th>Contacto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {

                                <tr className="centrarfila">
                                    <td key={1} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='Nombre' value={Nombre} /></td>
                                    <td key={2} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='Encargado' value={Encargado} /></td>
                                    <td key={3} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='Contacto' value={Contacto} /></td>
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
                    <p className="ingresanuevosprod">Ingresa un nuevo Proveedor</p>
                    <div className="tablaAgregarProductos">
                        <Table id="TBALADIRECTA" striped bordered hover className="table table-bordered border border-secondary">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Encargado</th>
                                    <th>Contacto</th>
                                    <th>Action</th>

                                </tr>
                            </thead>
                            {
                                productosAgregar.map((keys, index) =>
                                    <tbody>
                                        <tr className="centrarfila">
                                            <td key={1} ><input className="inputEditar" name={index} onChange={onChangeNombre} required type="text" value={keys['Nombre']} /></td>
                                            <td key={3} ><input className="inputEditar" name={index} onChange={onEncargado} required type="text" value={keys['Encargado']} /></td>
                                            <td key={4} ><input className="inputEditar" name={index} onChange={onChangeContacto} required type="text" value={keys['Contacto']} /></td>
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
            <div id="NavTemporal" className="NavTemporal">

                <button onClick={() => Navegar('stock')} id="inventarioNav" className="buttonOpcion2">Inventario</button>
                <button onClick={() => Navegar('pedido')} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
                <button onClick={() => Navegar('productos')} id="productosNav" className="buttonOpcion2">Material</button>
                <button onClick={() => Navegar('reportes')} id="reportesNav" className="buttonOpcion2">Reportes</button>
                <button onClick={() => Navegar('principal')} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
                <button onClick={() => Navegar('proveedores')} id="prooveedores" className="buttonOpcion2">Proveedor</button>
            </div>
            <div className="tituloProdi">
                <h1>Proveedores</h1>

            </div>
            <div className="contenidoTotal">
                <div className="TablaCont">
                    <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Encargado</th>
                                <th>Contacto</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredData.map((number, indice) =>
                                    <tr className="centrarfila">
                                        <td key={`1.${indice}`} >{number['data']['Nombre']}</td>
                                        <td key={`3.${indice}`} >{number['data']['Encargado']}</td>
                                        <td key={`4.${indice}`} >{number['data']['Contacto']}</td>
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
                    <p className="tituloProductoAmin">Administración de los Proveedores</p>
                    <div className="group">
                        <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                        <input placeholder="Search" onChange={handleSearchChange} type="search" className="input" />
                    </div>
                    <br />
                    <br />
                    <div className="ButtonesAgregarProducto">
                        <button id="NuevoProducto" onClick={handleShow3} >Agregar Proveedores</button>
                        <button id="DesdeSheet">Agregar desde Sheet</button>
                    </div>
                </div>
            </div>

        </>
    );
}
export default Proveedores;
