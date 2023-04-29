import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import SubMenu from './SubMenu';
import Nav from "./Nav.jsx";


function PanelPrincipal(props) {
    const navigate = useNavigate();
    const [rol, setRol] = useState('');
    const auth = getAuth();
    var db = getFirestore();
    
   
   
    useEffect(() => {
        let Spinner = document.getElementById('Spinner');
        getAuth().onAuthStateChanged((usuarioFirebase) => {
            if (usuarioFirebase == null) {
                navigate('/login')
            }
            else {
                console.log('Deberia de pasar a block')
                ExtraerRol(usuarioFirebase.email, Spinner).then(x => {
                    if (Spinner) {
                        Spinner.style.display = 'none';
                        console.log('El rol',rol)
                    }
                })
            }
        });
    }, []);

    async function ExtraerRol(email, Spinner) {
        const q = query(collection(db, "Empleados"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setRol(doc.data().rol)
        })
    }
    

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
            <div id="containerPrincial" className="containerPanelPrincipal">
                <SubMenu Rol={rol} />
                <h1 className="home">PanelPrincipal</h1>
                <h1 className="text-center mx-auto">Nombre de Usuario</h1>
                <br /><br /><br />
                <div className="row text-center pb-5">
                    <div className="col-10">
                        <div>
                            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio1">Hoy</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio2">Ayer</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio3">Semana</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio4" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio4">Fecha</label>
                            </div>
                            <div className="btn-group mx-3" role="group" aria-label="Basic radio toggle button group">
                                <input type="radio" className="btn-check" name="btnradio" id="btnradio5" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio5">Todos</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio6" autoComplete="off" />
                                <label className="btn btn-outline-primary" htmlFor="btnradio6">Cliente</label>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="row pb-5 px-5">
                    <div className="panel-lg text-center col-6 bg-dark mx-3">Pedidos</div>
                    <div id="mi-col" className="col-5">
                        <div class="child bg-dark">Pendientes</div>
                        <div class="child bg-dark">Proceso</div>
                        <div class="child bg-dark">Realizados</div>
                    </div>
                </div>

                <div className="row pb-5 px-5">
                    <div id="mi-col" className="col-5">
                        <div class="child bg-dark">En Stock</div>
                        <div class="child bg-dark">Comprometidas</div>
                        <div class="child bg-dark">Necesitadas</div>
                    </div>
                    <div className="panel-lg col-6 bg-dark mx-3">Existencias</div>
                </div>

                <div className="row h-70 pb-5 px-5">
                    <div className="panel-lg col-5 bg-dark mx-4">Ventas</div>
                    <div className="panel-lg col-5 bg-dark mx-4">Clientes</div>
                </div>
            </div>
        </>
    );
}
export default PanelPrincipal;