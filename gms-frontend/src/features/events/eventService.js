import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events/';

// Get all events
const getEvents = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

// Create new event
const createEvent = async (eventData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.post(API_URL, eventData, config);
  return response.data.data;
};

// Update event
const updateEvent = async (id, eventData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.put(API_URL + id, eventData, config);
  return response.data.data;
};

// Delete event
const deleteEvent = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

// Register for event
const registerForEvent = async (eventId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL + eventId + '/register', {}, config);
  return response.data.data;
};

const eventService = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
};

export default eventService;