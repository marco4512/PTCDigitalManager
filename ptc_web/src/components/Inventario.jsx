import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, doc, getFirestore, collection, setDoc, updateDoc, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
function Inventario(props) {
    const [Existencia, setExistencia] = useState();
    const [Precio, setPrecio] = useState();
    const [Fecha_ent, setFecha_ent] = useState();
    const [Proveedor, setProveedor] = useState();

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
        'Material': '',
        'Nombre': '',
        'Volumen': ''
    }]
    const [productosAgregar, setProductosAgregar] = useState(filaVacia)
    var containerPrincial = document.getElementById('containerPrincial');
    var db = getFirestore();
    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
    function Navegar(lugar) {
        navigate(`/${lugar}`)
    }

    function onChangeEditar(event) {
        let etiqueta = event.target.name;
        switch (etiqueta) {
            case 'Existencia':
                setExistencia(event.target.value);
                break
            case 'Precio':
                setPrecio(event.target.value);
                break
            case 'FechaEntrada':
                setFecha_ent(event.target.value);
                break
            case 'Proveedor':
                setProveedor(event.target.value);
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
                    //console.log('cargando la primera vez')
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
            let dataEnviar = { 'Productos': Finales }
            setDoc(docRef, dataEnviar).then(docRef => {
                //console.log("Entire Document has been updated successfully");
                ExtraerProductos().then(function (x) {
                    setProductosAgregar(filaVacia)
                    handleClose3()
                })
            }).catch(error => {
                console.log(error);
            })
        })
    }
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

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
        } else {
            delete aux[indexTem];
            //console.log('data :', aux)
            //const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
            const emptyIndex = aux.indexOf(undefined);
            //console.log('undefined', emptyIndex)
            let formato = { 'Productos': [] }
            aux.map(x => formato['Productos'].push(x))
            //console.log(formato)
            setDoc(docRef, formato).then(docRef => {
                //console.log("Entire Document has been updated successfully");
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
            console.log(indice)
            setDataOf(data)
            setExistencia(data['Existencia'])
            setPrecio(data['Precio'])
            setFecha_ent(data['FechaEntrada'])
            setProveedor(data['Proveedor'])
            handleShow2()

        } else {
            if (data['Existencia'] == Existencia && data['Precio'] == Precio && data['FechaEntrada'] == Fecha_ent && data['Proveedor'] == Proveedor) {
                //console.log('No se edito nada')
                handleClose2()
            } else {
                var productoEditado = {
                    Existencia: Existencia,
                    Precio: Precio,
                    FechaEntrada: Fecha_ent,
                    Proveedor: Proveedor
                }
                const docRef = doc(db, "Inventario", String(indexTem));
                updateDoc(docRef, productoEditado).then(docRef => {
                    //console.log("Entire Document has been updated successfully");
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
const Proveedores =
    <select id="frutas" name="frutas">
        <option key={'asdf'} value={'asdf'}>uno uno</option>
    </select>

return (
    <>


        <Modal size="lg" centered show={show2} onHide={handleClose2}>
            <Modal.Header className="TituloEditar" closeButton>
                <Modal.Title>Editar Inventario</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bodymodla" >Actualiza tu inventario
                <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                    <thead>
                        <tr>
                            <th>Existencia</th>
                            <th>Precio</th>
                            <th>Fecha ent</th>
                            <th>Proveedor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            <tr className="centrarfila">
                                <td key={1} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='Existencia' value={Existencia} /></td>
                                <td key={2} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='Precio' value={Precio} /></td>
                                <td key={2} ><input className="inputEditar" required type="date" onChange={onChangeEditar} name='FechaEntrada' /></td>
                                <td key={3}>
                                    {
                                        Proveedores
                                    }
                                </td>
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
            <button onClick={() => Navegar('stock')} id="inventarioNav" className="buttonOpcion2">Inventario</button>
            <button onClick={() => Navegar('pedido')} id="pedidoNav" className="buttonOpcion2" >Pedido</button >
            <button onClick={() => Navegar('productos')} id="productosNav" className="buttonOpcion2">Productos</button>
            <button onClick={() => Navegar('reportes')} id="reportesNav" className="buttonOpcion2">Reportes</button>
            <button onClick={() => Navegar('principal')} id="panelPrincipalNav" className="buttonOpcion2">PanelPrincipal</button>
        </div>
        <div className="InventarioTop">
            <div className="tituloInve">
                <h3>Inventario</h3>
            </div>

            <div className="serch">
                <div className="group">
                    <svg className="icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                    <input placeholder="Search" onChange={handleSearchChange} type="search" className="input" />
                </div>
            </div>
        </div>


        <div className="contenidoTotal">
            <div className="TablaContInven">
                <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>NumeroParte</th>
                            <th>Volumen</th>
                            <th>Existencia</th>
                            <th>Precio</th>
                            <th>P3</th>
                            <th>Valor de Inv</th>
                            <th>Fecha ent</th>
                            <th>Fecha sal</th>
                            <th>Proveedor</th>
                            <th>Agregar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredData.map((number, indice) =>
                                <tr className="centrarfila">
                                    <td key={`1.${indice}`} >{number['data']['Nombre']}</td>
                                    <td key={`2.${indice}`} >{number['data']['Dimension']}</td>
                                    <td key={`3.${indice}`} >{number['data']['Volumen']}</td>
                                    <td key={`4.${indice}`} >{number['data']['Existencia']}</td>
                                    <td key={`5.${indice}`} >{number['data']['Precio']}</td>
                                    <td key={`6.${indice}`} >{number['data']['EspacioEnAlmacen']}</td>
                                    <td key={`7.${indice}`} >{number['data']['ValorInventario']}</td>
                                    <td key={`8.${indice}`} >{number['data']['FechaEntrada']}</td>
                                    <td key={`9.${indice}`} >{number['data']['FechaSalida']}</td>
                                    <td key={`10.${indice}`} >{number['data']['Proveedor']}</td>
                                    <div className="accionAtomar">
                                        <button id="editarButton2" className="material-symbols-outlined" ><span > add_box </span></button>
                                        <button id="editarButton" className="material-symbols-outlined" onClick={() => { editarProductoMejorado(number['data'], true, number['id']) }}><span > edit </span></button>
                                    </div>
                                </tr>
                            )
                        }
                    </tbody>
                </Table>
            </div>

        </div>

    </>
);
}
export default Inventario;
