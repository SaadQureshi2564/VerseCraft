// socket.js
const io = require('socket.io-client');

const token = localStorage.getItem('token');
const socket = io('http://localhost:5001', {
  auth: {
    token,
  },
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export default socket;