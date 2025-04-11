import './App.css';
import Dashboard from './Pages/Dashboard/dashboard';
import Home from './Pages/Home/home';
import Sidebar from './Components/SideBar/sidebar';
import Member from './Pages/Member/member';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUsers } from './features/users/userSlice';

// Private route component
const PrivateRoute = ({ children, roles = [] }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Role-based access
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      dispatch(getUsers());
    }
  }, [user, dispatch]);

  return (
    <div className="flex">
      {user && <Sidebar />}
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route 
          path='/dashboard' 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/member' 
          element={
            <PrivateRoute roles={['admin', 'receptionist']}>
              <Member />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;