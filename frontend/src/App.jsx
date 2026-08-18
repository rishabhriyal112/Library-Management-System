import { Navigate, Route, Routes } from 'react-router-dom';
import Homes from './pages/Homes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './shared/ProtectedRoute';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminBooksPage from './admin/AdminBooksPage';
import AdminUsersPage from './admin/AdminUsersPage';
import AdminFinesPage from './admin/AdminFinesPage';
import UserLayout from './user/UserLayout';
import UserDashboardPage from './user/UserDashboardPage';
import UserBooksPage from './user/UserBooksPage';
import UserEditProfilePage from './user/UserEditProfilePage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Homes />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />

      {/* Protected Routes */}
      {/* ADMIN */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Navigate to='/admin/dashboard' replace />} />
          <Route path='dashboard' element={<AdminDashboard />} />
          <Route path='books' element={<AdminBooksPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="fines" element={<AdminFinesPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="user" />}>
        <Route path='/user' element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path='dashboard' element={<UserDashboardPage />} />
          <Route path='books' element={<UserBooksPage/>} />
          <Route path='profile' element={<UserEditProfilePage/>} />
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App;
