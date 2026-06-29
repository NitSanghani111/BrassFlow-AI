export const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};
