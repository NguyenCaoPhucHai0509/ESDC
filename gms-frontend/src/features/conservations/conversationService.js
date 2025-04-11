import axios from 'axios';

const API_URL = 'http://localhost:5000/api/conversations/';

// Get conversations
const getConversations = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.data;
};

// Create new conversation (one-on-one)
const createConversation = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, userData, config);
  return response.data.data;
};

// Create group chat
const createGroupChat = async (groupData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + 'group', groupData, config);
  return response.data.data;
};

// Add user to group
const addToGroup = async (groupId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + 'group/' + groupId + '/add', userData, config);
  return response.data.data;
};

// Remove user from group
const removeFromGroup = async (groupId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + 'group/' + groupId + '/remove', userData, config);
  return response.data.data;
};

const conversationService = {
  getConversations,
  createConversation,
  createGroupChat,
  addToGroup,
  removeFromGroup
};

export default conversationService;