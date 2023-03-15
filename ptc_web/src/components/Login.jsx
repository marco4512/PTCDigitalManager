import { React, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import { doc, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Login(props) {
  const navigate = useNavigate();
  const inputs_iniciales_login = {
    email2: '',
    password2: ''
  }
  const [values_login, setValues_login] = useState(inputs_iniciales_login)
  const Onchange2 = e => {
    const { name, value } = e.target;
    //console.log(name,value)
    setValues_login({ ...values_login, [name]: value })
  }
  function verValues() {
    console.log('valores', values_login)
  }
  const Login = async (e) => {
    var error = document.getElementById('ErrorLogin');

    try {
      var emailDesdeFirebase='';
      var allUserData;
      e.preventDefault();
      await signInWithEmailAndPassword(getAuth(), values_login.email2.toLowerCase(), values_login.password2)
        .then((usuarioFirebase) => {
          props.setUsuario(usuarioFirebase);
          navigate('/principal')
        });
    } catch (e) {
      console.log(e)
      error.style.display = 'block';
      error.style.color='red';
    }
  }
  return (
    <>
      <div className="pricipal" >
        <Form className="formularioXD" >
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="Titulologingmail">Correo Electronico</Form.Label>
            <Form.Control name="email2" onChange={Onchange2} type="email" placeholder="Ingrese correo" />
            <Form.Text id="ErrorLogin" className="colores">
              Ingrese un correo valido o una contraseña correcta
            </Form.Text>

          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="Titulologinpas">Contraseña</Form.Label>
            <Form.Control name="password2" onChange={Onchange2} type="password" placeholder="Ingresa contraseña" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            {/* <Form.Text className="text-muted">
              Ingrese una contraseña valida.
            </Form.Text> */}
          </Form.Group>

          <div className="BotonLogin">
            <Button variant="primary" onClick={Login}  >
              Iniciar Seción
            </Button>
          </div>

        </Form>

      </div>
    </>
  );
}
export default Login;
