import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../../features/equipment/equipmentSlice';
import Modal from '../../Components/Modal/modal';

const EquipmentPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    purchaseDate: '',
    cost: '',
    status: 'operational',
    location: '',
    maintenanceSchedule: '',
    serialNumber: '',
    image: null
  });
  const [filter, setFilter] = useState({
    search: '',
    category: '',
    status: ''
  });

  const dispatch = useDispatch();
  const { equipment, isLoading, isError, message } = useSelector(
    (state) => state.equipment
  );

  useEffect(() => {
    dispatch(getEquipment());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setFormData({
        ...formData,
        image: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const equipmentData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        equipmentData.append(key, formData[key]);
      }
    }

    if (showEditModal) {
      dispatch(updateEquipment({ 
        id: currentEquipment._id, 
        equipmentData 
      }));
      setShowEditModal(false);
    } else {
      dispatch(createEquipment(equipmentData));
      setShowAddModal(false);
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      description: '',
      purchaseDate: '',
      cost: '',
      status: 'operational',
      location: '',
      maintenanceSchedule: '',
      serialNumber: '',
      image: null
    });
  };

  const handleEdit = (equipment) => {
    setCurrentEquipment(equipment);
    setFormData({
      name: equipment.name,
      category: equipment.category,
      description: equipment.description || '',
      purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
      cost: equipment.cost ? equipment.cost.toString() : '',
      status: equipment.status,
      location: equipment.location || '',
      maintenanceSchedule: equipment.maintenanceSchedule || '',
      serialNumber: equipment.serialNumber || '',
      image: null
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      dispatch(deleteEquipment(id));
    }
  };

  // Filter equipment
  const filteredEquipment = equipment 
    ? equipment.filter(item => {
        return (
          (filter.search === '' || 
            item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            item.serialNumber?.toLowerCase().includes(filter.search.toLowerCase())) &&
          (filter.category === '' || item.category === filter.category) &&
          (filter.status === '' || item.status === filter.status)
        );
      })
    : [];

  // Get unique categories for filter
  const categories = equipment 
    ? [...new Set(equipment.map(item => item.category))]
    : [];

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên thiết bị</label>
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
          <label className="block text-sm font-medium text-gray-700">Loại thiết bị</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày mua</label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="operational">Hoạt động</option>
            <option value="maintenance">Bảo trì</option>
            <option value="broken">Hỏng</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Vị trí</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Lịch bảo trì</label>
          <input
            type="text"
            name="maintenanceSchedule"
            value={formData.maintenanceSchedule}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="VD: Mỗi 3 tháng"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Số serial</label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
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
        <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          className="mt-1 block w-full"
          accept="image/*"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showEditModal ? 'Cập nhật' : 'Thêm thiết bị'}
        </button>
      </div>
    </form>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'broken':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'Hoạt động';
      case 'maintenance':
        return 'Bảo trì';
      case 'broken':
        return 'Hỏng';
      default:
        return status;
    }
  };

  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Thiết Bị</h1>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Thêm thiết bị mới
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            name="search"
            value={filter.search}
            onChange={handleFilterChange}
            placeholder="Tên thiết bị hoặc mã serial"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại thiết bị</label>
          <select
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tất cả</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Tất cả</option>
            <option value="operational">Hoạt động</option>
            <option value="maintenance">Bảo trì</option>
            <option value="broken">Hỏng</option>
          </select>
        </div>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số serial
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    Không tìm thấy thiết bị nào
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.image ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={`http://localhost:5000/uploads/${item.image}`} 
                              alt={item.name} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">{item.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.purchaseDate && (
                            <div className="text-sm text-gray-500">
                              Mua: {new Date(item.purchaseDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.serialNumber || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showAddModal && (
        <Modal
          header="Thêm Thiết Bị Mới"
          content={renderForm()}
          handleClose={() => setShowAddModal(false)}
        />
      )}
      
      {showEditModal && (
        <Modal
          header={`Chỉnh sửa: ${currentEquipment?.name}`}
          content={renderForm()}
          handleClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default EquipmentPage;