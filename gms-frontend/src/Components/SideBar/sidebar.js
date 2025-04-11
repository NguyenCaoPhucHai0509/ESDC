import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import BuildIcon from '@mui/icons-material/Build';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className='w-1/4 min-h-screen h-full fixed left-0 top-0 border-2 bg-black text-white p-5 font-extralight flex flex-col'>
      <div className='text-center text-4xl font-semibold'>
        HMH GYM
      </div>
      <div className='flex gap-5 my-5'>
        <div className='w-[100px] h-[100px] rounded-lg'>
          <img 
            alt='gym pic' 
            className='w-full h-full rounded-full' 
            src={user?.avatar ? `http://localhost:5000/uploads/${user.avatar}` : 'https://rukminim2.flixcart.com/image/850/1000/k76ihe80/sticker/f/d/c/gym-boy-medium-50-45-wz-292-wallzone-original-imafpggzrb4bszdn.jpeg?q=90&crop=false'}
          />
        </div>
        <div>
          <div className='text-3xl'>Xin chào!</div>
          <div className='text-xl mt-1 font-semibold'>{user?.fullName || 'Quản lí'}</div>
          <div className='text-sm text-gray-400'>{
            user?.role === 'admin' ? 'Quản lý' : 
            user?.role === 'receptionist' ? 'Lễ tân' : 
            user?.role === 'trainer' ? 'Huấn luyện viên' : 'Khách hàng'
          }</div>
          <div className='mt-2'>
            <button 
              className='flex items-center gap-1 bg-gray-600 hover:bg-red-700 text-white px-2 py-1 rounded-md transition-colors' 
              onClick={handleLogout}
            >
              <LogoutIcon fontSize="small" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className='mt-10 py-5 border-t-2 border-gray-700 flex-grow'>
        <Link to='/dashboard' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/dashboard" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>               
          <div><HomeIcon/></div>
          <div>Trang chủ</div>
        </Link>

        {(user?.role === 'admin' || user?.role === 'receptionist') && (
          <Link to='/member' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/member" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
            <div><PeopleAltIcon/> </div>
            <div>Khách hàng</div>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to='/equipment' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/equipment" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
            <div><BuildIcon/> </div>
            <div>Thiết bị</div>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to='/staff-management' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/staff-management" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
            <div><SupervisorAccountIcon/> </div>
            <div>Quản lý nhân viên</div>
          </Link>
        )}

        {/* Link Huấn luyện viên cho Customer và Admin/Receptionist */}
        <Link to='/trainers' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/trainers" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
          <div><PersonIcon/> </div>
          <div>Huấn luyện viên</div>
        </Link>
        
        {/* Yêu cầu huấn luyện dành cho Trainer */}
        {user?.role === 'trainer' && (
          <Link to='/trainer-requests' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/trainer-requests" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
            <div><NotificationsIcon/> </div>
            <div>Yêu cầu huấn luyện</div>
          </Link>
        )}
        
        <Link to='/membership' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/membership" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
          <div><CardMembershipIcon/> </div>
          <div>Gói tập</div>
        </Link>
        
        <Link to='/events' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/events" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
          <div><EventIcon/> </div>
          <div>Sự kiện</div>
        </Link>
        
        <Link to='/chat' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/chat" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
          <div><ChatIcon/> </div>
          <div>Tin nhắn</div>
        </Link>
        
        <Link to='/profile' className={`flex gap-8 mt-5 text white font-semibold text-xl bg-slate-700 p-3 rounded-xl cursor-pointer hover:bg-white hover:text-black ${location.pathname==="/profile" ? 'border-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : null}`}>
          <div><AccountCircleIcon/> </div>
          <div>Hồ sơ</div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;