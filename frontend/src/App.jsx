import {Navigate, Route, Routes} from 'react-router-dom';
import Homes from './pages/Homes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './shared/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Homes/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/signup' element={<Signup/>} />

  
    </Routes>
  )}

export default App;
