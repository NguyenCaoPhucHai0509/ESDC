// Trong file gms-frontend/src/Components/User/RegisterForm.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../features/auth/authSlice';

const RegisterForm = ({ handleClose, editData }) => {
  const [formData, setFormData] = useState({
    fullName: editData ? editData.fullName : '',
    email: editData ? editData.email : '',
    password: '',
    confirmPassword: '',
    phoneNumber: editData ? editData.phoneNumber : '',
    address: editData ? editData.address : '',
    role: editData ? editData.role : 'customer'
  });
  
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.auth);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    
    // Check for receptionist attempting to create admin/receptionist
    if (user && user.role === 'receptionist' && 
        (formData.role === 'admin' || formData.role === 'receptionist')) {
      setError('Lễ tân chỉ có thể tạo tài khoản khách hàng và huấn luyện viên');
      return;
    }
    
    // Create userData object (remove confirmPassword)
    const { confirmPassword, ...userData } = formData;
    
    // If editing existing user, handle differently
    if (editData) {
      // Xử lý chỉnh sửa người dùng (sẽ thêm sau)
      console.log('Editing user:', userData);
    } else {
      // Register new user
      dispatch(register(userData));
    }
    
    handleClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${editData ? 'bg-gray-100' : ''}`}
          required
          disabled={editData}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required={!editData}
          minLength="6"
        />
        {editData && (
          <p className="text-xs text-gray-500 mt-1">Để trống nếu không muốn thay đổi mật khẩu</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required={!editData}
          minLength="6"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Vai trò</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="customer">Khách hàng</option>
          <option value="trainer">Huấn luyện viên</option>
          {user && user.role === 'admin' && (
            <>
              <option value="receptionist">Lễ tân</option>
              <option value="admin">Quản lý</option>
            </>
          )}
        </select>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : editData ? 'Cập nhật' : 'Đăng ký'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;