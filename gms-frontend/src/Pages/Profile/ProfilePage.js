import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile, changePassword } from '../../features/auth/authSlice';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    avatar: null
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        avatar: null
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files[0]) {
      setProfileData({
        ...profileData,
        avatar: files[0]
      });
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('fullName', profileData.fullName);
    formData.append('phoneNumber', profileData.phoneNumber);
    formData.append('address', profileData.address);
    
    if (profileData.avatar) {
      formData.append('avatar', profileData.avatar);
    }
    
    dispatch(updateProfile(formData));
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp');
      return;
    }
    
    dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));
    
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <h1 className="text-2xl font-bold mb-6">Thông Tin Cá Nhân</h1>
      
      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{message}</p>
        </div>
      )}
      
      {isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Cập nhật thành công!</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              ) : user?.avatar ? (
                <img 
                  src={`http://localhost:5000/uploads/${user.avatar}`} 
                  alt={user.fullName} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {user?.fullName?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">{user?.fullName}</h2>
              <p className="text-gray-500">{user?.role}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Họ tên</h3>
                  <p>{user?.fullName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{user?.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                  <p>{user?.phoneNumber || '—'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                  <p>{user?.address || '—'}</p>
                </div>
              </div>
              
              <div className="pt-4 flex space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Chỉnh sửa thông tin
                </button>
                
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
                  <input
                    type="file"
                    name="avatar"
                    onChange={handleProfileChange}
                    className="mt-1 block w-full"
                    accept="image/*"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewImage(null);
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Đổi Mật Khẩu</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  minLength="6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="pt-4 flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {user?.role === 'customer' && user?.membershipInfo && (
        <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-4">
            <h2 className="text-xl font-bold">Thông tin gói tập</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gói tập</h3>
                <p>{user.membershipInfo.type?.name || '—'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ngày bắt đầu</h3>
                <p>{user.membershipInfo.startDate ? new Date(user.membershipInfo.startDate).toLocaleDateString() : '—'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ngày kết thúc</h3>
                <p>{user.membershipInfo.endDate ? new Date(user.membershipInfo.endDate).toLocaleDateString() : '—'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                <p className={`${user.membershipInfo.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.membershipInfo.isActive ? 'Đang hoạt động' : 'Hết hạn'}
                </p>
              </div>
            </div>
            
            {user.trainer && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Huấn luyện viên</h3>
                <div className="flex items-center mt-1">
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                    {user.trainer.avatar ? (
                      <img 
                        src={`http://localhost:5000/uploads/${user.trainer.avatar}`} 
                        alt={user.trainer.fullName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {user.trainer.fullName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <span>{user.trainer.fullName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {user?.role === 'trainer' && (
        <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-4">
            <h2 className="text-xl font-bold">Thông tin huấn luyện viên</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Chuyên môn</h3>
                <p>{user.specialization || '—'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Kinh nghiệm</h3>
                <p>{user.experience ? `${user.experience} năm` : '—'}</p>
              </div>
            </div>
            
            {user.customers && user.customers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Khách hàng đang huấn luyện</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.customers.map((customer) => (
                    <div key={customer._id} className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                        {customer.avatar ? (
                          <img 
                            src={`http://localhost:5000/uploads/${customer.avatar}`} 
                            alt={customer.fullName} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {customer.fullName?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <span>{customer.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {user.ratings && user.ratings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Đánh giá</h3>
                <div className="space-y-3">
                  {user.ratings.map((rating) => (
                    <div key={rating._id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                            {rating.from.avatar ? (
                              <img 
                                src={`http://localhost:5000/uploads/${rating.from.avatar}`} 
                                alt={rating.from.fullName} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                {rating.from.fullName?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium">{rating.from.fullName}</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              className={`h-4 w-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{rating.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(rating.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;