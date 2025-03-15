import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:11434', //url do chat bot
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de requisição (opcional)
axiosInstance.interceptors.request.use(
  (config) => {
    // Adicione token de autenticação, logs ou outras configurações
    console.log(`Enviando requisição para ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta (opcional)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Resposta recebida de ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
