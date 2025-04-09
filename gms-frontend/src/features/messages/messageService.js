import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages/';

// Get messages
const getMessages = async (conversationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + conversationId, config);
  return response.data.data;
};

// Send message
const sendMessage = async (messageData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, messageData, config);
  return response.data.data;
};

const messageService = {
  getMessages,
  sendMessage,
};

export default messageService;