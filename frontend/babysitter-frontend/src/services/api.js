import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (registerData) => {
    const response = await apiClient.post('/auth/register', registerData);
    return response.data;
  },

  login: async (loginData) => {
    const response = await apiClient.post('/auth/login', loginData);
    return response.data;
  },
};

// Nannies services
export const nanniesService = {
  getNannies: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.ciudad) params.append('ciudad', filters.ciudad);
    if (filters.diaSemana) params.append('diaSemana', filters.diaSemana);
    
    const response = await apiClient.get(`/nannies?${params.toString()}`);
    return response.data;
  },

  getNanny: async (id) => {
    const response = await apiClient.get(`/nannies/${id}`);
    return response.data;
  },

  updateProfile: async (nineraId, profileData) => {
    const response = await apiClient.put(`/nannies/${nineraId}/perfil`, profileData);
    return response.data;
  },
};

// Bookings services
export const bookingsService = {
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },

  getUserBookings: async (userId) => {
    const response = await apiClient.get(`/bookings/user/${userId}`);
    return response.data;
  },
};

// Reviews services
export const reviewsService = {
  createReview: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  },

  canReviewReservation: async (reservaId) => {
    const response = await apiClient.get(`/reviews/reservation/${reservaId}/can-review`);
    return response.data;
  },

  getNannyReviews: async (nineraId) => {
    const response = await apiClient.get(`/reviews/nanny/${nineraId}`);
    return response.data;
  },

  getUserReviews: async (userId) => {
    const response = await apiClient.get(`/reviews/user/${userId}`);
    return response.data;
  },
};

export default apiClient;