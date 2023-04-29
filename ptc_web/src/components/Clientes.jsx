import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, deleteDoc, doc, getFirestore, collection, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import SubMenu from './SubMenu.jsx';
import Nav from './Nav.jsx';


function Clientes(props) {
    const [rol, setRol] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dataFilter, setDataFilter] = useState([])
    const [tarima, setTarima] = useState('vacio');
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [show6, setShow6] = useState(false);
    const handleClose6 = () => setShow6(false);
    const handleShow6 = () => setShow6(true);
    const [show2, setShow2] = useState(false);
    const handleClose2 = () => setShow2(false);
    const handleShow2 = () => setShow2(true);
    const [show3, setShow3] = useState(false);
    const handleClose3 = () => setShow3(false);
    const handleShow3 = () => setShow3(true);
    const [show5, setShow5] = useState(false);
    const handleClose5 = () => setShow5(false);
    const [allTarimas, setAllTarimas] = useState([]);
    const [allIdTarimas, setAllIdTarimas] = useState([]);
    const [TarimaAEliminar, setTarimaAEliminar] = useState('')
    const [indiceTarimaTemp, setIndiceTarimaTemp] = useState('')
    const [temporalAllCliente, setTemporalAllCliente] = useState('')
    const [dataCliente, setDataCliente] = useState([]);
    const [NombreTemp, setNombreTemp] = useState('');
    const [tarimaAUX, setTarimaAUX] = useState('');
    const [cliente, setCliente] = useState('');
    const navigate = useNavigate();
    var filaVacia = [{
        'Select': '',
        'Cantidad': ''
    }]
    var db = getFirestore();
    const docRef = doc(db, "Productos", "aVBc13bTQxQk9SZFL7wT");
    const inventarioRef = collection(db, "Inventario");
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
                ExtraerRol(usuarioFirebase.email, Spinner).then(x => {
                    if (Spinner) {
                        ExtraerTarimas().then(x => x)
                        ExtraerIdTarimas().then(x => {
                            Spinner.style.display = 'none';
                        });
                    }
                })

            }
        });
    }, []);
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    async function UpdateCliente() {
        let sal = {}
        sal[tarima] = true
        await setDoc(doc(db, "Clientes", nuevonombre), sal).then(sal => {
            handleClose3();
            ExtraerTarimas();

        })
    }
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
    }
    async function ExtraerIdTarimas() {
        const subColRef = collection(db, "Tarimas");
        const querySnapshot = await getDocs(subColRef)
        let AllIdTarimas = [];
        let salidaFormateado = {};
        querySnapshot.forEach((doc) => {
            AllIdTarimas.push(doc.id)
        })
        setAllIdTarimas(AllIdTarimas)
    }
    async function eliminarCliente(NombreCliente, data, bandera) {
        if (bandera) {
            setDataCliente(data);
            setNombreTemp(NombreCliente)
            handleShow6();
        } else {
            await deleteDoc(doc(db, 'Clientes', NombreCliente)).then(sal => {
                handleClose6();
                ExtraerTarimas().then(x => handleClose())
            }
            )
        }
    }
    async function eliminarTarima(data, bandera, indice) {
        if (bandera) {
            setTemporalAllCliente(data)
            setTarimaAEliminar(allTarimas[0][data][indice])
            setIndiceTarimaTemp(indice)
            handleShow()
        } else {
            const docRef = doc(db, "Clientes", temporalAllCliente)
            let newData = {}
            newData[TarimaAEliminar] = false
            updateDoc(docRef, newData).then(docRef => {
                ExtraerTarimas().then(x => handleClose())

            }).catch(error => {
                console.log(error);
            })
        }
    }
    async function agregarTarima(bandera, indice, indiceDeTarima) {
        if (bandera) {
            setTarimaAUX(tarima)
            let data = {}
            data[tarima] = true
            const docRef = doc(db, "Clientes", cliente);
            updateDoc(docRef, data).then(function (x) {
                ExtraerTarimas()
            }
            )
            handleClose2()
        } else {

        }

    }
    const [nuevonombre, setNuevonombre] = useState('');
    function onChangeNombre(event) {
        let valor = event.target.value;
        setNuevonombre(valor)
    }
    function onChangeSelect(event) {
        let valor = event.target.value;
        setTarima(valor)
    }
   
    const filtro = allTarimas.map(objeto => {
        let nombre2 = searchTerm.toLocaleUpperCase()
        if (Object.keys(objeto).reduce((acc, actual) => String(acc + actual).toLowerCase()).includes(searchTerm.toLocaleLowerCase())) {
          if(Object.keys(objeto).includes(nombre2)){
            let salida ={}
            salida[nombre2]=objeto[nombre2]
            return salida
          }else{
            return objeto
          }
        }else{
          return objeto
        }
      })

    
    return (
        <>
         <Nav state={'SingOut'}/>

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
            
            <Modal show={show2} onHide={handleClose2}>
                <Modal.Header className="TituloEditar" closeButton>
                    <Modal.Title>Agregar nueva Tarima</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" > Selecciona La Tarima que desea agregar.
                    {
                        <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                            <thead>
                                <tr>
                                    <th>Tarima</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    <tr className="centrarfila">
                                        <select id="select" onChange={onChangeSelect} name="Tarima">
                                            <option key={'0.0'} value={'noVale'}>Selecciona uno</option>
                                            {allIdTarimas.map((fila, indice) =>
                                                <option key={fila['id']} value={fila['id']}>{fila}</option>
                                            )}
                                        </select>
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
                    <Button variant="primary" onClick={() => { agregarTarima(true) }}>
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal size="lg" show={show3} onHide={handleClose3}>
                <Modal.Header className="TituloEditar" closeButton>
                    <Modal.Title>Agregar nuevo Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" > Selecciona La Tarima que desea agregar.
                    {
                        <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Tarima</th>
                                </tr>
                            </thead>
                            <tbody>
                                {

                                    <tr className="centrarfila">
                                        <th><input type="text" onChange={onChangeNombre} name='NombreCliente' placeholder="Nombre Empresa" /></th>
                                        <select id="select" onChange={onChangeSelect} name="Tarima">
                                            <option key={'0.0'} value={'noVale'}>Selecciona uno</option>
                                            {allIdTarimas.map((fila, indice) =>
                                                <option key={fila['id']} value={fila['id']}>{fila}</option>
                                            )}
                                        </select>
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
                    <Button variant="primary" onClick={() => { UpdateCliente() }}>
                        Agregar
                    </Button>
                </Modal.Footer>
            </Modal>

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
                    <Button variant="primary" onClick={() => { eliminarTarima(TarimaAEliminar, false) }}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={show6} onHide={handleClose6}>
                <Modal.Header className="TituloEliminar" closeButton>
                    <Modal.Title>Eliminar Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bodymodla" >¿Estas Seguro que quieres eliminar este cliente?
                    <Table striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th colSpan={2}>{NombreTemp}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                dataCliente.map((fila, indice) =>
                                    < tr className="centrarfila">
                                        <td key={`1`} colSpan={2}    >{fila}</td>
                                        <td key={`2`} >{NombreTemp.substr(0, 2) + ' ' + fila}</td>
                                    </tr>
                                )

                            }
                        </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose6}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => { eliminarCliente(NombreTemp, dataCliente, false) }}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            

            <SubMenu Rol={rol} />

            <div className="tituloProdi">
                <h1>Clientes</h1>
            </div>


            <div className="contenidoTotal">
                <div className="TablaCont">
                    {
                        filtro.map((data) =>
                            Object.keys(data).map(nombreCLiente =>
                                <Table id="tablaProductos" striped bordered hover className="tablaProductos table table-bordered border border-secondary">
                                    <thead>
                                        <tr className="nombreTarima">
                                            <th className="centarTitule" colSpan={3} >
                                                Cliente:<br />
                                                {nombreCLiente}
                                            </th>
                                            <th style={{ textAlign: 'center' }} >
                                                <div className="calis">
                                                    <div >
                                                        <button onClick={function () { handleShow2(); setCliente(nombreCLiente) }} id="editarButton2" className="material-symbols-outlined" ><span > add_box </span></button>
                                                    </div>
                                                    <div >

                                                        <button id="cancelarButton" onClick={() => eliminarCliente(nombreCLiente, data[nombreCLiente], true)} >X</button>
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                        <tr>
                                            <th colSpan={2}>Nombre</th>
                                            <th>Identificador</th>
                                            <th>Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            data[nombreCLiente].map((fila, indice) =>
                                                < tr className="centrarfila">
                                                    <td key={`1`} colSpan={2}    >{fila}</td>
                                                    <td key={`2`} >{nombreCLiente.substr(0, 2) + ' ' + fila}</td>
                                                    <div className="accionAtomar">
                                                        <button id="cancelarButton" onClick={() => eliminarTarima(nombreCLiente, true, indice)}>X</button>
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
