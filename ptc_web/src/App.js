import './App.css';
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
function App() {
  return (
    <>
      <Nav/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/adDashboard' element={<AdminDashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/stock' element={<Inventario />} />
        <Route path='/pedido' element={<Pedidos />} />
        <Route path='/productos' element={<Productos />} />
        <Route path='/reportes' element={<Reportes />} />
        <Route path='/principal' element={<PanelPrincipal />} />
      </Routes>
    </>
  );
}

export default App;
