import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMemberships, createMembership, updateMembership, deleteMembership } from '../../features/memberships/membershipSlice';
import Modal from '../../Components/Modal/modal';

const MembershipPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    features: ''
  });

  const dispatch = useDispatch();
  const { memberships, isLoading, isError, message } = useSelector(
    (state) => state.memberships
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMemberships());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const membershipData = {
      ...formData,
      features: formData.features.split('\n').filter(feature => feature.trim() !== '')
    };

    if (showEditModal) {
      dispatch(updateMembership({ 
        id: currentMembership._id, 
        membershipData 
      }));
      setShowEditModal(false);
    } else {
      dispatch(createMembership(membershipData));
      setShowAddModal(false);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: '',
      features: ''
    });
  };

  const handleEdit = (membership) => {
    setCurrentMembership(membership);
    setFormData({
      name: membership.name,
      description: membership.description || '',
      duration: membership.duration.toString(),
      price: membership.price.toString(),
      features: membership.features ? membership.features.join('\n') : ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói tập này?')) {
      dispatch(deleteMembership(id));
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên gói</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Thời hạn (tháng)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Tính năng (mỗi dòng một tính năng)</label>
        <textarea
          name="features"
          value={formData.features}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="VD: Tập không giới hạn thời gian&#10;Huấn luyện viên cá nhân&#10;Phòng xông hơi"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showEditModal ? 'Cập nhật' : 'Thêm gói'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Gói Tập</h1>
        
        {(user.role === 'admin' || user.role === 'receptionist') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Thêm gói tập mới
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Đang tải...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberships && memberships.map((membership) => (
            <div 
              key={membership._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="bg-indigo-600 text-white py-4 px-6">
                <h2 className="text-xl font-bold">{membership.name}</h2>
                <p className="text-2xl font-bold mt-2">{membership.price.toLocaleString()} VNĐ</p>
                <p className="text-sm opacity-80">{membership.duration} tháng</p>
              </div>
              
              <div className="p-6">
                {membership.description && (
                  <p className="text-gray-600 mb-4">{membership.description}</p>
                )}
                
                <ul className="space-y-2 mb-6">
                  {membership.features && membership.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {(user.role === 'admin' || user.role === 'receptionist') && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEdit(membership)}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200"
                    >
                      Sửa
                    </button>
                    
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(membership._id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showAddModal && (
        <Modal
          header="Thêm Gói Tập Mới"
          content={renderForm()}
          handleClose={() => setShowAddModal(false)}
        />
      )}
      
      {showEditModal && (
        <Modal
          header={`Chỉnh sửa gói: ${currentMembership?.name}`}
          content={renderForm()}
          handleClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default MembershipPage;