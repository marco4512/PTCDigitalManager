import './App.css';
import {React,useState} from "react";
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Login from './components/Login.jsx';
import Inventario from './components/Inventario.jsx';
import Pedidos from './components/Pedidos.jsx';
import Productos from './components/Productos.jsx';
import Nav from './components/Nav.jsx';
import Reportes from './components/Resportes.jsx';
import PanelPrincipal from './components/PanelPrincipal.jsx';
import Proveedores from './components/Proveedores.jsx';
import Tarimas from './components/Tarimas.jsx';
import Clientes from './components/Clientes.jsx';
function App() {
  const [usuario, setUsuario] = useState(null);
  return (
    <>
      <Nav/>
      <Routes>
        <Route path='/' element={<Home setUsuario={setUsuario} />} />
        <Route path='/adDashboard' element={<AdminDashboard setUsuario={setUsuario} />} />
        <Route path='/login' element={<Login setUsuario={setUsuario} />} />
        <Route path='/stock' element={<Inventario setUsuario={setUsuario} />} />
        <Route path='/pedido' element={<Pedidos setUsuario={setUsuario} />} />
        <Route path='/productos' element={<Productos setUsuario={setUsuario} />} />
        <Route path='/reportes' element={<Reportes setUsuario={setUsuario} />} />
        <Route path='/principal' element={<PanelPrincipal setUsuario={setUsuario} />} />
        <Route path='/proveedores' element={<Proveedores setUsuario={setUsuario} />} />
        <Route path='/Tarimas' element={<Tarimas setUsuario={setUsuario} />} />
        <Route path='/cliente' element={<Clientes setUsuario={setUsuario} />} />

      </Routes>
    </>
  );
}

export default App;
