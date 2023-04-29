import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, doc, getFirestore, collection, setDoc, updateDoc, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';


function Inventario(props) {
    const [rol, setRol] = useState('');
    const [Existencia, setExistencia] = useState('');
    const [Precio, setPrecio] = useState();
    const [Fecha_ent, setFecha_ent] = useState();
    const [Proveedor, setProveedor] = useState();
    const [arregloPro, setArregloPro] = useState([]);
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
    var filaVacia = [{
        'Dimension': '',
        'Material': '',
        'Nombre': '',
        'Volumen': ''
    }]
    function onchangeSelect(event) {
        let value = event.target.value;
        if (value != 'Selecciona uno') {
            setProveedor(value)
        }
    }
    const [productosAgregar, setProductosAgregar] = useState(filaVacia)
   
    
    var db = getFirestore();
    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
    function Navegar(lugar) {
        navigate(`/${lugar}`)
    }
    function onChangeEditar(event) {
        let etiqueta = event.target.name;
        switch (etiqueta) {
            case 'Existencia':
                if (/^[0-9]*$/.test(event.target.value)) {
                    setExistencia(event.target.value);
                }
                break
            case 'Precio':
                if (/^[0-9]*\.?[0-9]*$/.test(event.target.value)) {
                    setPrecio(event.target.value);
                    console.log("El valor es válido");
                }
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
    async function ExtraerProveedores() {
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
        setArregloPro(alldata)
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
                        ExtraerProductos().then(x => { Spinner.style.display = 'none'; })
                    }
                })


            }
        });
    }, []);

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
    const [volTemp, setVolTemp] = useState("");
    async function editarProductoMejorado(data, bandera, indice, volumen) {
        let aux = filteredData;
        if (bandera) {

            ExtraerProveedores()
            setVolTemp(data['Volumen'])
            console.log("Vol: " + volTemp)
            setIndexTem(indice)
            console.log(indice)
            setDataOf(data)
            setExistencia(data['Existencia'])
            setPrecio(data['Precio'])
            setFecha_ent(data['FechaEntrada'])
            setProveedor(data['Proveedor'])
            handleShow2()

        } else {
            if (data['Volumen'] == volTemp && data['Existencia'] == Existencia && data['Precio'] == Precio && data['FechaEntrada'] == Fecha_ent && data['Proveedor'] == Proveedor) {
                //console.log('No se edito nada')
                handleClose2()
            } else {
                console.log(Existencia)

                var espAlm = String((Number(Existencia != '' ? Existencia : '0') * Number(volTemp != '' ? volTemp : '0')).toFixed(2));
                var valorInv = String((Number(Existencia != '' ? Existencia : '0') * Number(Precio != '' ? Precio : '0.0')).toFixed(2));

                var productoEditado = {
                    Existencia: Existencia != '' ? Existencia : '0',
                    Precio: Precio != '' ? Precio : '0.0',
                    FechaEntrada: Fecha_ent,
                    Proveedor: Proveedor,
                    EspacioEnAlmacen: (espAlm != '' ? espAlm : '0'),
                    ValorInventario: (valorInv != '' ? valorInv : '0')
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
                                    <td key={1} ><input className="inputEditar" required type="text" onChange={onChangeEditar} pattern="[0-9]*" name='Existencia' value={Existencia} /></td>
                                    <td key={2} ><input className="inputEditar" required type="text" onChange={onChangeEditar} name='Precio' value={Precio} /></td>
                                    <td key={3} ><input className="inputEditar" required type="date" onChange={onChangeEditar} name='FechaEntrada' /></td>
                                    <td key={4}>
                                        <select id="select" onChange={onchangeSelect} name="proveedores">
                                            <option key={'0.0'} value={''}>Selecciona uno</option>
                                            {arregloPro.map((fila, indice) =>
                                                <option key={indice} value={fila['data']['Nombre']}>{fila['data']['Nombre']}</option>
                                            )}
                                        </select>
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
                                            <button id="editarButton" className="material-symbols-outlined" onClick={() => { editarProductoMejorado(number['data'], true, number['id'], number['Volumen']) }}><span > edit </span></button>
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
