import React, {useState, useEffect} from 'react';
import AddIcon from '@mui/icons-material/Add'; 
import CardMembershipIcon from '@mui/icons-material/CardMembership'; 
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Membercard from '../../Components/MemberCards/membercards';
import Modal from '../../Components/Modal/modal';
import AddmemberShip from '../../Components/Addmembership/addmemberShip';
import RegisterForm from '../../Components/User/RegisterForm';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser } from '../../features/users/userSlice';

const Member = () => {  
  const [addMembership, setAddmemberShip] = useState(false);
  const [addMember, setAddmember] = useState(false);
  const [editMember, setEditMember] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userType, setUserType] = useState('all'); // 'all', 'customer', 'trainer'
  
  const ITEMS_PER_PAGE = 9;
  
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector(state => state.users);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);
  
  const handleMembership = () => {
    setAddmemberShip(prev => !prev);
  };

  const handleAddMember = () => {
    setAddmember(prev => !prev);
  };
  
  const handleEditMember = (member) => {
    setCurrentMember(member);
    setEditMember(true);
  };
  
  const handleDeleteMember = (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      dispatch(deleteUser(userId));
    }
  };
  
  // Lọc người dùng theo vai trò và từ khóa tìm kiếm
  const filteredUsers = users
    ? users.filter(u => 
        (userType === 'all' || 
         (userType === 'customer' && u.role === 'customer') ||
         (userType === 'trainer' && u.role === 'trainer')) &&
        (u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.phoneNumber?.includes(searchTerm))
      )
    : [];
  
  // Tính toán phân trang
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Hàm kiểm tra quyền
  const canManageUser = (userRole) => {
    // Admin có thể quản lý tất cả các loại tài khoản
    if (user.role === 'admin') return true;
    
    // Lễ tân chỉ có thể quản lý khách hàng và huấn luyện viên
    if (user.role === 'receptionist') {
      return userRole === 'customer' || userRole === 'trainer';
    }
    
    return false;
  };

  return (  
    <div className="ml-[25%] p-5 w-full h-screen flex flex-col">   
      {/* Block for banner */}  
      <div className='border-2 bg-slate-900 flex justify-between w-full text-white rounded-lg p-3'>  
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-md ${userType === 'all' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setUserType('all')}
          >
            Tất cả
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${userType === 'customer' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setUserType('customer')}
          >
            Khách hàng
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${userType === 'trainer' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setUserType('trainer')}
          >
            Huấn luyện viên
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="bg-slate-900 border border-white text-white px-5 py-1.5 rounded-full hover:bg-green-600 flex items-center transition-colors" 
            onClick={handleAddMember}
          >  
            Thêm người dùng
            <AddIcon className="ml-1" fontSize="small" />  
          </button>  
          <button 
            className="bg-slate-900 border border-white text-white px-5 py-1.5 rounded-full hover:bg-red-600 flex items-center transition-colors" 
            onClick={handleMembership}
          >  
            Gói tập
            <CardMembershipIcon className="ml-1" fontSize="small" />  
          </button>  
        </div>
      </div>  

      {/* Block for back to dashboard */}  
      <Link to="/dashboard" className="flex items-center mt-4 text-blue-600 hover:text-blue-800 transition-colors">  
        <KeyboardReturnIcon className="mr-1" />   
        Trở lại trang chủ
      </Link>  

      <div className="mt-4 flex gap-2 w-1/2">  
        <input   
          type="text"   
          className='border-2 w-full p-2 rounded-lg'   
          placeholder='Tìm kiếm bằng tên, email hoặc số điện thoại...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />  
        <div className='bg-white p-3 border-2 text-black rounded-lg cursor-pointer hover:bg-blue-600 hover:text-white'>  
          <SearchIcon/>  
        </div>  
      </div>  

      {/* Adjusted Total Members section */}  
      <div className='mt-5 flex items-center justify-between text-slate-900'>  
        <div className='text-xl'>
          Tổng số: {filteredUsers.length} người dùng
          {userType !== 'all' && ` (${userType === 'customer' ? 'Khách hàng' : 'Huấn luyện viên'})`}
        </div>  
        <div className='flex items-center gap-4'>  
          <div className='text-sm text-gray-600'>
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} trên {filteredUsers.length}
          </div>  
          <div className='flex items-center gap-2'>  
            <div 
              className={`w-8 h-8 cursor-pointer border-2 flex items-center justify-center hover:text-white hover:bg-blue-600 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}`} 
              onClick={handlePrev}
            >  
              <ArrowLeftIcon/>  
            </div>  
            <div 
              className={`w-8 h-8 cursor-pointer border-2 flex items-center justify-center hover:text-white hover:bg-blue-600 ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}`} 
              onClick={handleNext}
            >
              <ArrowRightIcon/>  
            </div>  
          </div>  
        </div>  
      </div>  

      <div className='bg-slate-100 mt-5 p-5 rounded-lg flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Đang tải...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <div className='grid grid-cols-3 gap-4'>
            {currentItems.map(member => (
              <div key={member._id} className='bg-white rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors duration-300 ease-in-out'>  
                <div className='w-28 h-28 flex justify-center relative items-center border-2 p-1 mx-auto rounded-full'>
                  <img 
                    className='w-full h-full rounded-full' 
                    src={member.avatar ? `http://localhost:5000/uploads/${member.avatar}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMHgQ1Y-K5E-Fnf8LVBpKONJGhE97LZGX6rQ&s'} 
                    alt='profile pic'
                  />
                </div>
                <div className='mx-auto mt-5 text-center text-xl font-semibold font-mono'>
                  {member.fullName}
                </div>
                <div className='mx-auto mt-2 text-center text-sm'>Email: {member.email}</div>
                <div className='mx-auto mt-1 text-center text-sm'>SĐT: {member.phoneNumber || 'Chưa cập nhật'}</div>
                <div className='mx-auto mt-1 text-center text-sm'>
                  Vai trò: {
                    member.role === 'admin' ? 'Quản lý' : 
                    member.role === 'receptionist' ? 'Lễ tân' : 
                    member.role === 'trainer' ? 'Huấn luyện viên' : 'Khách hàng'
                  }
                </div>
                
                {canManageUser(member.role) && (
                  <div className="flex justify-center mt-3 space-x-2">
                    <button 
                      onClick={() => handleEditMember(member)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        )}

        {addMembership && <Modal header="Gói tập" handleClose={handleMembership} content={<AddmemberShip/>}/>}
        {addMember && <Modal header="Thêm người dùng" handleClose={handleAddMember} content={<RegisterForm handleClose={handleAddMember} />}/>}
        {editMember && <Modal header="Chỉnh sửa người dùng" handleClose={() => setEditMember(false)} content={<RegisterForm handleClose={() => setEditMember(false)} editData={currentMember} />}/>}
      </div>
    </div>  
  );  
};  

export default Member;