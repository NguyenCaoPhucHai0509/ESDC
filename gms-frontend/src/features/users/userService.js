import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get all users
const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.data;
};

// Get user by ID
const getUserById = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + userId, config);
  return response.data.data;
};

// Create new user
const createUser = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, userData, config);
  return response.data.data;
};

// Update user
const updateUser = async (userId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + userId, userData, config);
  return response.data.data;
};

// Delete user
const deleteUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + userId, config);
  return response.data;
};

// Reset user password
const resetPassword = async (data, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    API_URL + data.userId + '/reset-password',
    { password: data.password },
    config
  );
  return response.data;
};

// Upload avatar
const uploadAvatar = async (userId, formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.put(
    API_URL + userId + '/avatar',
    formData,
    config
  );
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  uploadAvatar
};

export default userService;