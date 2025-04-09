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

import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { Provider } from 'react-redux';
import { store } from './app/store';

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
            <PrivateRoute roles={['admin', 'receptionist']}>
              <Membership />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/equipment' 
          element={
            <PrivateRoute roles={['admin']}>
              <Equipment />
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
      </Routes>
    </div>
  );
}

// Wrap with Provider
const AppWithRedux = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default AppWithRedux;