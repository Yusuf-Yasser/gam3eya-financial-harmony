
import axios from 'axios';
import { User, LoginCredentials, RegisterCredentials, UpdateProfileData, ChangePasswordData } from '@/types';

const API_URL = 'http://localhost:3001/api';

// Helper function to set token in local storage
const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Helper function to get token from local storage
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to remove token from local storage
const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Helper function to get current user from local storage
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('current_user');
  return user ? JSON.parse(user) : null;
};

// Helper function to set current user in local storage
const setCurrentUser = (user: User) => {
  localStorage.setItem('current_user', JSON.stringify(user));
};

// Helper function to remove current user from local storage
const removeCurrentUser = () => {
  localStorage.removeItem('current_user');
};

// Add auth token to all requests
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/auth/register`, credentials);
    const { user, token } = response.data;
    setToken(token);
    setCurrentUser(user);
    return user;
  },
  
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { user, token } = response.data;
    setToken(token);
    setCurrentUser(user);
    return user;
  },
  
  logout: () => {
    removeToken();
    removeCurrentUser();
  },
  
  isAuthenticated: (): boolean => {
    return !!getToken() && !!getCurrentUser();
  },
  
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await axios.put(`${API_URL}/users/profile`, data);
    const { user } = response.data;
    
    // Update the stored user data
    setCurrentUser(user);
    
    return user;
  },
  
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await axios.put(`${API_URL}/users/password`, data);
  }
};

export default authApi;
