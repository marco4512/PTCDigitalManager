import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Inventario from './components/Inventario';
import Pedidos from './components/Pedidos';
import Productos from './components/Productos';
import Nav from './components/Nav';
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
      </Routes>
    </>
  );
}

export default App;
