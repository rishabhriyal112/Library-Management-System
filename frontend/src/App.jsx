import {Route, Routes} from 'react-router-dom';
import Homes from './pages/Homes';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Homes/>} />
      <Route path='/login' element={<Login/>} />
    </Routes>
  )}

export default App;
