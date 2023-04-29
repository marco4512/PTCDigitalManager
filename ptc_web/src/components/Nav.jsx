import React from "react";
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
function Nav(props) {
    const navigate = useNavigate();
    const auth = getAuth();

    function Navegar(pagina) {
        if (pagina == 'SingOut') {
            SingOut()

        } else {
            navigate(`/${pagina}`)
        }
    }

    function SingOut() {
        signOut(auth).then(() => {
        }).catch((error) => {
        });
    }

    return (
        <>
        
            <div className="navBar">
                <div onClick={() => Navegar('Home')} className="LogoEmpresa"></div>
                <div className="Separador">
                </div>
                <div className="PartesPagina">
                    <button onClick={()=>Navegar(props.state == 'login' ? 'login' : 'SingOut')} id="Login" className="buttonOpcion">{props.state == 'login' ? 'Login' : 'SingOut'}</button>
                </div>
            </div>
        </>
    );
}
export default Nav;
