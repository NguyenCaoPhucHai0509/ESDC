import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTrainerRequests, respondToRequest } from '../../features/trainer/trainerSlice';

const TrainerRequests = () => {
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'accepted', 'rejected'
  
  const dispatch = useDispatch();
  const { trainerRequests, isLoading } = useSelector(state => state.trainers || {});
  
  useEffect(() => {
    dispatch(getTrainerRequests());
  }, [dispatch]);
  
  const handleRespond = (requestId, status) => {
    dispatch(respondToRequest({ requestId, status }));
  };
  
  const filteredRequests = trainerRequests 
    ? trainerRequests.filter(req => filter === 'all' || req.status === filter)
    : [];
  
  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <h1 className="text-2xl font-bold mb-6">Yêu cầu huấn luyện</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('pending')}
          >
            Chờ xử lý
          </button>
          <button
            className={`px-4 py-2 rounded-md ${filter === 'accepted' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('accepted')}
          >
            Đã chấp nhận
          </button>
          <button
            className={`px-4 py-2 rounded-md ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('rejected')}
          >
            Đã từ chối
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Đang tải...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  {request.customer.avatar ? (
                    <img 
                      src={`http://localhost:5000/uploads/${request.customer.avatar}`}
                      alt={request.customer.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span>{request.customer.fullName.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold">{request.customer.fullName}</h3>
                  <p className="text-sm text-gray-500">{request.customer.email}</p>
                </div>
                
                <div className="ml-auto">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : request.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status === 'pending' 
                      ? 'Chờ xử lý' 
                      : request.status === 'accepted' 
                        ? 'Đã chấp nhận' 
                        : 'Đã từ chối'}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded mb-4">
                <p>{request.message}</p>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                Yêu cầu lúc: {new Date(request.createdAt).toLocaleString()}
              </div>
              
              {request.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRespond(request._id, 'accepted')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleRespond(request._id, 'rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerRequests;