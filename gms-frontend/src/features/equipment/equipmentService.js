import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipment/';

// Get all equipment
const getEquipment = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.data;
};

// Create new equipment
const createEquipment = async (equipmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.post(API_URL, equipmentData, config);
  return response.data.data;
};

// Update equipment
const updateEquipment = async (id, equipmentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.put(API_URL + id, equipmentData, config);
  return response.data.data;
};

// Delete equipment
const deleteEquipment = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const equipmentService = {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};

export default equipmentService;