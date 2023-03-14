import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  return (
    <>
    <div className="pricipal" >
        <Form className="formularioXD" >
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="Titulologingmail">Correo Electronico</Form.Label>
            <Form.Control type="email" placeholder="Ingrese correo" />
            <Form.Text className="colores">
              Ingrese un correo valido y que exista.
            </Form.Text>
        
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="Titulologinpas">Contraseña</Form.Label>
            <Form.Control type="password" placeholder="Ingresa contraseña" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
          {/* <Form.Text className="text-muted">
              Ingrese una contraseña valida.
            </Form.Text> */}
          </Form.Group>

          <div className="BotonLogin">
            <Button variant="primary" type="submit">
              Iniciar Seción
            </Button>
          </div>

        </Form>

      </div>
    </>
  );
}
export default Login;
