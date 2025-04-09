import axios from 'axios';

const API_URL = 'http://localhost:5000/api/memberships/';

// Get all memberships
const getMemberships = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

// Create new membership
const createMembership = async (membershipData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, membershipData, config);
  return response.data.data;
};

// Update membership
const updateMembership = async (id, membershipData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + id, membershipData, config);
  return response.data.data;
};

// Delete membership
const deleteMembership = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + id, config);
  return response.data;
};

const membershipService = {
  getMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
};

export default membershipService;