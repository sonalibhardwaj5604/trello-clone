import axios from 'axios';

const api = axios.create({
  baseURL: 'https://trello-clone-cbo3.onrender.com/api'
});

export default api;