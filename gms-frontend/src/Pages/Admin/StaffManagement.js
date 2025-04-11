import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser, resetPassword } from '../../features/users/userSlice';
import Modal from '../../Components/Modal/modal';
import RegisterForm from '../../Components/User/RegisterForm';
import { toast } from 'react-toastify';

const StaffManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const dispatch = useDispatch();
  const { users, isLoading, isSuccess, isError, message } = useSelector(state => state.users);
  
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);
  
  useEffect(() => {
    if (isSuccess) {
      toast.success('Operation completed successfully');
    }
    
    if (isError) {
      toast.error(message || 'An error occurred');
    }
  }, [isSuccess, isError, message]);
  
  const handleEditStaff = (staff) => {
    setCurrentStaff(staff);
    setShowEditModal(true);
  };
  
  const handleDeleteStaff = (userId) => {
    if (window.confirm('Are you sure you want to delete this staff?')) {
      dispatch(deleteUser(userId));
    }
  };
  
  const handleResetPassword = (staff) => {
    setCurrentStaff(staff);
    setShowResetPasswordModal(true);
  };
  
  const confirmResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    dispatch(resetPassword({
      userId: currentStaff._id,
      password: newPassword
    }));
    
    setShowResetPasswordModal(false);
    setNewPassword('');
  };
  
  // Filter staff (admin and receptionist)
  const staffs = users
    ? users.filter(user => 
        (user.role === 'admin' || user.role === 'receptionist') &&
        (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.phoneNumber?.includes(searchTerm))
      )
    : [];
  
  const ResetPasswordModal = () => (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Reset Password for {currentStaff?.fullName}</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          minLength="6"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowResetPasswordModal(false)}
          className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={confirmResetPassword}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={!newPassword || newPassword.length < 6}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Staff
        </button>
      </div>