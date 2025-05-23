// Trong file gms-frontend/src/features/auth/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = async (userData) => {
  // Kiểm tra token trong localStorage
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  let response;
  if (token) {
    // Nếu đã đăng nhập, sử dụng API đăng ký có bảo vệ
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    response = await axios.post(API_URL + 'register', userData, config);
  } else {
    // Nếu chưa đăng nhập, sử dụng API đăng ký công khai
    response = await axios.post(API_URL + 'register/public', userData);
  }

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get profile
const getProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'me', config);
  return response.data.data;
};

// Update profile
const updateProfile = async (profileData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.put(API_URL + 'profile', profileData, config);
  return response.data.data;
};

// Change password
const changePassword = async (passwordData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + 'password', passwordData, config);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
};

export default authService;