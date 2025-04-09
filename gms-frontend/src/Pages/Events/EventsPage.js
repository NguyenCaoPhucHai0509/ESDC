import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, createEvent, updateEvent, deleteEvent, registerForEvent } from '../../features/events/eventSlice';
import Modal from '../../Components/Modal/modal';

const EventsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    image: null
  });

  const dispatch = useDispatch();
  const { events, isLoading, isError, message } = useSelector(
    (state) => state.events
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEvents());
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = new FormData();
    
    // Combine date and time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    eventData.append('title', formData.title);
    eventData.append('description', formData.description);
    eventData.append('startDate', startDateTime.toISOString());
    eventData.append('endDate', endDateTime.toISOString());
    eventData.append('location', formData.location);
    
    if (formData.maxParticipants) {
      eventData.append('maxParticipants', formData.maxParticipants);
    }
    
    if (formData.image) {
      eventData.append('image', formData.image);
    }

    if (showEditModal) {
      dispatch(updateEvent({ 
        id: currentEvent._id, 
        eventData 
      }));
      setShowEditModal(false);
    } else {
      dispatch(createEvent(eventData));
      setShowAddModal(false);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      maxParticipants: '',
      image: null
    });
  };

  const handleEdit = (event) => {
    // Format dates for form inputs
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().split(' ')[0].substring(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().split(' ')[0].substring(0, 5),
      location: event.location || '',
      maxParticipants: event.maxParticipants ? event.maxParticipants.toString() : '',
      image: null
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (event) => {
    setCurrentEvent(event);
    setShowDetailsModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      dispatch(deleteEvent(id));
    }
  };

  const handleRegister = (eventId) => {
    dispatch(registerForEvent(eventId));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserRegistered = (event) => {
    return event.participants && 
           event.participants.some(p => p.user === user._id || p.user?._id === user._id);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tiêu đề sự kiện</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Giờ bắt đầu</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Giờ kết thúc</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Số người tham gia tối đa</label>
        <input
          type="number"
          name="maxParticipants"
          value={formData.maxParticipants}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
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
          {showEditModal ? 'Cập nhật' : 'Tạo sự kiện'}
        </button>
      </div>
    </form>
  );

  const renderEventDetails = () => (
    <div className="space-y-4">
      {currentEvent?.image && (
        <div className="mb-4">
          <img 
            src={`http://localhost:5000/uploads/${currentEvent.image}`} 
            alt={currentEvent.title} 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <h3 className="text-xl font-bold">{currentEvent?.title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Thời gian bắt đầu</h4>
          <p>{formatDateTime(currentEvent?.startDate)}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Thời gian kết thúc</h4>
          <p>{formatDateTime(currentEvent?.endDate)}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500">Địa điểm</h4>
        <p>{currentEvent?.location || '—'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500">Mô tả</h4>
        <p className="whitespace-pre-line">{currentEvent?.description}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500">Người tạo</h4>
        <p>{currentEvent?.organizer?.fullName || '—'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-500">Số người tham gia</h4>
        <p>
          {currentEvent?.participants?.length || 0}
          {currentEvent?.maxParticipants ? ` / ${currentEvent.maxParticipants}` : ''}
        </p>
      </div>
      
      {!isUserRegistered(currentEvent) ? (
        <button
          onClick={() => handleRegister(currentEvent._id)}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full"
        >
          Đăng ký tham gia
        </button>
      ) : (
        <div className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white w-full">
          Đã đăng ký
        </div>
      )}
    </div>
  );

  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sự Kiện</h1>
        
        {user.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Tạo sự kiện mới
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
          {events && events.map((event) => (
            <div 
              key={event._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              {event.image ? (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={`http://localhost:5000/uploads/${event.image}`} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                
                <div className="text-sm text-gray-500 mb-2">
                  <div className="flex items-center mb-1">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location || '—'}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleViewDetails(event)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Xem chi tiết
                  </button>
                  
                  {user.role === 'admin' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showAddModal && (
        <Modal
          header="Tạo Sự Kiện Mới"
          content={renderForm()}
          handleClose={() => setShowAddModal(false)}
        />
      )}
      
      {showEditModal && (
        <Modal
          header={`Chỉnh sửa: ${currentEvent?.title}`}
          content={renderForm()}
          handleClose={() => setShowEditModal(false)}
        />
      )}
      
      {showDetailsModal && (
        <Modal
          header="Chi Tiết Sự Kiện"
          content={renderEventDetails()}
          handleClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default EventsPage;