import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTrainers } from '../../features/trainer/trainerSlice';
import { getRatings } from '../../features/rating/ratingSlice';
import Modal from '../../Components/Modal/modal';

const TrainerList = () => {
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useDispatch();
  const { trainers, isLoading } = useSelector(state => state.trainers || {});
  const { ratings } = useSelector(state => state.ratings || {});
  
  useEffect(() => {
    dispatch(getTrainers());
  }, [dispatch]);
  
  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
    dispatch(getRatings(trainer._id));
  };
  
  // const handleRequestSubmit = () => {
  //   if (selectedTrainer) {
  //     dispatch(requestTrainer({
  //       trainerId: selectedTrainer._id,
  //       message: requestMessage
  //     }));
  //     setShowRequestModal(false);
  //     setRequestMessage('');
  //     alert('Yêu cầu của bạn đã được gửi đến huấn luyện viên!');
  //   }
  // };
  
  const filteredTrainers = trainers 
    ? trainers.filter(trainer => 
        trainer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  const RequestForm = () => (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Gửi yêu cầu đến huấn luyện viên</h3>
      <div className="mb-4">
        <p className="text-gray-700">Huấn luyện viên: <strong>{selectedTrainer?.fullName}</strong></p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn</label>
        <textarea
          value={requestMessage}
          onChange={(e) => setRequestMessage(e.target.value)}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Nhập lời nhắn của bạn cho huấn luyện viên"
        ></textarea>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowRequestModal(false)}
          className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Hủy
        </button>
        <button
          type="button"
          // onClick={handleRequestSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={!requestMessage.trim()}
        >
          Gửi yêu cầu
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="ml-[25%] p-5 w-[75%]">
      <h1 className="text-2xl font-bold mb-6">Danh sách huấn luyện viên</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc chuyên môn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Đang tải...</p>
            </div>
          ) : filteredTrainers && filteredTrainers.length > 0 ? (
            <div className="space-y-4">
              {filteredTrainers.map(trainer => (
                <div 
                  key={trainer._id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedTrainer && selectedTrainer._id === trainer._id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTrainerSelect(trainer)}
                >
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                      {trainer.avatar ? (
                        <img 
                          src={`http://localhost:5000/uploads/${trainer.avatar}`}
                          alt={trainer.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xl">{trainer.fullName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{trainer.fullName}</h3>
                      {trainer.specialization && (
                        <p className="text-gray-600">{trainer.specialization}</p>
                      )}
                      <div className="flex items-center text-sm mt-1">
                        <span className="mr-1">Đánh giá:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              className={`h-4 w-4 ${
                                i < (trainer.averageRating || 0) 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1">
                            ({trainer.averageRating ? trainer.averageRating.toFixed(1) : '0'})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-gray-500">
              Không tìm thấy huấn luyện viên phù hợp
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2">
          {selectedTrainer ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-indigo-600 text-white p-4">
                <h2 className="text-xl font-bold">{selectedTrainer.fullName}</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {selectedTrainer.bio && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Giới thiệu</h3>
                    <p className="text-gray-600">{selectedTrainer.bio}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Thông tin liên hệ</h3>
                  <p className="text-gray-600">Email: {selectedTrainer.email}</p>
                  {selectedTrainer.phoneNumber && (
                    <p className="text-gray-600">SĐT: {selectedTrainer.phoneNumber}</p>
                  )}
                </div>
                
                {selectedTrainer.specialization && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Chuyên môn</h3>
                    <p className="text-gray-600">{selectedTrainer.specialization}</p>
                  </div>
                )}
                
                {selectedTrainer.experience && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Kinh nghiệm</h3>
                    <p className="text-gray-600">{selectedTrainer.experience} năm</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Đánh giá từ khách hàng</h3>
                  {ratings && ratings.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {ratings.map(rating => (
                        <div key={rating._id} className="border p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                              {rating.from.avatar ? (
                                <img 
                                  src={`http://localhost:5000/uploads/${rating.from.avatar}`}
                                  alt={rating.from.fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs">{rating.from.fullName.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <span className="font-medium">{rating.from.fullName}</span>
                            <div className="flex ml-auto">
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
                          {rating.comment && <p className="text-gray-600">{rating.comment}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có đánh giá nào</p>
                  )}
                </div>
                
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  Yêu cầu huấn luyện
                </button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 flex items-center justify-center h-64 text-gray-500">
              Chọn một huấn luyện viên để xem thông tin chi tiết
            </div>
          )}
        </div>
      </div>
      
      {showRequestModal && (
        <Modal 
          header="Yêu cầu huấn luyện" 
          content={<RequestForm />} 
          handleClose={() => setShowRequestModal(false)} 
        />
      )}
    </div>
  );
};

export default TrainerList;