import axios from 'axios';

const API_URL = 'http://localhost:5000/api/trainers/';

// Get all trainers
const getTrainers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.data;
};

// Get trainer by ID
const getTrainerById = async (trainerId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + trainerId, config);
  return response.data.data;
};

// Request a trainer
const requestTrainer = async (requestData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    API_URL + 'request/' + requestData.trainerId, 
    { message: requestData.message },
    config
  );
  return response.data.data;
};

// Get trainer requests
const getTrainerRequests = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'requests', config);
  return response.data.data;
};

// Respond to trainer request
const respondToRequest = async (responseData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + 'respond/' + responseData.requestId,
    { status: responseData.status },
    config
  );
  return response.data.data;
};

// Get trainer customers
const getTrainerCustomers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'customers', config);
  return response.data.data;
};

// Disconnect from trainer (for customers)
const disconnectTrainer = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + 'disconnect', config);
  return response.data;
};

const trainerService = {
  getTrainers,
  getTrainerById,
  requestTrainer,
  getTrainerRequests,
  respondToRequest,
  getTrainerCustomers,
  disconnectTrainer
};

export default trainerService;