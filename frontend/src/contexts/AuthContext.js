import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('currentUser');

      if (storedToken && storedUser) {
        try {
          
          const response = await customerAPI.getProfile();
          setCurrentUser(response.data.data.customer);
          setToken(storedToken);
        } catch (error) {
          
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setToken(null);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await customerAPI.login({ email, password });
      const { customer, token: authToken } = response.data.data;

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(customer));

      setCurrentUser(customer);
      setToken(authToken);

      toast.success('Đăng nhập thành công!');
      return { success: true, user: customer };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await customerAPI.register(userData);
      const { customer, token: authToken } = response.data.data;

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(customer));

      setCurrentUser(customer);
      setToken(authToken);

      toast.success('Đăng ký thành công!');
      return { success: true, user: customer };
    } catch (error) {
      let message = 'Đăng ký thất bại';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        message = error.response.data.errors.map(err => err.msg).join(', ');
      }
      
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setToken(null);
    toast.success('Đăng xuất thành công!');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await customerAPI.updateProfile(profileData);
      const updatedCustomer = response.data.data.customer;

      localStorage.setItem('currentUser', JSON.stringify(updatedCustomer));

      setCurrentUser(updatedCustomer);

      toast.success('Cập nhật thông tin thành công!');
      return { success: true, user: updatedCustomer };
    } catch (error) {
      let message = 'Cập nhật thông tin thất bại';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        message = error.response.data.errors.map(err => err.msg).join(', ');
      }
      
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await customerAPI.changePassword(passwordData);
      toast.success('Đổi mật khẩu thành công!');
      return { success: true };
    } catch (error) {
      let message = 'Đổi mật khẩu thất bại';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        message = error.response.data.errors.map(err => err.msg).join(', ');
      }
      
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!(currentUser && token);
  };

  const refreshProfile = async () => {
    try {
      const response = await customerAPI.getProfile();
      const updatedCustomer = response.data.data.customer;
      
      localStorage.setItem('currentUser', JSON.stringify(updatedCustomer));
      setCurrentUser(updatedCustomer);
      
      return updatedCustomer;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
