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

// ... các phương thức khác giữ nguyên

const authService = {
  register,
  login,
  logout,
  // ... các phương thức khác
};

export default authService;