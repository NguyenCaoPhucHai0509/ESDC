import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser } from '../../features/users/userSlice';
import Modal from '../../Components/Modal/modal';
import RegisterForm from '../../Components/User/RegisterForm';

const StaffManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector(state => state.users);
  
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);
  
  const handleEditStaff = (staff) => {
    setCurrentStaff(staff);
    setShowEditModal(true);
  };
  
  const handleDeleteStaff = (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      dispatch(deleteUser(userId));
    }
  };
  
  // Lọc ra chỉ các tài khoản nhân viên (admin và receptionist)
  const staffs = users
    ? users.filter(user => 
        (user.role === 'admin' || user.role === 'receptionist') &&
        (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.phoneNumber?.includes(searchTerm))
      )
    : [];
  
  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Thêm nhân viên
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Đang tải...</p>
        </div>
      ) : staffs.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffs.map(staff => (
                <tr key={staff._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        {staff.avatar ? (
                          <img 
                            src={`http://localhost:5000/uploads/${staff.avatar}`}
                            alt={staff.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span>{staff.fullName.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {staff.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.phoneNumber || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      staff.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {staff.role === 'admin' ? 'Quản lý' : 'Lễ tân'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditStaff(staff)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center h-40 bg-white rounded-lg shadow">
          <p className="text-gray-500">Không tìm thấy nhân viên nào</p>
        </div>
      )}
      
      {showAddModal && (
        <Modal
          header="Thêm nhân viên mới"
          content={
            <RegisterForm 
              handleClose={() => setShowAddModal(false)} 
              staffOnly={true} 
            />
          }
          handleClose={() => setShowAddModal(false)}
        />
      )}
      
      {showEditModal && currentStaff && (
        <Modal
          header={`Chỉnh sửa: ${currentStaff.fullName}`}
          content={
            <RegisterForm 
              handleClose={() => setShowEditModal(false)} 
              staffOnly={true} 
              editData={currentStaff} 
            />
          }
          handleClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default StaffManagement;