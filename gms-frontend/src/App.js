import './App.css';
import Dashboard from './Pages/Dashboard/dashboard';
import Home from './Pages/Home/home';
import Sidebar from './Components/SideBar/sidebar';
import Member from './Pages/Member/member';
import Chat from './Pages/Chat/ChatPage';
import Membership from './Pages/Membership/MembershipPage';
import Equipment from './Pages/Equipment/EquipmentPage';
import Events from './Pages/Events/EventsPage';
import Profile from './Pages/Profile/ProfilePage';
import TrainerList from './Pages/Trainer/TrainerList';
import TrainerRequests from './Pages/Trainer/TrainerRequests';
import StaffManagement from './Pages/Admin/StaffManagement';

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
        <Route 
          path='/chat' 
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/membership' 
          element={
            <PrivateRoute>
              <Membership />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/events' 
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/profile' 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/trainers' 
          element={
            <PrivateRoute>
              <TrainerList />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/trainer-requests' 
          element={
            <PrivateRoute roles={['trainer']}>
              <TrainerRequests />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/staff-management' 
          element={
            <PrivateRoute roles={['admin']}>
              <StaffManagement />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;