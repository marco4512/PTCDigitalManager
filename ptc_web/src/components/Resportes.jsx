import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Nav from "./Nav.jsx";
import SubMenu from './SubMenu.jsx';


function Reportes(props) {
    const navigate = useNavigate();
    const [rol, setRol] = useState('');
    var db = getFirestore();
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
                        Spinner.style.display = 'none';
                    }
                })

            }
        });
    }, []);



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

            <h1 className="home">Reportes</h1>
        </>
    );
}
export default Reportes;
