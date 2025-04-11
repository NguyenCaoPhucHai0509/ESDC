// Trong file gms-frontend/src/Components/Login/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../features/auth/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      // Hiển thị thông báo lỗi
      console.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    const userData = {
      email,
      password
    };

    dispatch(login(userData));
  };

  return (
    <div className='w-full bg-cover flex items-center justify-center h-[calc(100vh-4rem)] bg-[url("https://wallpapercat.com/w/full/4/3/c/874414-1920x1080-desktop-1080p-gym-wallpaper-photo.jpg")]'>
      <div className='w-1/3 p-10 bg-gray-50 bg-opacity-50'>  
        <div className="font-sans text-black text-center text-3xl">Đăng nhập</div>  
        
        {isError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="font-bold">Lỗi: </span>
          <span className="block sm:inline">{message}</span>
        </div>}
        
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            className="w-full my-10 p-2 rounded-lg" 
            placeholder="Nhập email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />  
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              className="w-full mb-10 p-2 pr-10 rounded-lg" 
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span 
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </span>
          </div>
          
          <button
            type="submit"
            className="p-2 w-[80%] border-2 bg-slate-800 mx-auto rounded-lg text-white text-center cursor-pointer hover:bg-white hover:text-black font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;