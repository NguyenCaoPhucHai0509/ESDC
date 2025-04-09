import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ratings/';

// Get ratings for a user
const getRatings = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + 'user/' + userId, config);
  return response.data.data;
};

// Create rating
const createRating = async (ratingData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, ratingData, config);
  return response.data.data;
};

// Update rating
const updateRating = async (id, ratingData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, ratingData, config);
  return response.data.data;
};

// Delete rating
const deleteRating = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const ratingService = {
  getRatings,
  createRating,
  updateRating,
  deleteRating,
};

export default ratingService;